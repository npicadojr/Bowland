import { CalendarDays, Camera, Clock3, Mail, MapPin, Phone } from 'lucide-react'

const brand = {
  logo: '/assets/bowland-logo.png',
  instagram: 'https://www.instagram.com/bowlandpanama?igsh=OXdncDZybzBycml3',
  phone: '+507 6230-9449',
  phoneHref: 'tel:+50762309449',
  email: 'contacto@bowland.com.pa',
  emailHref: 'mailto:contacto@bowland.com.pa',
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

export default ContactPage
