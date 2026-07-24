import { useEffect, useRef, useState } from 'react'
import { DrawingUtils, PoseLandmarker } from '@mediapipe/tasks-vision'
import { usePoseLandmarker } from './usePoseLandmarker'
import { RepEngine, type RepPhase } from './repEngine'
import { HoldEngine } from './holdEngine'
import { FeedbackPicker } from './feedbackPicker'
import { averageAngle, averageSignedDeviation } from './metrics'
import type { ExerciseConfig } from './exercises/types'
import { Spinner } from '@/components/ui/Spinner'

type CameraStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'error'

export type MetricUpdate =
  | { mode: 'rep'; reps: number; phase: RepPhase; angle: number | null; repJustCompleted: boolean }
  | { mode: 'hold'; elapsedGoodSeconds: number; holding: boolean; angle: number | null }

interface PoseDetectorProps {
  exercise: ExerciseConfig
  onMetricUpdate?: (update: MetricUpdate) => void
}

export function PoseDetector({ exercise, onMetricUpdate }: PoseDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const repEngineRef = useRef(exercise.mode === 'rep' ? new RepEngine(exercise.thresholds) : null)
  const holdEngineRef = useRef(exercise.mode === 'hold' ? new HoldEngine(exercise.form.goodFormMinAngle) : null)
  const feedbackPickerRef = useRef(new FeedbackPicker<string>())
  const lastFrameTimeRef = useRef(performance.now())
  const rafRef = useRef<number>(0)
  const fpsRef = useRef({ frames: 0, lastSample: performance.now() })
  const onMetricUpdateRef = useRef(onMetricUpdate)
  onMetricUpdateRef.current = onMetricUpdate

  const { landmarker, loading: modelLoading, error: modelError, retry: retryModel } = usePoseLandmarker()

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle')
  const [reps, setReps] = useState(0)
  const [phase, setPhase] = useState<RepPhase>('top')
  const [elapsedGoodSeconds, setElapsedGoodSeconds] = useState(0)
  const [holding, setHolding] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [angle, setAngle] = useState<number | null>(null)
  const [fps, setFps] = useState(0)
  const [poseVisible, setPoseVisible] = useState(false)
  // Defaults to the 4:3 shape we request from getUserMedia below; corrected
  // once the camera reports its real dimensions, since actual hardware
  // (especially on phones) often ignores the "ideal" hint entirely.
  const [videoAspect, setVideoAspect] = useState(4 / 3)

  useEffect(() => {
    let cancelled = false

    function syncAspectFromVideo() {
      const video = videoRef.current
      if (video && video.videoWidth && video.videoHeight) {
        setVideoAspect(video.videoWidth / video.videoHeight)
      }
    }

    async function startCamera() {
      setCameraStatus('requesting')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.addEventListener('loadedmetadata', syncAspectFromVideo)
          await videoRef.current.play()
          syncAspectFromVideo()
        }
        setCameraStatus('ready')
      } catch (err) {
        if (cancelled) return
        setCameraStatus(
          err instanceof DOMException && err.name === 'NotAllowedError' ? 'denied' : 'error',
        )
      }
    }

    startCamera()

    return () => {
      cancelled = true
      videoRef.current?.removeEventListener('loadedmetadata', syncAspectFromVideo)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!landmarker || cameraStatus !== 'ready') return

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const drawingUtils = new DrawingUtils(ctx)

    function onFrame() {
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(onFrame)
        return
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      const now = performance.now()
      const dtSeconds = Math.min((now - lastFrameTimeRef.current) / 1000, 0.25)
      lastFrameTimeRef.current = now

      const result = landmarker!.detectForVideo(video, now)

      ctx!.save()
      ctx!.clearRect(0, 0, canvas.width, canvas.height)

      const landmarks = result.landmarks[0]
      if (landmarks) {
        setPoseVisible(true)
        drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
          color: '#3ddc84',
          lineWidth: 3,
        })
        drawingUtils.drawLandmarks(landmarks, { color: '#f2f4f3', radius: 3 })

        const w = canvas.width
        const h = canvas.height

        if (exercise.mode === 'rep') {
          const primaryAngle = averageAngle(landmarks, exercise.primaryAngle.left, exercise.primaryAngle.right, w, h)
          setAngle(primaryAngle)
          const next = repEngineRef.current!.update(primaryAngle)
          setReps(next.reps)
          setPhase(next.phase)
          setFeedback(feedbackPickerRef.current.pick(next.feedbackKey, exercise.feedback))
          onMetricUpdateRef.current?.({
            mode: 'rep',
            reps: next.reps,
            phase: next.phase,
            angle: primaryAngle,
            repJustCompleted: next.repJustCompleted,
          })
        } else {
          const formAngle = averageAngle(landmarks, exercise.form.left, exercise.form.right, w, h)
          const deviation = averageSignedDeviation(landmarks, exercise.form.left, exercise.form.right, w, h)
          setAngle(formAngle)
          const next = holdEngineRef.current!.update(formAngle, deviation, dtSeconds)
          setElapsedGoodSeconds(next.elapsedGoodSeconds)
          setHolding(next.holding)
          setFeedback(feedbackPickerRef.current.pick(next.feedbackKey, exercise.feedback))
          onMetricUpdateRef.current?.({
            mode: 'hold',
            elapsedGoodSeconds: next.elapsedGoodSeconds,
            holding: next.holding,
            angle: formAngle,
          })
        }
      } else {
        setPoseVisible(false)
      }

      ctx!.restore()

      fpsRef.current.frames += 1
      if (now - fpsRef.current.lastSample >= 1000) {
        setFps(fpsRef.current.frames)
        fpsRef.current.frames = 0
        fpsRef.current.lastSample = now
      }

      rafRef.current = requestAnimationFrame(onFrame)
    }

    rafRef.current = requestAnimationFrame(onFrame)

    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landmarker, cameraStatus, exercise])

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative w-full max-h-[70dvh] overflow-hidden rounded-lg border border-border bg-bg-elevated"
        style={{ aspectRatio: videoAspect }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        />

        {(cameraStatus !== 'ready' || modelLoading || modelError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/90 p-6 text-center">
            <StatusMessage
              cameraStatus={cameraStatus}
              modelLoading={modelLoading}
              modelError={modelError}
              onRetryModel={retryModel}
            />
          </div>
        )}

        {cameraStatus === 'ready' && !modelLoading && !modelError && !poseVisible && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-bg/80 px-4 py-1.5 text-sm text-fg-muted">
            No person detected — step into frame
          </div>
        )}

        <div className="absolute right-4 top-4 rounded-full bg-bg/80 px-3 py-1 text-xs text-fg-muted">
          {fps} fps
        </div>
      </div>

      {exercise.mode === 'rep' ? (
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Reps" value={String(reps)} />
          <StatTile label="Phase" value={phase} />
          <StatTile label={exercise.primaryAngle.label} value={angle ? `${Math.round(angle)}°` : '—'} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Hold time" value={formatSeconds(elapsedGoodSeconds)} />
          <StatTile label="Form" value={holding ? 'Good' : 'Adjust'} />
        </div>
      )}

      <div className="rounded-lg border border-border bg-bg-elevated p-4 text-center">
        <p className="text-lg font-medium text-fg">{feedback}</p>
      </div>
    </div>
  )
}

function formatSeconds(totalSeconds: number): string {
  const s = Math.floor(totalSeconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-3 text-center">
      <p className="text-xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className="mt-1 text-lg font-semibold capitalize text-fg">{value}</p>
    </div>
  )
}

function StatusMessage({
  cameraStatus,
  modelLoading,
  modelError,
  onRetryModel,
}: {
  cameraStatus: CameraStatus
  modelLoading: boolean
  modelError: string | null
  onRetryModel: () => void
}) {
  if (modelError)
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-danger">Couldn't load the pose model: {modelError}</p>
        <button
          onClick={onRetryModel}
          className="rounded-full border border-border px-4 py-2 text-sm text-fg hover:bg-bg-subtle"
        >
          Retry
        </button>
      </div>
    )
  if (cameraStatus === 'denied')
    return (
      <p className="text-danger">
        Camera access was denied. Allow camera permission for this site and reload.
      </p>
    )
  if (cameraStatus === 'error') return <p className="text-danger">Couldn't access the camera.</p>
  if (cameraStatus === 'requesting')
    return (
      <div className="flex flex-col items-center gap-3">
        <Spinner size={28} />
        <p className="text-fg-muted">Requesting camera access…</p>
      </div>
    )
  if (modelLoading)
    return (
      <div className="flex flex-col items-center gap-3">
        <Spinner size={28} />
        <p className="text-fg-muted">Loading pose model…</p>
      </div>
    )
  return (
    <div className="flex flex-col items-center gap-3">
      <Spinner size={28} />
      <p className="text-fg-muted">Starting camera…</p>
    </div>
  )
}
