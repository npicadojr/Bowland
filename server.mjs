import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import {
  CHATBOT_PROMPT,
  MAX_INPUT_CHARS,
  extractResponse,
  normalizeHistory,
} from './lib/chatContext.js'

const PORT = Number(process.env.PORT || 5174)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const MAX_REQUEST_CHARS = 8000
const MAX_OUTPUT_TOKENS = 90
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(payload))
}

const readJsonBody = async (request) => {
  let body = ''

  for await (const chunk of request) {
    body += chunk
    if (body.length > MAX_REQUEST_CHARS) break
  }

  return JSON.parse(body || '{}')
}

const handleChat = async (request, response) => {
  if (!OPENAI_API_KEY) {
    sendJson(response, 503, {
      error: 'OPENAI_API_KEY is not configured on the server.',
    })
    return
  }

  try {
    const body = await readJsonBody(request)
    const message = String(body.message || '').trim().slice(0, MAX_INPUT_CHARS)
    const history = normalizeHistory(body.messages)

    if (!message) {
      sendJson(response, 400, { error: 'Message is required.' })
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
      sendJson(response, apiResponse.status, { error: data.error?.message || 'OpenAI request failed.' })
      return
    }

    sendJson(response, 200, { reply: extractResponse(data) })
  } catch {
    sendJson(response, 500, { error: 'Chat request failed.' })
  }
}

const serveStatic = async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname
  const safePath = normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, '')
  const filePath = join(process.cwd(), 'dist', safePath)

  try {
    const file = await readFile(filePath)
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    })
    response.end(file)
  } catch {
    const indexFile = await readFile(join(process.cwd(), 'dist', 'index.html'))
    response.writeHead(200, { 'Content-Type': mimeTypes['.html'] })
    response.end(indexFile)
  }
}

createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/chat') {
    await handleChat(request, response)
    return
  }

  await serveStatic(request, response)
}).listen(PORT, () => {
  console.log(`Bowland site with chat running on http://127.0.0.1:${PORT}`)
})
