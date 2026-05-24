import { useState } from 'react'
import { apiClient } from '../utils/api'

interface LeadFormProps {
  auditId: string
  onSuccess?: () => void
}

export default function LeadForm({ auditId, onSuccess }: LeadFormProps) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Email is required')
      return
    }

    setIsLoading(true)
    try {
      await apiClient.submitLead({ auditId, email, company: company || undefined, role: role || undefined })
      setSuccess(true)
      setEmail('')
      setCompany('')
      setRole('')
      onSuccess?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-6 rounded-lg bg-green-50 border border-green-200">
        <h3 className="font-semibold text-green-900 mb-2">✓ Got it!</h3>
        <p className="text-green-700 text-sm">
          Thanks for signing up. We'll notify you when new optimizations are available for your stack.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-1">
          Email <span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          aria-label="Email address"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-slate-900 mb-1">
          Company name <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Acme Inc."
          aria-label="Company name"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-slate-900 mb-1">
          Role <span className="text-slate-400">(optional)</span>
        </label>
        <select
          id="role"
          value={role}
          onChange={e => setRole(e.target.value)}
          aria-label="Your role"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select role...</option>
          <option value="Founder">Founder</option>
          <option value="CEO">CEO</option>
          <option value="CTO">CTO</option>
          <option value="Engineering Manager">Engineering Manager</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
        aria-label="Submit email for notifications"
      >
        {isLoading ? 'Subscribing...' : 'Get notifications'}
      </button>
    </form>
  )
}
