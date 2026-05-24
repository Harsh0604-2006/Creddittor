export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatUseCaseLabel(useCase: string): string {
  const labels: Record<string, string> = {
    coding: 'Coding',
    writing: 'Writing',
    data: 'Data analysis',
    research: 'Research',
    mixed: 'Mixed use',
  }
  return labels[useCase] || useCase
}

export const TOOL_OPTIONS = [
  'Cursor',
  'GitHub Copilot',
  'Claude',
  'ChatGPT',
  'Gemini',
  'Windsurf',
]

export const PLAN_OPTIONS: Record<string, string[]> = {
  Cursor: ['Hobby', 'Pro', 'Business', 'Enterprise'],
  'GitHub Copilot': ['Individual', 'Business', 'Enterprise'],
  Claude: ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API'],
  ChatGPT: ['Plus', 'Team', 'Enterprise', 'API'],
  Gemini: ['Pro', 'Ultra', 'API'],
  Windsurf: ['Free', 'Pro', 'Teams'],
}

export const USE_CASE_OPTIONS = [
  { value: 'coding', label: 'Coding' },
  { value: 'writing', label: 'Writing' },
  { value: 'data', label: 'Data analysis' },
  { value: 'research', label: 'Research' },
  { value: 'mixed', label: 'Mixed use' },
]
