import { menuCategories, menuProducts } from '../src/menuData.js'

export const MAX_INPUT_CHARS = 500
export const MAX_HISTORY_MESSAGES = 8

const formatPrice = (price) => {
  if (!Number.isFinite(price) || price <= 0) return 'precio no confirmado'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

const cleanDescription = (description) => {
  const value = String(description || '').trim()
  return value && value.toLowerCase() !== 'null' ? ` - ${value}` : ''
}

export const MENU_CONTEXT = [...menuCategories]
  .sort((first, second) => first.order - second.order)
  .map((category) => {
    const products = menuProducts
      .filter((product) => product.categoryId === category.id)
      .sort((first, second) => first.order - second.order)
      .map((product) => {
        const availability = product.outOfStock ? ' (agotado)' : ''
        return `- ${product.name}: ${formatPrice(product.price)}${availability}${cleanDescription(product.description)}`
      })
      .join('\n')

    return `${category.label}\n${products}`
  })
  .join('\n\n')

export const SITE_CONTEXT = `
Bowland Panama es un venue de bowling, comida y bebidas en Altaplaza Mall,
Ciudad de Panama. Contacto: telefono +507 6230-9449, Instagram @bowlandpanama,
email contacto@bowland.com.pa. Ubicacion: Altaplaza Mall, Nivel 2, Local 2-301F.
Horario de referencia: lunes a domingo de 12PM a 12AM.
Los precios del menu estan en dolares estadounidenses (USD).
Si un producto aparece con "precio no confirmado", no des un monto y sugiere
confirmarlo llamando al telefono oficial.
`

export const CHATBOT_PROMPT = `
Eres el asistente virtual de Bowland Panama.
Responde en espanol claro, amable y muy breve.
Ayuda con menu, ubicacion, telefono, Instagram, horarios, eventos y planes para grupos.
Usa solamente la informacion del contexto. Si algo no esta confirmado, dilo y sugiere llamar al telefono.
No inventes precios, promociones, reservas confirmadas ni disponibilidad en tiempo real.
Cuando pregunten por precios o productos, usa el menu completo de contexto.
No pidas datos sensibles.
Da respuestas de 1 a 2 frases. Maximo 35 palabras.
Si preguntan por un precio concreto, responde solo el producto, precio y una aclaracion corta si aplica.

Contexto:
${SITE_CONTEXT}

Menu completo:
${MENU_CONTEXT}
`

export const normalizeHistory = (messages) => {
  if (!Array.isArray(messages)) return []

  return messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.content || '').trim().slice(0, MAX_INPUT_CHARS),
    }))
    .filter((item) => item.content)
}

export const extractResponse = (openaiResponse) =>
  openaiResponse.output_text ||
  openaiResponse.output?.flatMap((item) => item.content || [])
    .find((content) => content.type === 'output_text')?.text ||
  'No pude generar una respuesta en este momento.'
