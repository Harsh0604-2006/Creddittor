import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuditInput, ToolEntry, UseCase } from '../../types'
import { apiClient } from '../../utils/api'
import { PLAN_OPTIONS, TOOL_OPTIONS, USE_CASE_OPTIONS, formatCurrency } from '../../utils/constants'

const STORAGE_KEY = 'credex-audit-form'

export default function Audit() {
  const navigate = useNavigate()
  const [tools, setTools] = useState<ToolEntry[]>([
    { tool: '', plan: '', seats: 1, monthlySpend: 0 },
  ])
  const [teamSize, setTeamSize] = useState(10)
  const [useCase, setUseCase] = useState<UseCase>('mixed')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setTools(data.tools || tools)
        setTeamSize(data.teamSize || teamSize)
        setUseCase(data.useCase || useCase)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tools, teamSize, useCase }),
    )
  }, [tools, teamSize, useCase])

  const handleToolChange = (
    index: number,
    field: keyof ToolEntry,
    value: string | number,
  ) => {
    const updated = [...tools]
    updated[index] = { ...updated[index], [field]: value }

    // Reset plan when tool changes
    if (field === 'tool') {
      updated[index].plan = ''
    }

    setTools(updated)
  }

  const addTool = () => {
    setTools([...tools, { tool: '', plan: '', seats: 1, monthlySpend: 0 }])
  }

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    const filledTools = tools.filter(t => t.tool && t.plan && t.monthlySpend > 0)
    if (filledTools.length === 0) {
      setError('Please add at least one AI tool with a plan and spending amount')
      return
    }

    setIsLoading(true)
    try {
      const input: AuditInput = {
        tools: filledTools,
        teamSize,
        useCase,
      }

      const result = await apiClient.submitAudit(input)
      localStorage.removeItem(STORAGE_KEY)
      navigate(`/result/${result.id}`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to run audit. Please try again.',
      )
      setIsLoading(false)
    }
  }

  const totalSpend = tools.reduce((sum, tool) => sum + tool.monthlySpend, 0)
  const filledTools = tools.filter(t => t.tool && t.plan && t.monthlySpend > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4"
            aria-label="Back to home"
          >
            ← Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Tell us about your AI stack
          </h1>
          <p className="text-slate-600">
            Add each tool your team uses and we'll identify overspending opportunities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {error && (
            <div
              className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Team Size */}
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <label htmlFor="teamSize" className="block font-semibold text-slate-900 mb-2">
              Team size
            </label>
            <input
              id="teamSize"
              type="number"
              min="1"
              max="10000"
              value={teamSize}
              onChange={e => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              aria-label="Number of team members"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Use Case */}
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <label htmlFor="useCase" className="block font-semibold text-slate-900 mb-2">
              Primary use case
            </label>
            <select
              id="useCase"
              value={useCase}
              onChange={e => setUseCase(e.target.value as UseCase)}
              aria-label="Primary use case for AI tools"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {USE_CASE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Your AI tools</h2>
            {tools.map((tool, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-600">Tool {index + 1}</span>
                  {tools.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTool(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                      aria-label={`Remove tool ${index + 1}`}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Tool Name */}
                <div>
                  <label
                    htmlFor={`tool-${index}`}
                    className="block text-sm font-medium text-slate-900 mb-1"
                  >
                    Tool name
                  </label>
                  <select
                    id={`tool-${index}`}
                    value={tool.tool}
                    onChange={e => handleToolChange(index, 'tool', e.target.value)}
                    aria-label={`Tool name for item ${index + 1}`}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a tool...</option>
                    {TOOL_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plan */}
                {tool.tool && (
                  <div>
                    <label
                      htmlFor={`plan-${index}`}
                      className="block text-sm font-medium text-slate-900 mb-1"
                    >
                      Plan
                    </label>
                    <select
                      id={`plan-${index}`}
                      value={tool.plan}
                      onChange={e => handleToolChange(index, 'plan', e.target.value)}
                      aria-label={`Plan for ${tool.tool} at item ${index + 1}`}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a plan...</option>
                      {PLAN_OPTIONS[tool.tool]?.map(plan => (
                        <option key={plan} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Seats */}
                <div>
                  <label
                    htmlFor={`seats-${index}`}
                    className="block text-sm font-medium text-slate-900 mb-1"
                  >
                    Number of seats
                  </label>
                  <input
                    id={`seats-${index}`}
                    type="number"
                    min="1"
                    max="1000"
                    value={tool.seats}
                    onChange={e =>
                      handleToolChange(index, 'seats', Math.max(1, parseInt(e.target.value) || 1))
                    }
                    aria-label={`Number of seats for ${tool.tool || 'this tool'} at item ${index + 1}`}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Monthly Spend */}
                <div>
                  <label
                    htmlFor={`spend-${index}`}
                    className="block text-sm font-medium text-slate-900 mb-1"
                  >
                    Monthly spend (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-600">$</span>
                    <input
                      id={`spend-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      max="100000"
                      value={tool.monthlySpend}
                      onChange={e =>
                        handleToolChange(
                          index,
                          'monthlySpend',
                          Math.max(0, parseFloat(e.target.value) || 0),
                        )
                      }
                      aria-label={`Monthly spending for ${tool.tool || 'this tool'} at item ${index + 1}`}
                      className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add Tool Button */}
            <button
              type="button"
              onClick={addTool}
              className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-700 font-medium hover:border-slate-400 hover:bg-slate-50 transition-colors"
              aria-label="Add another AI tool"
            >
              + Add tool
            </button>
          </div>

          {/* Spending Summary */}
          {filledTools.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Total monthly spend</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalSpend)}
                </span>
              </div>
              <div className="text-sm text-slate-600 mt-2">
                Annual equivalent: {formatCurrency(totalSpend * 12)}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || filledTools.length === 0}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            aria-label="Run audit of my AI spending"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin">⏳</span> Analyzing your stack...
              </>
            ) : (
              'Run Audit'
            )}
          </button>

          {/* Form Help */}
          <p className="text-center text-sm text-slate-600">
            We'll analyze your stack and provide personalized recommendations in under a minute.
          </p>
        </form>
      </div>
    </div>
  )
}
