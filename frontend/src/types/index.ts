export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed'

export interface ToolEntry {
  tool: string
  plan: string
  seats: number
  monthlySpend: number
}

export interface AuditInput {
  tools: ToolEntry[]
  teamSize: number
  useCase: UseCase
}

export interface Recommendation {
  tool: string
  currentSpend: number
  recommendedAction: string
  savings: number
  reason: string
}

export interface AuditResult {
  id: string
  recommendations: Recommendation[]
  totalMonthlySavings: number
  totalAnnualSavings: number
  summary?: string
}

export interface LeadData {
  auditId: string
  email: string
  company?: string
  role?: string
}
