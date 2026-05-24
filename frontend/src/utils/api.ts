import type { AuditInput, AuditResult, LeadData } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const apiClient = {
  async submitAudit(input: AuditInput): Promise<{ id: string }> {
    const response = await fetch(`${API_URL}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error('Failed to submit audit')
    }

    return response.json()
  },

  async getAudit(id: string): Promise<AuditResult> {
    const response = await fetch(`${API_URL}/audit/${id}`)

    if (!response.ok) {
      throw new Error('Failed to fetch audit results')
    }

    return response.json()
  },

  async getSummary(id: string): Promise<{ summary: string }> {
    const response = await fetch(`${API_URL}/summary/${id}`)

    if (!response.ok) {
      throw new Error('Failed to fetch summary')
    }

    return response.json()
  },

  async submitLead(data: LeadData): Promise<void> {
    const response = await fetch(`${API_URL}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to submit lead')
    }
  },
}
