import type { AuditState, AuditSummary, Recommendation, ToolId, ToolState, UseCase } from '../types'

interface PlanConfig {
  label: string
  price: number
}

interface ToolDefinition {
  id: ToolId
  label: string
  category: 'subscription' | 'api'
  plans: PlanConfig[]
  defaultPlan: string
}

const DISPLAY_ORDER: ToolId[] = [
  'cursor',
  'copilot',
  'claude',
  'chatgpt',
  'anthropicApi',
  'openaiApi',
  'gemini',
  'windsurf',
]

export const USE_CASE_OPTIONS: Array<{ value: UseCase; label: string }> = [
  { value: 'coding', label: 'Coding' },
  { value: 'writing', label: 'Writing' },
  { value: 'data', label: 'Data' },
  { value: 'research', label: 'Research' },
  { value: 'mixed', label: 'Mixed' },
]

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 'cursor',
    label: 'Cursor',
    category: 'subscription',
    defaultPlan: 'Pro',
    plans: [
      { label: 'Hobby', price: 0 },
      { label: 'Pro', price: 20 },
      { label: 'Business', price: 40 },
      { label: 'Enterprise', price: 120 },
    ],
  },
  {
    id: 'copilot',
    label: 'GitHub Copilot',
    category: 'subscription',
    defaultPlan: 'Individual',
    plans: [
      { label: 'Individual', price: 10 },
      { label: 'Business', price: 19 },
      { label: 'Enterprise', price: 39 },
    ],
  },
  {
    id: 'claude',
    label: 'Claude',
    category: 'subscription',
    defaultPlan: 'Pro',
    plans: [
      { label: 'Free', price: 0 },
      { label: 'Pro', price: 20 },
      { label: 'Max', price: 100 },
      { label: 'Team', price: 30 },
      { label: 'Enterprise', price: 60 },
      { label: 'API direct', price: 0 },
    ],
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    category: 'subscription',
    defaultPlan: 'Plus',
    plans: [
      { label: 'Plus', price: 20 },
      { label: 'Team', price: 30 },
      { label: 'Enterprise', price: 60 },
      { label: 'API direct', price: 0 },
    ],
  },
  {
    id: 'anthropicApi',
    label: 'Anthropic API direct',
    category: 'api',
    defaultPlan: 'API direct',
    plans: [{ label: 'API direct', price: 0 }],
  },
  {
    id: 'openaiApi',
    label: 'OpenAI API direct',
    category: 'api',
    defaultPlan: 'API direct',
    plans: [{ label: 'API direct', price: 0 }],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    category: 'subscription',
    defaultPlan: 'Pro',
    plans: [
      { label: 'Pro', price: 20 },
      { label: 'Ultra', price: 50 },
      { label: 'API', price: 0 },
    ],
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    category: 'subscription',
    defaultPlan: 'Pro',
    plans: [
      { label: 'Free', price: 0 },
      { label: 'Pro', price: 15 },
      { label: 'Teams', price: 30 },
      { label: 'Enterprise', price: 80 },
    ],
  },
]

function clampNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function cleanString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function getToolDefinition(toolId: ToolId): ToolDefinition {
  return TOOL_DEFINITIONS.find((definition) => definition.id === toolId) ?? TOOL_DEFINITIONS[0]
}

export function getToolLabel(toolId: ToolId): string {
  return getToolDefinition(toolId).label
}

export function createDefaultToolState(toolId: ToolId): ToolState {
  const definition = getToolDefinition(toolId)
  return {
    plan: definition.defaultPlan,
    monthlySpend: 0,
    seats: 1,
  }
}

export function createDefaultAuditState(): AuditState {
  const tools = DISPLAY_ORDER.reduce((accumulator, toolId) => {
    accumulator[toolId] = createDefaultToolState(toolId)
    return accumulator
  }, {} as Record<ToolId, ToolState>)

  return {
    teamSize: 3,
    useCase: 'coding',
    tools,
  }
}

function normalizeToolState(toolId: ToolId, value: Partial<ToolState> | undefined): ToolState {
  const definition = getToolDefinition(toolId)
  return {
    plan: cleanString(value?.plan, definition.defaultPlan),
    monthlySpend: Math.max(0, clampNumber(value?.monthlySpend, 0)),
    seats: Math.max(1, Math.round(clampNumber(value?.seats, 1))),
  }
}

export function normalizeAuditState(value: Partial<AuditState> | undefined): AuditState {
  const defaults = createDefaultAuditState()
  const tools = DISPLAY_ORDER.reduce((accumulator, toolId) => {
    accumulator[toolId] = normalizeToolState(toolId, value?.tools?.[toolId])
    return accumulator
  }, {} as Record<ToolId, ToolState>)

  return {
    teamSize: Math.max(1, Math.round(clampNumber(value?.teamSize, defaults.teamSize))),
    useCase: (USE_CASE_OPTIONS.some((option) => option.value === value?.useCase)
      ? value?.useCase
      : defaults.useCase) as UseCase,
    tools,
  }
}

export function getPlanOptions(toolId: ToolId): string[] {
  return getToolDefinition(toolId).plans.map((plan) => plan.label)
}

export function getPlanPrice(toolId: ToolId, planLabel: string): number {
  const definition = getToolDefinition(toolId)
  const matchedPlan = definition.plans.find((plan) => plan.label === planLabel)
  return matchedPlan?.price ?? definition.plans[0]?.price ?? 0
}

function getOptimalPlan(toolId: ToolId, state: AuditState): string {
  const teamSize = state.teamSize
  const useCase = state.useCase

  switch (toolId) {
    case 'cursor':
      if (teamSize <= 1) return 'Pro'
      if (teamSize <= 5) return 'Business'
      return 'Enterprise'
    case 'copilot':
      if (teamSize <= 1) return 'Individual'
      if (teamSize <= 5) return 'Business'
      return 'Enterprise'
    case 'claude':
      if (teamSize <= 1) return useCase === 'research' || useCase === 'writing' ? 'Pro' : 'Pro'
      if (teamSize <= 5) return 'Team'
      return 'Enterprise'
    case 'chatgpt':
      if (teamSize <= 1) return 'Plus'
      if (teamSize <= 5) return 'Team'
      return 'Enterprise'
    case 'anthropicApi':
      if (teamSize <= 1) return 'Claude Pro'
      if (teamSize <= 5) return 'Claude Team'
      return 'Claude Enterprise'
    case 'openaiApi':
      if (teamSize <= 1) return 'ChatGPT Plus'
      if (teamSize <= 5) return 'ChatGPT Team'
      return 'ChatGPT Enterprise'
    case 'gemini':
      if (teamSize <= 1) return 'Pro'
      if (teamSize <= 5) return 'Ultra'
      return 'API'
    case 'windsurf':
      if (teamSize <= 1) return 'Pro'
      if (teamSize <= 5) return 'Teams'
      return 'Enterprise'
  }
}

function getTargetPrice(toolId: ToolId, planLabel: string): number {
  switch (toolId) {
    case 'anthropicApi':
      return getPlanPrice('claude', planLabel.replace('Claude ', ''))
    case 'openaiApi':
      return getPlanPrice('chatgpt', planLabel.replace('ChatGPT ', ''))
    default:
      return getPlanPrice(toolId, planLabel)
  }
}

function getRationale(toolId: ToolId, state: AuditState, currentPlan: string, recommendedPlan: string): string {
  if (toolId === 'anthropicApi' || toolId === 'openaiApi') {
    return state.useCase === 'coding'
      ? 'Your team is paying API rates where a smaller subscription bundle would cover the same workload.'
      : 'This workload looks better served by a lower-friction subscription tier than raw API usage.'
  }

  if (currentPlan === recommendedPlan) {
    return 'The current plan is already close to the cheapest sensible fit for this team size.'
  }

  if (state.teamSize <= 1) {
    return 'A solo operator usually does not need the business tier.'
  }

  if (state.teamSize <= 5) {
    return 'A small team can usually stay on the mid-tier plan without the enterprise markup.'
  }

  return 'The enterprise tier only makes sense once seat sprawl or compliance pressure is real.'
}

function buildRecommendation(toolId: ToolId, state: AuditState): Recommendation | null {
  const toolState = state.tools[toolId]
  const currentSpend = Math.max(0, toolState.monthlySpend)

  if (currentSpend <= 0) {
    return null
  }

  const recommendedPlan = getOptimalPlan(toolId, state)
  const recommendedSeats = Math.max(1, Math.min(Math.round(toolState.seats || 1), Math.round(state.teamSize || 1)))
  const targetSpend = getTargetPrice(toolId, recommendedPlan) * recommendedSeats
  const monthlySavings = Math.max(0, currentSpend - targetSpend)

  if (monthlySavings <= 1) {
    return null
  }

  return {
    toolId,
    toolLabel: getToolLabel(toolId),
    currentPlan: toolState.plan,
    recommendedPlan,
    currentSpend,
    targetSpend,
    monthlySavings,
    seats: toolState.seats,
    recommendedSeats,
    rationale: getRationale(toolId, state, toolState.plan, recommendedPlan),
  }
}

export function calculateAuditSummary(state: AuditState): AuditSummary {
  const normalizedState = normalizeAuditState(state)
  const recommendations = DISPLAY_ORDER
    .map((toolId) => buildRecommendation(toolId, normalizedState))
    .filter((recommendation): recommendation is Recommendation => recommendation !== null)
    .sort((left, right) => right.monthlySavings - left.monthlySavings)

  const totalSpend = DISPLAY_ORDER.reduce((sum, toolId) => sum + normalizedState.tools[toolId].monthlySpend, 0)
  const monthlySavings = recommendations.reduce((sum, recommendation) => sum + recommendation.monthlySavings, 0)
  const annualSavings = monthlySavings * 12
  const highSavings = monthlySavings >= 150
  const summaryLabel = monthlySavings > 0 ? 'Immediate cuts found' : 'No obvious overspend'

  return {
    state: normalizedState,
    totalSpend,
    monthlySavings,
    annualSavings,
    recommendations,
    highSavings,
    summaryLabel,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

export function formatUseCase(value: UseCase): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function encodeAuditState(state: AuditState): string {
  const json = JSON.stringify(normalizeAuditState(state))
  const bytes = new TextEncoder().encode(json)
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '')
}

export function decodeAuditState(token: string): AuditState | null {
  try {
    const normalized = token.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<AuditState>
    return normalizeAuditState(parsed)
  } catch {
    return null
  }
}

export function createShareUrl(state: AuditState, origin: string): string {
  const reportToken = encodeAuditState(state)
  return `${origin.replace(/\/$/, '')}/report?r=${encodeURIComponent(reportToken)}`
}

export function copyTextFallback(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value)
  }

  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea')
    textArea.value = value
    textArea.setAttribute('readonly', 'true')
    textArea.style.position = 'absolute'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()

    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      resolve()
    } catch (error) {
      document.body.removeChild(textArea)
      reject(error)
    }
  })
}
