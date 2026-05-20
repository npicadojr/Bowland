import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Music2,
  Send,
  Phone,
  Search,
  Sparkles,
  X,
  Utensils,
} from 'lucide-react'
import { menuCategories, menuProducts } from './menuData'
import './App.css'

const brand = {
  logo: '/assets/bowland-logo.png',
  heroGif: 'https://images-mini.cluvi.com/eiYT8h91Lj/w_1200_eiYT8h91Lj_gif_bowland.gif',
  instagram: 'https://www.instagram.com/bowlandpanama?igsh=OXdncDZybzBycml3',
  phone: '+507 6230-9449',
  phoneHref: 'tel:+50762309449',
  email: 'contacto@bowland.com.pa',
  emailHref: 'mailto:contacto@bowland.com.pa',
}

const experiences = [
  {
    icon: Sparkles,
    title: 'Pistas con vibra neon',
    text: 'Una experiencia social, fotografiable y facil de disfrutar en grupos.',
  },
  {
    icon: Utensils,
    title: 'Menu de antojos',
    text: 'Hamburguesas, alitas, pizzas, snacks y postres para jugar sin pausar.',
  },
  {
    icon: Music2,
    title: 'Planes que se sienten vivos',
    text: 'Cumpleanos, after office y tardes de mall con energia de noche.',
  },
]

const galleryPhotos = [
  {
    src: 'https://altaplazamall.com/wp-content/uploads/2024/05/IMG_2640-Edit-copy.jpg',
    title: 'Entrada neon',
  },
  {
    src: 'https://altaplazamall.com/wp-content/uploads/2024/05/IMG_2654.jpg',
    title: 'Restaurante y bar',
  },
  {
    src: 'https://altaplazamall.com/wp-content/uploads/2024/05/IMG_8073-Edit-copyRE.jpg',
    title: 'Pistas Bowland',
  },
]

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const CHAT_MAX_CHARS = 500

const initialChatMessages = [
  {
    role: 'assistant',
    content:
      'Hola, soy el asistente de Bowland. Puedo ayudarte con menu, ubicacion, horarios, contacto y planes para grupos.',
  },
]

function Header({ activeView, setView }) {
  const goTo = (view) => {
    setView(view)
    window.location.hash = view === 'menu' ? 'menu' : view === 'contact' ? 'contacto' : 'inicio'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <button
        className="brand-link"
        type="button"
        onClick={() => goTo('home')}
        aria-label="Bowland Panama inicio"
      >
        <img src={brand.logo} alt="Bowland Panama" />
      </button>
      <nav aria-label="Navegacion principal">
        <button
          className={activeView === 'home' ? 'active' : ''}
          type="button"
          onClick={() => goTo('home')}
        >
          Inicio
        </button>
        <button
          className={activeView === 'menu' ? 'active' : ''}
          type="button"
          onClick={() => goTo('menu')}
        >
          Menu
        </button>
        <button
          className={activeView === 'contact' ? 'active' : ''}
          type="button"
          onClick={() => goTo('contact')}
        >
          Contacto
        </button>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero-section" id="inicio">
      <div className="hero-copy">
        <h1 className="hero-logo-title">
          <img src={brand.logo} alt="Bowland Bowling, Food & Drinks" />
        </h1>
        <p>
          Bowling, comida y tragos en Altaplaza Mall con una vibra neon pensada
          para jugar, celebrar y quedarte un rato mas.
        </p>
      </div>
    </section>
  )
}

function PhotoCarousel() {
  const [activePhoto, setActivePhoto] = useState(0)
  const photo = galleryPhotos[activePhoto]

  const goToPhoto = (direction) => {
    setActivePhoto((current) =>
      (current + direction + galleryPhotos.length) % galleryPhotos.length,
    )
  }

  useEffect(() => {
    const timer = window.setInterval(() => goToPhoto(1), 5200)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="photo-carousel" aria-label="Fotos de Bowland Altaplaza">
      <div className="carousel-copy">
        <h2>Bowland por dentro</h2>
      </div>

      <div className="carousel-stage">
        <button type="button" className="carousel-control prev" onClick={() => goToPhoto(-1)} aria-label="Foto anterior">
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
        <img src={photo.src} alt={photo.title} />
        <button type="button" className="carousel-control next" onClick={() => goToPhoto(1)} aria-label="Siguiente foto">
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      </div>

      <div className="carousel-thumbs" aria-label="Seleccionar foto">
        {galleryPhotos.map((item, index) => (
          <button
            className={activePhoto === index ? 'active' : ''}
            key={item.src}
            type="button"
            onClick={() => setActivePhoto(index)}
            aria-label={`Ver ${item.title}`}
          >
            <img src={item.src} alt="" />
          </button>
        ))}
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section className="experience-section" id="experiencia">
      <div className="section-heading">
        <h2>Una salida completa, no solo una partida</h2>
      </div>
      <div className="experience-grid">
        {experiences.map(({ icon: Icon, title, text }) => (
          <article className="experience-card" key={title}>
            <Icon size={28} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalize(query.trim())

    return menuProducts.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || product.categoryId === activeCategory
      const haystack = normalize(`${product.name} ${product.description} ${product.category}`)
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery))
    })
  }, [activeCategory, query])

  return (
    <main className="menu-page" id="menu">
      <section className="menu-page-hero">
        <div>
          <h1>Menú Bowland</h1>
          <p>
            Todos los productos del menú digital actual de Bowland Panamá,
            organizados para buscar rápido por categoría.
          </p>
        </div>
        <div className="menu-stat">
          <strong>{menuProducts.length}</strong>
          <span>productos</span>
        </div>
      </section>

      <section className="menu-browser" aria-label="Menu completo">
        <aside className="category-panel">
          <button
            className={activeCategory === 'all' ? 'active' : ''}
            type="button"
            onClick={() => setActiveCategory('all')}
          >
            <span>Todo el menu</span>
            <strong>{menuProducts.length}</strong>
          </button>
          {menuCategories.map((category) => (
            <button
              className={activeCategory === category.id ? 'active' : ''}
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
            >
              <span>{category.label}</span>
              <strong>{category.productIds.length}</strong>
            </button>
          ))}
        </aside>

        <div className="product-area">
          <div className="menu-toolbar">
            <label className="search-box">
              <Search size={19} aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar producto"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <span>{filteredProducts.length} resultados</span>
          </div>

          <div className="full-menu-grid">
            {filteredProducts.map((product) => (
              <article className="full-menu-card" key={product.id}>
                <img src={product.image} alt="" loading="lazy" />
                <div className="full-menu-card-body">
                  <span>{product.category}</span>
                  <h2>{product.name}</h2>
                  <p>{product.description || 'Producto del menu Bowland.'}</p>
                  <strong>{formatPrice(product.price)}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function ContactPage() {
  return (
    <main className="contact-page" id="contacto">
      <section className="contact-hero">
        <div>
          <h1>Contacto</h1>
          <p>
            Encuentra Bowland Panama en Altaplaza Mall. Para eventos, grupos o
            informacion general, usa los canales de contacto oficiales.
          </p>
        </div>
        <img src={brand.logo} alt="Bowland Panama" />
      </section>

      <section className="contact-layout" aria-label="Informacion de contacto">
        <div className="map-panel">
          <iframe
            title="Mapa de Bowland Altaplaza Mall"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Bowland%20AltaPlaza%20Mall%20Panama&output=embed"
          />
        </div>

        <div className="contact-cards">
          <a className="contact-card" href="https://maps.google.com/?q=Bowland%20AltaPlaza%20Mall%20Panama" target="_blank" rel="noreferrer">
            <MapPin size={24} aria-hidden="true" />
            <span>Ubicacion</span>
            <strong>Altaplaza Mall, Nivel 2, Local 2-301F</strong>
          </a>
          <a className="contact-card" href={brand.phoneHref}>
            <Phone size={24} aria-hidden="true" />
            <span>Telefono</span>
            <strong>{brand.phone}</strong>
          </a>
          <a className="contact-card" href={brand.instagram} target="_blank" rel="noreferrer">
            <Camera size={24} aria-hidden="true" />
            <span>Instagram</span>
            <strong>@bowlandpanama</strong>
          </a>
          <a className="contact-card" href={brand.emailHref}>
            <Mail size={24} aria-hidden="true" />
            <span>Email</span>
            <strong>{brand.email}</strong>
          </a>
          <div className="contact-card">
            <Clock3 size={24} aria-hidden="true" />
            <span>Horario</span>
            <strong>Lunes a domingo: 12PM - 12AM</strong>
          </div>
          <div className="contact-card">
            <CalendarDays size={24} aria-hidden="true" />
            <span>Planes</span>
            <strong>Grupos, cumpleanos y eventos</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

function HomePage() {
  return (
    <main>
      <Hero />
      <PhotoCarousel />
      <Experience />
    </main>
  )
}

function FooterBar({ setView }) {
  const goToContact = () => {
    setView('contact')
    window.location.hash = 'contacto'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer-bar">
      <button className="footer-logo" type="button" onClick={goToContact} aria-label="Ir a contacto">
        <img src={brand.logo} alt="Bowland Panama" />
      </button>
      <div className="footer-phones">
        <a href={brand.phoneHref}>
          <Phone size={18} aria-hidden="true" />
          {brand.phone}
        </a>
        <button type="button" onClick={goToContact}>
          <MapPin size={18} aria-hidden="true" />
          Altaplaza Mall
        </button>
      </div>
    </footer>
  )
}

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

function App() {
  const [view, setView] = useState(() =>
    window.location.hash.replace('#', '') === 'menu'
      ? 'menu'
      : window.location.hash.replace('#', '') === 'contacto'
        ? 'contact'
        : 'home',
  )

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      setView(hash === 'menu' ? 'menu' : hash === 'contacto' ? 'contact' : 'home')
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <>
      <Header activeView={view} setView={setView} />
      {view === 'menu' ? <MenuPage /> : view === 'contact' ? <ContactPage /> : <HomePage />}
      <FooterBar setView={setView} />
      <ChatbotWidget />
    </>
  )
}

export default App
