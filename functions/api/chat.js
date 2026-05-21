import {
  CHATBOT_PROMPT,
  MAX_INPUT_CHARS,
  extractResponse,
  normalizeHistory,
} from '../../lib/chatContext.js'

const MAX_REQUEST_CHARS = 8000
const MAX_OUTPUT_TOKENS = 90
const DEFAULT_MODEL = 'gpt-4.1-mini'

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })

const readJsonBody = async (request) => {
  const body = await request.text()

  if (body.length > MAX_REQUEST_CHARS) {
    throw new Error('Request body is too large.')
  }

  return JSON.parse(body || '{}')
}

export async function onRequestPost({ request, env }) {
  const openaiApiKey = env.OPENAI_API_KEY
  const model = env.OPENAI_MODEL || DEFAULT_MODEL

  if (!openaiApiKey) {
    return jsonResponse(
      { error: 'OPENAI_API_KEY is not configured on the server.' },
      503,
    )
  }

  try {
    const body = await readJsonBody(request)
    const message = String(body.message || '').trim().slice(0, MAX_INPUT_CHARS)
    const history = normalizeHistory(body.messages)

    if (!message) {
      return jsonResponse({ error: 'Message is required.' }, 400)
    }

    const conversation = [...history, { role: 'user', content: message }]
      .map((item) => `${item.role === 'assistant' ? 'Asistente' : 'Cliente'}: ${item.content}`)
      .join('\n')

    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions: CHATBOT_PROMPT,
        input: conversation,
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
      return jsonResponse(
        { error: data.error?.message || 'OpenAI request failed.' },
        apiResponse.status,
      )
    }

    return jsonResponse({ reply: extractResponse(data) })
  } catch {
    return jsonResponse({ error: 'Chat request failed.' }, 500)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
    },
  })
}
