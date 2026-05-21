import { useEffect, useState } from 'react'

const mapFallbackMenu = async () => {
  const { menuCategories, menuProducts } = await import('../menuData')
  return {
    categories: menuCategories,
    products: menuProducts,
    loading: false,
    error: null,
  }
}

const mapSupabaseMenu = (categories, products) => {
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  return {
    categories: categories.map((category) => ({
      id: category.id,
      label: category.name,
      slug: category.slug,
      order: category.display_order,
      productIds: products
        .filter((product) => product.category_id === category.id)
        .map((product) => product.id),
    })),
    products: products.map((product) => {
      const category = categoryById.get(product.category_id)

      return {
        id: product.id,
        name: product.name,
        categoryId: product.category_id,
        price: Number(product.price || 0),
        description: product.description,
        image: product.image_url,
        category: category?.name || '',
        order: product.display_order,
        outOfStock: !product.available,
      }
    }),
  }
}

export function useMenu() {
  const [state, setState] = useState({
    categories: [],
    products: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true
    let menuChannel = null

    const loadMenu = async () => {
      try {
        const hasSupabaseConfig =
          Boolean(import.meta.env.VITE_SUPABASE_URL) &&
          Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

        if (!hasSupabaseConfig) {
          const fallbackState = await mapFallbackMenu()
          if (isMounted) setState(fallbackState)
          return
        }

        const { supabase } = await import('../lib/supabaseClient')

        const [categoriesResult, productsResult] = await Promise.all([
          supabase.from('menu_categories').select('*').order('name'),
          supabase
            .from('menu_products')
            .select('*')
            .eq('available', true)
            .order('name'),
        ])

        if (categoriesResult.error || productsResult.error) {
          throw categoriesResult.error || productsResult.error
        }

        const menu = mapSupabaseMenu(
          categoriesResult.data || [],
          productsResult.data || [],
        )

        if (isMounted) {
          setState({
            ...menu,
            loading: false,
            error: null,
          })
        }
      } catch (loadError) {
        try {
          const fallbackState = await mapFallbackMenu()
          if (isMounted) setState(fallbackState)
        } catch {
          if (isMounted) {
            setState({
              categories: [],
              products: [],
              loading: false,
              error: loadError,
            })
          }
        }
      }
    }

    loadMenu()

    const subscribeToMenu = async () => {
      const hasSupabaseConfig =
        Boolean(import.meta.env.VITE_SUPABASE_URL) &&
        Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

      if (!hasSupabaseConfig) return

      const { supabase } = await import('../lib/supabaseClient')
      menuChannel = supabase
        .channel('public-menu-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menu_categories' },
          loadMenu,
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menu_products' },
          loadMenu,
        )
        .subscribe()
    }

    subscribeToMenu()

    return () => {
      isMounted = false
      if (menuChannel) {
        menuChannel.unsubscribe()
      }
    }
  }, [])

  return state
}
