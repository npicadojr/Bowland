import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useMenu } from '../hooks/useMenu'

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

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const { categories, products, loading, error } = useMenu()

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalize(query.trim())

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || product.categoryId === activeCategory
      const haystack = normalize(`${product.name} ${product.description} ${product.category}`)
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery))
    })
  }, [activeCategory, products, query])

  const hasSavedMenu = products.length > 0

  return (
    <main className="menu-page" id="menu">
      <section className="menu-page-hero">
        <div>
          <h1>Menu Bowland</h1>
          <p>
            Todos los productos del menú digital actual de Bowland Panamá,
            organizados para buscar rápido por categoría.
          </p>
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
            <strong>{products.length}</strong>
          </button>
          {categories.map((category) => (
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

          {error && !hasSavedMenu && (
            <p className="menu-error">No se pudo cargar el menú. Mostrando versión guardada.</p>
          )}

          <div className="full-menu-grid">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <article className="full-menu-card menu-skeleton-card" key={index} aria-hidden="true">
                  <div className="menu-skeleton-image" />
                  <div className="full-menu-card-body">
                    <span className="menu-skeleton-line short" />
                    <h2 className="menu-skeleton-line title" />
                    <p className="menu-skeleton-line" />
                    <strong className="menu-skeleton-line price" />
                  </div>
                </article>
              ))
            ) : (
              filteredProducts.map((product) => (
                <article className="full-menu-card" key={product.id}>
                  <img src={product.image} alt="" loading="lazy" />
                  <div className="full-menu-card-body">
                    <span>{product.category}</span>
                    <h2>{product.name}</h2>
                    <p>{product.description || 'Producto del menu Bowland.'}</p>
                    <strong>{formatPrice(product.price)}</strong>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default MenuPage
