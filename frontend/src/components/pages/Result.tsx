import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import type { AuditResult, Recommendation } from '../../types'
import { apiClient } from '../../utils/api'
import LeadForm from '../LeadForm'
import { formatCurrency } from '../../utils/constants'

export default function Result() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('Invalid audit ID')
      setIsLoading(false)
      return
    }

    const fetchAudit = async () => {
      try {
        setIsLoading(true)
        const result = await apiClient.getAudit(id)
        setAuditResult(result)
        setSummary(result.summary || null)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load audit results. Please try again.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    const fetchSummary = async () => {
      try {
        setIsSummaryLoading(true)
        const result = await apiClient.getSummary(id)
        setSummary(result.summary)
      } catch {
        // Fallback to empty summary if fetch fails
        setIsSummaryLoading(false)
      } finally {
        setIsSummaryLoading(false)
      }
    }

    fetchAudit()
    fetchSummary()
  }, [id])

  const copyToClipboard = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-slate-600 font-medium">Analyzing your stack...</p>
        </div>
      </div>
    )
  }

  if (error || !auditResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-8 border border-red-200 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error loading results</h1>
            <p className="text-slate-600 mb-6">
              {error || 'We couldn\'t load your audit results. Please try again.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              aria-label="Return to home"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalMonthlySavings = auditResult.totalMonthlySavings
  const totalAnnualSavings = auditResult.totalAnnualSavings
  const highSavings = totalMonthlySavings > 500
  const lowSavings = totalMonthlySavings < 100

  // Build meta tags
  const toolNames = auditResult.recommendations
    .map(r => r.tool)
    .join(', ')
  const pageTitle = `I could save ${formatCurrency(totalMonthlySavings)}/month on AI tools — AI Spend Audit`
  const pageDescription = `Review your ${toolNames} spending and save ${formatCurrency(totalAnnualSavings)}/year`

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4"
              aria-label="Back to home"
            >
              ← Back
            </button>
          </div>

          {/* Hero Section - Savings Headline */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 md:p-12 border border-green-200 mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2">
              You could save <span className="text-green-600">{formatCurrency(totalMonthlySavings)}</span>/month
            </h1>
            <p className="text-lg text-slate-700">
              That's <span className="font-bold text-green-600">{formatCurrency(totalAnnualSavings)}/year</span> in annual savings
            </p>
          </div>

          {/* Recommendations Cards */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your recommendations</h2>
            {auditResult.recommendations.length === 0 ? (
              <div className="bg-white rounded-lg p-6 border border-slate-200 text-center">
                <p className="text-slate-600">No optimization opportunities found at this time.</p>
              </div>
            ) : (
              auditResult.recommendations.map((rec: Recommendation, idx: number) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-6 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 md:mb-0">
                      {rec.tool}
                    </h3>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Current spend</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(rec.currentSpend)}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4">{rec.reason}</p>

                  <div className="bg-slate-50 rounded p-4 mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Recommended action</p>
                    <p className="font-semibold text-slate-900">{rec.recommendedAction}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-green-50 border border-green-200">
                    <span className="font-medium text-slate-900">Potential monthly savings</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(rec.savings)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CTA Section - High Savings */}
          {highSavings && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 mb-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-2">
                Ready to save {formatCurrency(totalMonthlySavings)}/month?
              </h3>
              <p className="text-blue-100 mb-6">
                Our team can help you implement these changes and unlock your savings.
              </p>
              <a
                href="https://credex.ai/consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
                aria-label="Book a free consultation to implement savings"
              >
                Book a free consultation →
              </a>
            </div>
          )}

          {/* AI Summary Section */}
          {isSummaryLoading ? (
            <div className="bg-white rounded-lg p-8 border border-slate-200 mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Personalized analysis</h3>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ) : summary ? (
            <div className="bg-white rounded-lg p-8 border border-slate-200 mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Personalized analysis</h3>
              <p className="text-slate-700 leading-relaxed">{summary}</p>
            </div>
          ) : null}

          {/* Email Signup / Optimal Message */}
          {lowSavings || auditResult.recommendations.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-8 border border-slate-200 mb-8 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                ✓ You're spending well on AI tools
              </h3>
              <p className="text-slate-600 mb-6">
                Your current stack is optimized, but new tools and plans come out all the time.
              </p>
              <div className="max-w-md mx-auto">
                <LeadForm auditId={id!} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 border border-slate-200 mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Stay updated on new optimizations
              </h3>
              <p className="text-slate-600 mb-6">
                We'll notify you when new savings opportunities apply to your stack.
              </p>
              <div className="max-w-md">
                <LeadForm auditId={id!} />
              </div>
            </div>
          )}

          {/* Shareable Link */}
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Share this audit</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm text-slate-600 truncate"
                aria-label="Share link"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                aria-label={copied ? 'Link copied!' : 'Copy share link'}
              >
                {copied ? '✓ Copied' : 'Copy link'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
            <p>Made by Credex — the easiest way to optimize your AI spend</p>
          </div>
        </div>
      </div>
    </>
  )
}
