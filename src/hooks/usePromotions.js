import { useEffect, useState } from 'react'

const hasSupabaseConfig = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

const todayDate = () => new Date().toISOString().slice(0, 10)

const mapPromotion = (promotion) => ({
  id: promotion.id,
  title: promotion.title,
  description: promotion.description,
  image: promotion.image_url,
  type: promotion.type,
  startsAt: promotion.starts_at,
  expiresAt: promotion.expires_at,
  active: promotion.active,
})

export function usePromotions() {
  const [state, setState] = useState({
    promotions: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true
    let promotionsChannel = null

    const loadPromotions = async () => {
      try {
        if (!hasSupabaseConfig()) {
          if (isMounted) {
            setState({ promotions: [], loading: false, error: null })
          }
          return
        }

        const { supabase } = await import('../lib/supabaseClient')
        const today = todayDate()
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('active', true)
          .lte('starts_at', today)
          .gte('expires_at', today)
          .order('expires_at', { ascending: true })

        if (error) throw error

        if (isMounted) {
          setState({
            promotions: (data || []).map(mapPromotion),
            loading: false,
            error: null,
          })
        }
      } catch (loadError) {
        if (isMounted) {
          setState({ promotions: [], loading: false, error: loadError })
        }
      }
    }

    loadPromotions()

    const subscribeToPromotions = async () => {
      if (!hasSupabaseConfig()) return

      const { supabase } = await import('../lib/supabaseClient')
      const channelName = `public-promotions-updates-${Date.now()}-${Math.random()}`
      promotionsChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'promotions' },
          loadPromotions,
        )
        .subscribe()
    }

    subscribeToPromotions()

    return () => {
      isMounted = false
      if (promotionsChannel) {
        promotionsChannel.unsubscribe()
      }
    }
  }, [])

  return state
}
