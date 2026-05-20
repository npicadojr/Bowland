import { useEffect, useRef, useState } from 'react'
import { Bot, Send, X } from 'lucide-react'

const CHAT_MAX_CHARS = 500

const initialChatMessages = [
  {
    role: 'assistant',
    content:
      'Hola, soy el asistente de Bowland. Puedo ayudarte con menu, ubicacion, horarios, contacto y planes para grupos.',
  },
]

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(initialChatMessages)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [isOpen, messages, isLoading])

  const sendMessage = async (event) => {
    event.preventDefault()
    const trimmedMessage = message.trim().slice(0, CHAT_MAX_CHARS)

    if (!trimmedMessage || isLoading) return

    const nextMessages = [...messages, { role: 'user', content: trimmedMessage }]
    setMessages(nextMessages)
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          messages: messages.slice(-8),
        }),
      })

      if (!response.ok) {
        throw new Error('Chat service unavailable')
      }

      const data = await response.json()
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            'Aun no estoy conectado al servidor de IA. Para activarme en Vercel, configura OPENAI_API_KEY en las variables de entorno y vuelve a desplegar.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chatbot-widget">
      {isOpen && (
        <section className="chat-panel" aria-label="Chatbot Bowland">
          <header>
            <div>
              <Bot size={20} aria-hidden="true" />
              <span>Asistente Bowland</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
              <X size={19} aria-hidden="true" />
            </button>
          </header>

          <div className="chat-messages">
            {messages.map((item, index) => (
              <p className={item.role === 'user' ? 'user' : 'assistant'} key={`${item.role}-${index}`}>
                {item.content}
              </p>
            ))}
            {isLoading && <p className="assistant">Pensando...</p>}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <form className="chat-form" onSubmit={sendMessage}>
            <label>
              <span>{message.length}/{CHAT_MAX_CHARS}</span>
              <input
                type="text"
                value={message}
                maxLength={CHAT_MAX_CHARS}
                placeholder="Pregunta sobre Bowland"
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>
            <button type="submit" aria-label="Enviar pregunta" disabled={isLoading || !message.trim()}>
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button className="chat-fab" type="button" onClick={() => setIsOpen((current) => !current)} aria-label="Abrir chatbot">
        <Bot size={26} aria-hidden="true" />
      </button>
    </div>
  )
}

export default ChatbotWidget
