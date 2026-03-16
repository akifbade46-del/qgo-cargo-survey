import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const DEFAULTS = {
  color_primary: '#0D5C9E',
  color_secondary: '#90CCE0',
  color_navy: '#083D6E',
}

export function useBranding() {
  useEffect(() => {
    loadBranding()

    const channel = supabase
      .channel('branding-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'app_settings',
        filter: 'key=like.color_%'
      }, () => loadBranding())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])
}

async function loadBranding() {
  try {
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['color_primary', 'color_secondary', 'color_navy'])

    const colors = { ...DEFAULTS }

    if (data) {
      data.forEach(({ key, value }) => {
        if (value) {
          colors[key] = value
        }
      })
    }

    // Apply to CSS variables - these match tailwind config
    document.documentElement.style.setProperty('--color-primary', colors.color_primary)
    document.documentElement.style.setProperty('--color-secondary', colors.color_secondary)
    document.documentElement.style.setProperty('--color-navy', colors.color_navy)

    // Also set as RGB for opacity variants
    const primaryRgb = hexToRgb(colors.color_primary)
    const secondaryRgb = hexToRgb(colors.color_secondary)
    const navyRgb = hexToRgb(colors.color_navy)

    if (primaryRgb) {
      document.documentElement.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
    }
    if (navyRgb) {
      document.documentElement.style.setProperty('--color-navy-rgb', `${navyRgb.r}, ${navyRgb.g}, ${navyRgb.b}`)
    }

    console.log('🎨 Branding applied:', colors)
  } catch (err) {
    console.error('Failed to load branding:', err)
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function applyBrandingColors(colors) {
  document.documentElement.style.setProperty('--color-primary', colors.color_primary || DEFAULTS.color_primary)
  document.documentElement.style.setProperty('--color-secondary', colors.color_secondary || DEFAULTS.color_secondary)
  document.documentElement.style.setProperty('--color-navy', colors.color_navy || DEFAULTS.color_navy)
}
