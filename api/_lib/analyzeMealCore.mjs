import Anthropic from '@anthropic-ai/sdk'

const MAX_BODY_BYTES = 2 * 1024 * 1024 // ~2MB, matches the client-side downscale target

/**
 * Shared meal-analysis logic, used by both the Vercel function
 * (api/analyze-meal.ts) and the Vite dev-server middleware (vite.config.ts)
 * so local `npm run dev` and a real deployment behave identically instead
 * of the AI path only working in production.
 *
 * @param {{ imageBase64?: string, description?: string }} body
 * @returns {Promise<{ status: number, body: object }>}
 */
export async function runAnalyzeMeal(body) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { status: 500, body: { error: 'Server is not configured for meal analysis' } }
  }

  if (!body || (!body.imageBase64 && !body.description?.trim())) {
    return { status: 400, body: { error: 'Provide an image or a description' } }
  }

  const approxBytes = (body.imageBase64?.length ?? 0) * 0.75 + (body.description?.length ?? 0)
  if (approxBytes > MAX_BODY_BYTES) {
    return { status: 413, body: { error: 'Request too large' } }
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const content = []
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
    if (!textBlock) {
      return { status: 502, body: { error: 'Unexpected response from AI model' } }
    }

    const parsed = extractJson(textBlock.text)
    if (!parsed || !isValidEstimate(parsed)) {
      return { status: 502, body: { error: 'Could not parse a valid nutrition estimate' } }
    }

    return {
      status: 200,
      body: {
        foodLabel: typeof parsed.foodLabel === 'string' ? parsed.foodLabel : 'Meal',
        estimate: {
          calories: parsed.calories,
          proteinG: parsed.proteinG,
          carbsG: parsed.carbsG,
          fatG: parsed.fatG,
        },
      },
    }
  } catch (err) {
    console.error('analyze-meal upstream error', err)
    return { status: 502, body: { error: 'Meal analysis failed' } }
  }
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

function isValidEstimate(value) {
  return (
    isFiniteNumber(value.calories) &&
    isFiniteNumber(value.proteinG) &&
    isFiniteNumber(value.carbsG) &&
    isFiniteNumber(value.fatG)
  )
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}
