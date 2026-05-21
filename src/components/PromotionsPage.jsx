import { useMemo, useState } from 'react'
import { CalendarClock, Tag } from 'lucide-react'
import { usePromotions } from '../hooks/usePromotions'

const typeLabels = {
  discount: 'Descuento',
  event: 'Evento',
}

const formatDate = (date) =>
  new Intl.DateTimeFormat('es-PA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))

const daysUntil = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expires = new Date(`${date}T00:00:00`)
  expires.setHours(0, 0, 0, 0)
  return Math.ceil((expires - today) / 86400000)
}

function PromotionCard({ promotion }) {
  const remainingDays = daysUntil(promotion.expiresAt)
  const isLastDays = remainingDays >= 0 && remainingDays < 3

  return (
    <article className="promotion-card">
      <img src={promotion.image || '/assets/bowland-logo.png'} alt="" loading="lazy" />
      <div className="promotion-card-body">
        <span className="promotion-type">
          <Tag size={15} aria-hidden="true" />
          {typeLabels[promotion.type]}
        </span>
        <h2>{promotion.title}</h2>
        <p>{promotion.description}</p>
        <div className="promotion-meta">
          <span>
            <CalendarClock size={16} aria-hidden="true" />
            Vence {formatDate(promotion.expiresAt)}
          </span>
          {isLastDays ? <strong>Ultimos dias</strong> : null}
        </div>
      </div>
    </article>
  )
}

function PromotionsPage() {
  const [activeType, setActiveType] = useState('discount')
  const { promotions, loading, error } = usePromotions()

  const filteredPromotions = useMemo(
    () => promotions.filter((promotion) => promotion.type === activeType),
    [activeType, promotions],
  )

  return (
    <main className="promotions-page" id="promociones">
      <section className="promotions-hero">
        <h1>Promociones</h1>
        <p>
          Descuentos y eventos activos de Bowland Panamá. Las promociones vencidas
          desaparecen automáticamente de esta sección.
        </p>
      </section>

      <section className="promotions-tabs" aria-label="Tipos de promociones">
        <button
          className={activeType === 'discount' ? 'active' : ''}
          type="button"
          onClick={() => setActiveType('discount')}
        >
          Descuentos
        </button>
        <button
          className={activeType === 'event' ? 'active' : ''}
          type="button"
          onClick={() => setActiveType('event')}
        >
          Eventos
        </button>
      </section>

      {error ? (
        <p className="menu-error">No se pudieron cargar las promociones.</p>
      ) : null}

      <section className="promotions-grid" aria-label="Promociones activas">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <article className="promotion-card promotion-skeleton" key={index} aria-hidden="true">
              <div />
              <span />
            </article>
          ))
        ) : filteredPromotions.length ? (
          filteredPromotions.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))
        ) : (
          <p className="promotions-empty">
            No hay promociones activas en esta categoría.
          </p>
        )}
      </section>
    </main>
  )
}

export default PromotionsPage
