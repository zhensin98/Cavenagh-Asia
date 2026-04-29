import { DEMO_FINDINGS, DEMO_STATEMENT, DEMO_SCRIPTS } from './demoData'

const BASE_URL = import.meta.env.VITE_API_URL
  ?? (window.location.hostname === 'localhost' ? 'http://localhost:8000' : null)

async function tryFetch(url, options) {
  if (!BASE_URL) throw new Error('no backend')
  const res = await fetch(`${BASE_URL}${url}`, options)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export async function runAudit() {
  try {
    return await tryFetch('/audit', { method: 'POST' })
  } catch {
    // Backend not available — return hardcoded demo data
    return { statement: DEMO_STATEMENT, findings: DEMO_FINDINGS }
  }
}

export async function fetchScript(finding, tone) {
  try {
    return await tryFetch('/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finding, tone }),
    })
  } catch {
    // Backend not available — return hardcoded demo script
    const script = DEMO_SCRIPTS[finding.category]
    if (script) return script
    return {
      explanation: finding.summary,
      questions: [finding.suggested_question],
      meeting_script: `Regarding: ${finding.title}\n\n${finding.summary}\n\nSuggested question: "${finding.suggested_question}"`,
      email_draft: `Dear [Relationship Manager],\n\nI would like to discuss the following observation from my recent statement audit:\n\n${finding.summary}\n\nSpecifically: "${finding.suggested_question}"\n\nKind regards,\n[Client Name]`,
    }
  }
}

export async function uploadDocument(file) {
  if (!BASE_URL) throw new Error('PDF upload requires the local Python server. Please run: uvicorn main:app --port 8000')
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: form })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail?.detail ?? `Upload failed (${res.status}). Is the Python server running?`)
  }
  return res.json()
}
