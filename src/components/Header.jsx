import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Music2,
  Phone,
  Sparkles,
  Utensils,
} from 'lucide-react'

const brand = {
  logo: '/assets/bowland-logo.png',
  phone: '+507 6230-9449',
  phoneHref: 'tel:+50762309449',
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

const viewHashes = {
  home: 'inicio',
  menu: 'menu',
  promotions: 'promociones',
  contact: 'contacto',
  admin: 'admin',
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

function Header({ activeView, children, setView }) {
  const goTo = (view) => {
    setView(view)
    window.location.hash = viewHashes[view] || viewHashes.home
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <header className={`site-header${activeView === 'admin' ? ' admin-site-header' : ''}`}>
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
            className={activeView === 'promotions' ? 'active' : ''}
            type="button"
            onClick={() => goTo('promotions')}
          >
            Promociones
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
      {activeView === 'home' ? <HomePage /> : children}
      <FooterBar setView={setView} />
    </>
  )
}

export default Header
