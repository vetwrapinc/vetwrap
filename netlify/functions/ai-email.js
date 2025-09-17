const { json, verifyPortalToken } = require('./_auth')

const DEFAULT_MODEL = process.env.AI_EMAIL_MODEL || 'gpt-4o-mini'
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' })
  }

  let session
  try {
    session = verifyPortalToken(event, { allowRoles: ['admin', 'employee'] })
  } catch (err) {
    return json(401, { error: err.message || 'Unauthorized' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  const recipient = String(body.recipient || '').trim()
  const subject = String(body.subject || '').trim()
  const context = String(body.context || '').trim()
  const tone = String(body.tone || 'professional').trim()
  const length = String(body.length || 'medium').trim()

  if (!context) {
    return json(400, { error: 'Context is required' })
  }

  const prompt = buildPrompt({ recipient, subject, context, tone, length })

  const apiKey = process.env.AI_EMAIL_API_KEY || process.env.OPENAI_API_KEY
  if (apiKey) {
    try {
      const completion = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          temperature: 0.7,
          messages: [
            { role: 'system', content: 'You are an assistant that drafts polished client emails for a design studio.' },
            { role: 'user', content: prompt },
          ],
        }),
      })

      if (completion.ok) {
        const data = await completion.json()
        const draft = data?.choices?.[0]?.message?.content?.trim()
        if (draft) {
          return json(200, { draft, provider: 'openai' })
        }
      } else {
        const detail = await completion.text()
        console.warn('AI email provider error', detail)
      }
    } catch (err) {
      console.warn('AI email provider request failed', err)
    }
  }

  const fallback = fallbackDraft({ recipient, subject, context, tone, length })
  return json(200, { draft: fallback, provider: apiKey ? 'fallback' : 'local' })
}

function buildPrompt({ recipient, subject, context, tone, length }) {
  const lines = []
  if (recipient) lines.push(`Recipient: ${recipient}`)
  if (subject) lines.push(`Subject: ${subject}`)
  lines.push(`Tone: ${tone}`)
  lines.push(`Length: ${length}`)
  lines.push('Context:')
  lines.push(context)
  lines.push('---')
  lines.push('Compose a complete email response that reflects the requested tone. Include a clear call to action when appropriate and keep the writing concise and human.')
  return lines.join('\n')
}

function fallbackDraft({ recipient, subject, context, tone, length }) {
  const greetings = {
    professional: recipient ? `Hello ${recipient},` : 'Hello there,',
    friendly: recipient ? `Hey ${recipient}!` : 'Hey there!',
    urgent: recipient ? `Hi ${recipient},` : 'Hi there,',
    celebratory: recipient ? `Hi ${recipient},` : 'Hi there,',
  }
  const closings = {
    professional: 'Best regards,\nThe VetWraps Team',
    friendly: 'Talk soon,\nThe VetWraps Team',
    urgent: 'Thank you for your quick attention,\nThe VetWraps Team',
    celebratory: 'Congrats again!\nThe VetWraps Team',
  }

  const greeting = greetings[tone] || greetings.professional
  const closing = closings[tone] || closings.professional

  const summary = summariseContext(context, length)
  const subjectLine = subject || suggestSubject(context, tone)

  return `Subject: ${subjectLine}\n\n${greeting}\n\n${summary}\n\n${closing}`
}

function summariseContext(context, length) {
  const trimmed = context.replace(/\s+/g, ' ').trim()
  const words = trimmed.split(' ')
  let target = 120
  if (length === 'brief') target = 60
  if (length === 'detailed') target = 180
  if (words.length <= target) return trimmed
  return words.slice(0, target).join(' ') + '…'
}

function suggestSubject(context, tone) {
  const base = context.replace(/\s+/g, ' ').trim().slice(0, 80)
  if (!base) return 'Project Update from VetWraps'
  if (tone === 'urgent') return `Urgent: ${base}`
  if (tone === 'celebratory') return `Great news: ${base}`
  return `Quick update: ${base}`
}
