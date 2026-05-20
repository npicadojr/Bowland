import {
  CHATBOT_PROMPT,
  MAX_INPUT_CHARS,
  extractResponse,
  normalizeHistory,
} from '../lib/chatContext.js'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const MAX_OUTPUT_TOKENS = 90
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed.' })
    return
  }

  if (!OPENAI_API_KEY) {
    response.status(503).json({
      error: 'OPENAI_API_KEY is not configured on the server.',
    })
    return
  }

  try {
    const body = request.body || {}
    const message = String(body.message || '').trim().slice(0, MAX_INPUT_CHARS)
    const history = normalizeHistory(body.messages)

    if (!message) {
      response.status(400).json({ error: 'Message is required.' })
      return
    }

    const conversation = [
      ...history,
      { role: 'user', content: message },
    ]
      .map((item) => `${item.role === 'assistant' ? 'Asistente' : 'Cliente'}: ${item.content}`)
      .join('\n')

    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: CHATBOT_PROMPT,
        input: conversation,
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
      response.status(apiResponse.status).json({
        error: data.error?.message || 'OpenAI request failed.',
      })
      return
    }

    response.status(200).json({ reply: extractResponse(data) })
  } catch {
    response.status(500).json({ error: 'Chat request failed.' })
  }
}
