export interface AnalyzeMealBody {
  imageBase64?: string
  description?: string
}

export interface AnalyzeMealResult {
  status: number
  body: Record<string, unknown>
}

export function runAnalyzeMeal(body: AnalyzeMealBody): Promise<AnalyzeMealResult>
