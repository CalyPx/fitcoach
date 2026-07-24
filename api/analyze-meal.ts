import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const MAX_BODY_BYTES = 2 * 1024 * 1024 // ~2MB, matches the client-side downscale target

interface RequestBody {
  imageBase64?: string
  description?: string
}

interface NutritionEstimate {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Server is not configured for meal analysis' })
    return
  }

  const body = req.body as RequestBody
  if (!body || (!body.imageBase64 && !body.description?.trim())) {
    res.status(400).json({ error: 'Provide an image or a description' })
    return
  }

  const approxBytes = (body.imageBase64?.length ?? 0) * 0.75 + (body.description?.length ?? 0)
  if (approxBytes > MAX_BODY_BYTES) {
    res.status(413).json({ error: 'Request too large' })
    return
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const content: Anthropic.MessageParam['content'] = []
    if (body.imageBase64) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: body.imageBase64 },
      })
    }
    content.push({
      type: 'text',
      text: [
        'Estimate the nutrition of this meal.',
        body.description?.trim() ? `The user describes it as: "${body.description.trim()}"` : '',
        'Respond with ONLY a JSON object, no other text, matching exactly this shape:',
        '{"foodLabel": string, "calories": number, "proteinG": number, "carbsG": number, "fatG": number}',
        'All numeric fields are per this single meal/serving, in kcal or grams. Give your best estimate even if uncertain.',
      ]
        .filter(Boolean)
        .join('\n'),
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      messages: [{ role: 'user', content }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      res.status(502).json({ error: 'Unexpected response from AI model' })
      return
    }

    const parsed = extractJson(textBlock.text)
    if (!parsed || !isValidEstimate(parsed)) {
      res.status(502).json({ error: 'Could not parse a valid nutrition estimate' })
      return
    }

    res.status(200).json({
      foodLabel: typeof parsed.foodLabel === 'string' ? parsed.foodLabel : 'Meal',
      estimate: {
        calories: parsed.calories,
        proteinG: parsed.proteinG,
        carbsG: parsed.carbsG,
        fatG: parsed.fatG,
      } satisfies NutritionEstimate,
    })
  } catch (err) {
    console.error('analyze-meal upstream error', err)
    res.status(502).json({ error: 'Meal analysis failed' })
  }
}

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

function isValidEstimate(value: Record<string, unknown>): value is Record<string, unknown> & NutritionEstimate {
  return (
    isFiniteNumber(value.calories) &&
    isFiniteNumber(value.proteinG) &&
    isFiniteNumber(value.carbsG) &&
    isFiniteNumber(value.fatG)
  )
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}
