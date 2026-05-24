import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuditState, Recommendation, ToolId, ToolState } from '../types'
import {
  TOOL_DEFINITIONS,
  USE_CASE_OPTIONS,
  calculateAuditSummary,
  copyTextFallback,
  createDefaultAuditState,
  createShareUrl,
  encodeAuditState,
  formatCurrency,
  formatUseCase,
  getPlanOptions,
  normalizeAuditState,
} from '../engine/auditEngine'

const STORAGE_KEY = 'credex-ai-audit-state'

interface AuditAppProps {
  initialState?: AuditState
  viewOnly?: boolean
}

function loadStoredState(): AuditState {
  if (typeof window === 'undefined') {
    return createDefaultAuditState()
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY)

  if (!storedValue) {
    return createDefaultAuditState()
  }

  try {
    return normalizeAuditState(JSON.parse(storedValue) as Partial<AuditState>)
  } catch {
    return createDefaultAuditState()
  }
}

function buildMailto(summaryLabel: string, monthlySavings: number, shareUrl: string): string {
  const subject = encodeURIComponent(`Credex AI spend audit: ${summaryLabel}`)
  const body = encodeURIComponent(
    [
      `I just reviewed an AI stack with estimated monthly savings of ${formatCurrency(monthlySavings)}.`,
      `Share link: ${shareUrl}`,
      '',
      'Please capture this report and follow up with next steps.',
    ].join('\n'),
  )

  return `mailto:hello@credex.ai?subject=${subject}&body=${body}`
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <article className="rec-card">
      <div className="rec-card__head">
        <div>
          <div className="rec-card__title">{recommendation.toolLabel}</div>
          <div className="small-copy">
            Current: {recommendation.currentPlan} · Seats: {recommendation.seats}
          </div>
        </div>
        <div className="rec-card__money">-{formatCurrency(recommendation.monthlySavings)}</div>
      </div>
      <div className="small-copy">{recommendation.rationale}</div>
      <div className="badge-row">
        <span className="badge badge--warning">Switch to {recommendation.recommendedPlan}</span>
        <span className="badge">Target {formatCurrency(recommendation.targetSpend)}/mo</span>
        <span className="badge">Right-size seats to {recommendation.recommendedSeats}</span>
      </div>
    </article>
  )
}

function ToolRow({
  toolId,
  value,
  onChange,
}: {
  toolId: ToolId
  value: ToolState
  onChange: (toolId: ToolId, field: keyof ToolState, nextValue: string | number) => void
}) {
  const definition = TOOL_DEFINITIONS.find((item) => item.id === toolId)

  if (!definition) {
    return null
  }

  return (
    <details className="tool-card">
      <summary className="tool-card__summary">
        <div className="tool-card__head">
          <div>
            <div className="tool-card__title">{definition.label}</div>
            <p className="helper-text">Tap to expand the plan, spend, and seat inputs.</p>
          </div>
          <span className="tool-card__meta">{definition.category === 'api' ? 'API direct' : 'Subscription'}</span>
        </div>
      </summary>

      <div className="tool-card__body">
        <div className="tool-card__grid">
          <label className="field">
            <span className="field__label">Plan</span>
            <select value={value.plan} onChange={(event) => onChange(toolId, 'plan', event.target.value)}>
              {getPlanOptions(toolId).map((planOption) => (
                <option key={planOption} value={planOption}>
                  {planOption}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Monthly spend</span>
            <input
              type="number"
              min="0"
              step="1"
              value={value.monthlySpend}
              onChange={(event) => onChange(toolId, 'monthlySpend', Number(event.target.value))}
              placeholder="0"
            />
          </label>

          <label className="field">
            <span className="field__label">Seats</span>
            <input
              type="number"
              min="1"
              step="1"
              value={value.seats}
              onChange={(event) => onChange(toolId, 'seats', Number(event.target.value))}
              placeholder="1"
            />
          </label>
        </div>
      </div>
    </details>
  )
}

export default function AuditApp({ initialState, viewOnly = false }: AuditAppProps) {
  const navigate = useNavigate()
  const [state, setState] = useState<AuditState>(() => {
    if (initialState) {
      return normalizeAuditState(initialState)
    }

    return loadStoredState()
  })
  const [email, setEmail] = useState('')
  const [captureStatus, setCaptureStatus] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    if (viewOnly || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, viewOnly])

  useEffect(() => {
    if (initialState) {
      setState(normalizeAuditState(initialState))
    }
  }, [initialState])

  const summary = calculateAuditSummary(state)
  const shareUrl = typeof window !== 'undefined' ? createShareUrl(state, window.location.origin) : ''
  const mailtoLink = buildMailto(summary.summaryLabel, summary.monthlySavings, shareUrl)
  const toolCount = state.tools
    ? Object.values(state.tools).filter((tool) => tool.monthlySpend > 0).length
    : 0

  function updateTool(toolId: ToolId, field: keyof ToolState, nextValue: string | number) {
    setState((current) => {
      const currentTool = current.tools[toolId]
      return {
        ...current,
        tools: {
          ...current.tools,
          [toolId]: {
            ...currentTool,
            [field]: field === 'plan' ? String(nextValue) : Math.max(field === 'seats' ? 1 : 0, Number(nextValue)),
          },
        },
      }
    })
  }

  async function handleCopyShareLink() {
    try {
      await copyTextFallback(shareUrl)
      setCopyStatus('Copied the public report link.')
      window.setTimeout(() => setCopyStatus(''), 1800)
    } catch {
      setCopyStatus('Copy failed. Use the link field manually.')
    }
  }

  function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) {
      setCaptureStatus('Enter an email to capture the report.')
      return
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('credex-audit-email', email.trim())
    }

    setCaptureStatus(`Captured ${email.trim()}.`)
  }

  function handleGenerateReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(`/report?r=${encodeURIComponent(encodeAuditState(state))}`)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="topbar__brand" href="/">
          Credex Audit
        </a>
        <a className="button topbar__cta" href="#calculator">
          Start audit
        </a>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Credex AI spend audit</span>
          <h1>Find AI overspend fast.</h1>
          <p>
            Enter the tools you pay for and see the savings estimate instantly. No login, no email gate before the
            value.
          </p>
          <div className="hero__actions">
            <span className="pill pill--accent">No login required</span>
            <span className="pill">Live savings</span>
            <span className="pill">Shareable link</span>
          </div>
          <div className="hero__stats">
            <div className="stat-card">
              <div className="stat-card__label">Monthly spend</div>
              <div className="stat-card__value">{formatCurrency(summary.totalSpend)}</div>
              <div className="stat-card__caption">Across {toolCount} paid tools</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Potential savings</div>
              <div className="stat-card__value">{formatCurrency(summary.monthlySavings)}</div>
              <div className="stat-card__caption">{summary.summaryLabel}</div>
            </div>
          </div>
        </div>

        <aside className="hero__panel">
          <div className="section-title">What it checks</div>
          <p className="small-copy">
            Seat creep, oversized plans, API usage that should be a subscription, and duplicate tools.
          </p>
          <div className="badge-row" style={{ marginTop: '14px' }}>
            <span className="badge badge--danger">Overspend detection</span>
            <span className="badge badge--success">One-click share link</span>
            <span className="badge badge--warning">Email after value</span>
          </div>
          <p className="footer-note">
            Supported tools: Cursor, Copilot, Claude, ChatGPT, Anthropic API direct, OpenAI API direct, Gemini,
            and Windsurf.
          </p>
        </aside>
      </section>

      <section className="workspace">
        {!viewOnly && (
          <section className="panel" id="calculator">
            <div className="panel__header">
              <div>
                <h2 className="section-title">Spend input form</h2>
                <p className="section-subtitle">
                  Fill in the stack you actually pay for. The audit updates as you type and persists across reloads.
                </p>
              </div>
              <span className="badge badge--warning">MVP ready</span>
            </div>

            <form className="form-grid" onSubmit={handleGenerateReport}>
              <div className="form-split">
                <label className="field">
                  <span className="field__label">Team size</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={state.teamSize}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        teamSize: Math.max(1, Number(event.target.value) || 1),
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span className="field__label">Primary use case</span>
                  <select
                    value={state.useCase}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        useCase: event.target.value as AuditState['useCase'],
                      }))
                    }
                  >
                    {USE_CASE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="tool-list">
                {TOOL_DEFINITIONS.map((tool) => (
                  <ToolRow
                    key={tool.id}
                    toolId={tool.id}
                    value={state.tools[tool.id]}
                    onChange={updateTool}
                  />
                ))}
              </div>

              <div className="toolbar">
                <button className="button button--primary" type="submit">
                  Generate public report
                </button>
                <span className="helper-text">Form state stays in local storage until you clear it.</span>
              </div>
            </form>
          </section>
        )}

        <section className="panel" id="results">
          <div className="panel__header">
            <div>
              <h2 className="section-title">Instant audit</h2>
              <p className="section-subtitle">
                {formatUseCase(summary.state.useCase)} team of {summary.state.teamSize}. This view shows what to
                downgrade, switch to, or remove entirely.
              </p>
            </div>
            <span className={`badge ${summary.highSavings ? 'badge--danger' : 'badge--success'}`}>
              {summary.highSavings ? 'High-savings case' : 'Low-friction review'}
            </span>
          </div>

          <div className="report-stack">
            <div className="report-kpis">
              <div className="report-card">
                <div className="report-card__label">Current monthly spend</div>
                <div className="report-card__value">{formatCurrency(summary.totalSpend)}</div>
                <div className="report-card__note">Across all submitted tools</div>
              </div>
              <div className="report-card">
                <div className="report-card__label">Potential monthly savings</div>
                <div className="report-card__value">{formatCurrency(summary.monthlySavings)}</div>
                <div className="report-card__note">Estimated from cheaper plan fits</div>
              </div>
              <div className="report-card">
                <div className="report-card__label">Potential annual savings</div>
                <div className="report-card__value">{formatCurrency(summary.annualSavings)}</div>
                <div className="report-card__note">Value scales fast for larger teams</div>
              </div>
            </div>

            <div className="report-card">
              <div className="report-card__label">Top findings</div>
              {summary.recommendations.length > 0 ? (
                <div className="recommendations" style={{ marginTop: '12px' }}>
                  {summary.recommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.toolId} recommendation={recommendation} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  No obvious overspend with the current inputs. Try adding more tools, higher spend, or extra seats
                  to surface a stronger audit.
                </div>
              )}
            </div>

            <div className="share-box" id="capture">
              <div>
                <div className="report-card__label">Shareable public URL</div>
                <p className="small-copy">
                  The report is encoded into the link so a cold visitor can land directly on the result.
                </p>
              </div>
              <div className="share-box__row">
                <input readOnly value={shareUrl} aria-label="Shareable report URL" />
                <button type="button" className="button" onClick={handleCopyShareLink}>
                  Copy link
                </button>
              </div>
              <div className="copy-feedback">{copyStatus || 'Anyone with the link can view the report.'}</div>
            </div>

            <div className="email-box">
              <div>
                <div className="report-card__label">Capture the report</div>
                <p className="small-copy">
                  Ask for email only after the value is shown. This keeps the gate after the audit, not before it.
                </p>
              </div>
              <form className="email-form" onSubmit={handleReportSubmit}>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <button className="button button--ghost" type="submit">
                  Email me the report
                </button>
              </form>
              <div className="copy-feedback">{captureStatus || 'We only capture this after the audit is visible.'}</div>
            </div>

            {summary.highSavings && (
              <div className="consult-box">
                <div>
                  <div className="report-card__label">Book a Credex consultation</div>
                  <p className="small-copy">
                    This stack is leaving enough money on the table to justify a human review.
                  </p>
                </div>
                <a className="button button--primary" href={mailtoLink}>
                  Book consultation
                </a>
              </div>
            )}
          </div>

          {viewOnly && (
            <div className="toolbar" style={{ marginTop: '16px' }}>
              <a className="button button--primary" href="/">
                Back to calculator
              </a>
              <a className="button" href={mailtoLink}>
                Email the report
              </a>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
