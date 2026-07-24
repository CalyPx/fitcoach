import type { NutritionEstimate } from '@/types'

export interface AnalyzeMealRequest {
  imageBase64?: string
  description?: string
}

export interface AnalyzeMealResult {
  foodLabel: string
  estimate: NutritionEstimate
}

/**
 * Calls the /api/analyze-meal serverless function. Throws on any failure —
 * callers are expected to fall back to manual entry rather than surface
 * a hard error, since the function only exists once deployed (or under
 * `vercel dev`) and is expected to be unreachable during plain `vite dev`.
 */
export async function analyzeMeal(req: AnalyzeMealRequest): Promise<AnalyzeMealResult> {
  const res = await fetch('/api/analyze-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`analyze-meal failed with status ${res.status}`)
  }

  const data = await res.json()
  if (
    !data ||
    typeof data.foodLabel !== 'string' ||
    typeof data.estimate !== 'object' ||
    !isFiniteNumber(data.estimate.calories) ||
    !isFiniteNumber(data.estimate.proteinG) ||
    !isFiniteNumber(data.estimate.carbsG) ||
    !isFiniteNumber(data.estimate.fatG)
  ) {
    throw new Error('analyze-meal returned an unexpected response shape')
  }

  return data as AnalyzeMealResult
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Downscales an image file to a small JPEG data URL, bounding both upload size and localStorage growth. */
export function downscaleImageToJpeg(file: File, maxDimension = 512, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(objectUrl)
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not load image'))
    }
    img.src = objectUrl
  })
}
