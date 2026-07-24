import { useCallback, useEffect, useState } from 'react'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'

const WASM_BASE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'

// Lite variant: smallest/fastest of the three PoseLandmarker models — traded
// accuracy for speed since a mid-range laptop webcam needs to hold 20+ fps.
const MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

// GPU delegate init can hang indefinitely on machines with broken/missing
// WebGL2 support instead of rejecting — without a timeout there's no way to
// detect that and fall back to CPU, so every stage gets a hard deadline.
const FILESET_TIMEOUT_MS = 15000
const GPU_CREATE_TIMEOUT_MS = 8000
const CPU_CREATE_TIMEOUT_MS = 20000

interface PoseLandmarkerState {
  landmarker: PoseLandmarker | null
  loading: boolean
  error: string | null
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

export function usePoseLandmarker(): PoseLandmarkerState & { retry: () => void } {
  const [state, setState] = useState<PoseLandmarkerState>({
    landmarker: null,
    loading: true,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    let instance: PoseLandmarker | null = null

    async function init() {
      setState({ landmarker: null, loading: true, error: null })

      let vision
      try {
        console.info('[pose-detection] loading vision wasm runtime from', WASM_BASE_URL)
        vision = await withTimeout(
          FilesetResolver.forVisionTasks(WASM_BASE_URL),
          FILESET_TIMEOUT_MS,
          'Loading vision runtime (wasm)',
        )
      } catch (err) {
        console.error('[pose-detection] failed to load vision wasm runtime:', err)
        if (!cancelled) {
          setState({ landmarker: null, loading: false, error: describeError(err) })
        }
        return
      }

      try {
        console.info('[pose-detection] creating PoseLandmarker with GPU delegate')
        instance = await withTimeout(
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_ASSET_URL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numPoses: 1,
          }),
          GPU_CREATE_TIMEOUT_MS,
          'Creating PoseLandmarker (GPU)',
        )
        console.info('[pose-detection] GPU delegate ready')
      } catch (gpuErr) {
        console.warn('[pose-detection] GPU delegate failed, falling back to CPU:', gpuErr)
        try {
          console.info('[pose-detection] creating PoseLandmarker with CPU delegate')
          instance = await withTimeout(
            PoseLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetPath: MODEL_ASSET_URL, delegate: 'CPU' },
              runningMode: 'VIDEO',
              numPoses: 1,
            }),
            CPU_CREATE_TIMEOUT_MS,
            'Creating PoseLandmarker (CPU)',
          )
          console.info('[pose-detection] CPU delegate ready')
        } catch (cpuErr) {
          console.error('[pose-detection] CPU delegate also failed:', cpuErr)
          if (!cancelled) {
            setState({ landmarker: null, loading: false, error: describeError(cpuErr) })
          }
          return
        }
      }

      if (cancelled) {
        instance?.close()
        return
      }
      setState({ landmarker: instance, loading: false, error: null })
    }

    init()

    return () => {
      cancelled = true
      instance?.close()
    }
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, retry }
}
