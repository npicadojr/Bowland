import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Eye,
  EyeOff,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react'

const hasSupabaseConfig =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

const emptyProduct = {
  id: null,
  name: '',
  category_id: '',
  price: '',
  description: '',
  image_url: '',
  available: true,
  display_order: 0,
}

const emptyCategory = {
  id: null,
  name: '',
  slug: '',
  display_order: 0,
}

const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getSupabase = async () => {
  const { supabase } = await import('../lib/supabaseClient')
  return supabase
}

function LoginPanel({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ loading: false, error: '' })

  const submitLogin = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: '' })

    const supabase = await getSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setStatus({ loading: false, error: error.message })
      return
    }

    setStatus({ loading: false, error: '' })
    onLogin()
  }

  return (
    <section className="admin-auth-panel">
      <div>
        <h1>Admin Bowland</h1>
        <p>Ingresa con una cuenta autorizada para editar el menú digital.</p>
      </div>
      <form className="admin-form compact" onSubmit={submitLogin}>
        <label>
          Email
          <input
            autoComplete="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Contraseña
          <input
            autoComplete="current-password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {status.error ? <p className="admin-alert error">{status.error}</p> : null}
        <button className="admin-primary-button" disabled={status.loading} type="submit">
          {status.loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </section>
  )
}

function ProductForm({ categories, form, saving, onChange, onSubmit, onNew }) {
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="admin-form-head">
        <h2>{form.id ? 'Editar producto' : 'Nuevo producto'}</h2>
        <button className="admin-icon-button" type="button" onClick={onNew} aria-label="Nuevo producto">
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
      <label>
        Nombre
        <input
          required
          value={form.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </label>
      <label>
        Categoría
        <select
          required
          value={form.category_id}
          onChange={(event) => onChange({ category_id: event.target.value })}
        >
          <option value="">Seleccionar</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className="admin-form-grid">
        <label>
          Precio
          <input
            min="0"
            step="0.01"
            type="number"
            value={form.price}
            onChange={(event) => onChange({ price: event.target.value })}
          />
        </label>
        <label>
          Orden
          <input
            step="1"
            type="number"
            value={form.display_order}
            onChange={(event) => onChange({ display_order: event.target.value })}
          />
        </label>
      </div>
      <label>
        Descripción
        <textarea
          rows="4"
          value={form.description || ''}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </label>
      <label>
        URL de imagen
        <input
          value={form.image_url || ''}
          onChange={(event) => onChange({ image_url: event.target.value })}
        />
      </label>
      <label className="admin-check">
        <input
          checked={form.available}
          type="checkbox"
          onChange={(event) => onChange({ available: event.target.checked })}
        />
        Visible en el menú público
      </label>
      <button className="admin-primary-button" disabled={saving} type="submit">
        <Save size={18} aria-hidden="true" />
        {saving ? 'Guardando...' : 'Guardar producto'}
      </button>
    </form>
  )
}

function CategoryForm({ form, saving, onChange, onSubmit, onNew }) {
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="admin-form-head">
        <h2>{form.id ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <button className="admin-icon-button" type="button" onClick={onNew} aria-label="Nueva categoría">
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
      <label>
        Nombre
        <input
          required
          value={form.name}
          onChange={(event) =>
            onChange({
              name: event.target.value,
              slug: form.id ? form.slug : slugify(event.target.value),
            })
          }
        />
      </label>
      <label>
        Slug
        <input
          required
          value={form.slug}
          onChange={(event) => onChange({ slug: slugify(event.target.value) })}
        />
      </label>
      <label>
        Orden
        <input
          step="1"
          type="number"
          value={form.display_order}
          onChange={(event) => onChange({ display_order: event.target.value })}
        />
      </label>
      <button className="admin-primary-button" disabled={saving} type="submit">
        <Save size={18} aria-hidden="true" />
        {saving ? 'Guardando...' : 'Guardar categoría'}
      </button>
    </form>
  )
}

function AdminPage() {
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(hasSupabaseConfig)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [productForm, setProductForm] = useState(emptyProduct)
  const [categoryForm, setCategoryForm] = useState(emptyCategory)
  const [status, setStatus] = useState({ loading: false, saving: false, message: '', error: '' })

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  )

  const loadMenu = useCallback(async () => {
    setStatus((current) => ({ ...current, loading: true, error: '' }))
    const supabase = await getSupabase()
    const [categoryResult, productResult] = await Promise.all([
      supabase.from('menu_categories').select('*').order('display_order'),
      supabase.from('menu_products').select('*').order('display_order'),
    ])

    if (categoryResult.error || productResult.error) {
      setStatus({
        loading: false,
        saving: false,
        message: '',
        error: categoryResult.error?.message || productResult.error?.message,
      })
      return
    }

    setCategories(categoryResult.data || [])
    setProducts(productResult.data || [])
    setStatus((current) => ({ ...current, loading: false }))
  }, [])

  useEffect(() => {
    if (!hasSupabaseConfig) return undefined

    let authSubscription = null

    const initSession = async () => {
      const supabase = await getSupabase()
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoadingSession(false)
      if (data.session) {
        await loadMenu()
      }

      const listener = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession)
        if (nextSession) {
          loadMenu()
        }
      })
      authSubscription = listener.data.subscription
    }

    initSession()

    return () => {
      authSubscription?.unsubscribe()
    }
  }, [loadMenu])

  const saveProduct = async (event) => {
    event.preventDefault()
    setStatus({ loading: false, saving: true, message: '', error: '' })

    const payload = {
      name: productForm.name.trim(),
      category_id: productForm.category_id,
      price: productForm.price === '' ? null : Number(productForm.price),
      description: productForm.description?.trim() || null,
      image_url: productForm.image_url?.trim() || null,
      available: productForm.available,
      display_order: Number(productForm.display_order || 0),
    }

    const supabase = await getSupabase()
    const query = productForm.id
      ? supabase.from('menu_products').update(payload).eq('id', productForm.id)
      : supabase.from('menu_products').insert(payload)
    const { error } = await query

    if (error) {
      setStatus({ loading: false, saving: false, message: '', error: error.message })
      return
    }

    setProductForm(emptyProduct)
    setStatus({ loading: false, saving: false, message: 'Producto guardado.', error: '' })
    await loadMenu()
  }

  const saveCategory = async (event) => {
    event.preventDefault()
    setStatus({ loading: false, saving: true, message: '', error: '' })

    const payload = {
      name: categoryForm.name.trim(),
      slug: categoryForm.slug || slugify(categoryForm.name),
      display_order: Number(categoryForm.display_order || 0),
    }

    const supabase = await getSupabase()
    const query = categoryForm.id
      ? supabase.from('menu_categories').update(payload).eq('id', categoryForm.id)
      : supabase.from('menu_categories').insert(payload)
    const { error } = await query

    if (error) {
      setStatus({ loading: false, saving: false, message: '', error: error.message })
      return
    }

    setCategoryForm(emptyCategory)
    setStatus({ loading: false, saving: false, message: 'Categoría guardada.', error: '' })
    await loadMenu()
  }

  const deleteProduct = async (productId) => {
    const supabase = await getSupabase()
    const { error } = await supabase.from('menu_products').delete().eq('id', productId)

    if (error) {
      setStatus({ loading: false, saving: false, message: '', error: error.message })
      return
    }

    setStatus({ loading: false, saving: false, message: 'Producto eliminado.', error: '' })
    await loadMenu()
  }

  const toggleProduct = async (product) => {
    const supabase = await getSupabase()
    const { error } = await supabase
      .from('menu_products')
      .update({ available: !product.available })
      .eq('id', product.id)

    if (error) {
      setStatus({ loading: false, saving: false, message: '', error: error.message })
      return
    }

    await loadMenu()
  }

  const signOut = async () => {
    const supabase = await getSupabase()
    await supabase.auth.signOut()
  }

  if (!hasSupabaseConfig) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <h1>Admin Bowland</h1>
          <p>Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para activar el CMS.</p>
        </section>
      </main>
    )
  }

  if (loadingSession) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <h1>Admin Bowland</h1>
          <p>Cargando sesión...</p>
        </section>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="admin-page">
        <LoginPanel onLogin={loadMenu} />
      </main>
    )
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <h1>CMS visual</h1>
          <p>Administra categorías y productos. Los productos visibles se publican en el menú.</p>
        </div>
        <div className="admin-actions">
          <button className="admin-secondary-button" type="button" onClick={loadMenu}>
            <RefreshCw size={18} aria-hidden="true" />
            Refrescar
          </button>
          <button className="admin-secondary-button" type="button" onClick={signOut}>
            <LogOut size={18} aria-hidden="true" />
            Salir
          </button>
        </div>
      </section>

      {status.error ? <p className="admin-alert error">{status.error}</p> : null}
      {status.message ? <p className="admin-alert success">{status.message}</p> : null}

      <section className="admin-layout">
        <div className="admin-list-panel">
          <div className="admin-panel-heading">
            <h2>Productos</h2>
            <span>{products.length}</span>
          </div>
          <div className="admin-products-list">
            {status.loading ? <p className="admin-muted">Cargando menú...</p> : null}
            {products.map((product) => (
              <article className="admin-product-row" key={product.id}>
                <button
                  className="admin-product-main"
                  type="button"
                  onClick={() => setProductForm(product)}
                >
                  <img src={product.image_url || '/favicon.svg'} alt="" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{categoryById.get(product.category_id) || 'Sin categoría'}</small>
                  </span>
                </button>
                <strong className="admin-price">
                  {product.price === null ? '-' : `$${Number(product.price).toFixed(2)}`}
                </strong>
                <button
                  className="admin-icon-button"
                  type="button"
                  onClick={() => toggleProduct(product)}
                  aria-label={product.available ? 'Ocultar producto' : 'Mostrar producto'}
                >
                  {product.available ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button
                  className="admin-icon-button danger"
                  type="button"
                  onClick={() => deleteProduct(product.id)}
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-editor-stack">
          <ProductForm
            categories={categories}
            form={productForm}
            saving={status.saving}
            onChange={(patch) => setProductForm((current) => ({ ...current, ...patch }))}
            onNew={() => setProductForm(emptyProduct)}
            onSubmit={saveProduct}
          />

          <CategoryForm
            form={categoryForm}
            saving={status.saving}
            onChange={(patch) => setCategoryForm((current) => ({ ...current, ...patch }))}
            onNew={() => setCategoryForm(emptyCategory)}
            onSubmit={saveCategory}
          />

          <div className="admin-categories-list">
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => setCategoryForm(category)}>
                <span>{category.name}</span>
                <small>Orden {category.display_order}</small>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default AdminPage
