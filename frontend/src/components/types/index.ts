export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed'

export type ToolId =
  | 'cursor'
  | 'copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropicApi'
  | 'openaiApi'
  | 'gemini'
  | 'windsurf'

export interface ToolState {
  plan: string
  monthlySpend: number
  seats: number
}

export interface AuditState {
  teamSize: number
  useCase: UseCase
  tools: Record<ToolId, ToolState>
}

export interface Recommendation {
  toolId: ToolId
  toolLabel: string
  currentPlan: string
  recommendedPlan: string
  currentSpend: number
  targetSpend: number
  monthlySavings: number
  seats: number
  recommendedSeats: number
  rationale: string
}

export interface AuditSummary {
  state: AuditState
  totalSpend: number
  monthlySavings: number
  annualSavings: number
  recommendations: Recommendation[]
  highSavings: boolean
  summaryLabel: string
}
