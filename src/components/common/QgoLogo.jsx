import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Validate URL format (supports http URLs, base64 data URLs, and relative paths)
function isValidLogoUrl(url) {
  if (!url || typeof url !== 'string') return false
  // Allow base64 data URLs
  if (url.startsWith('data:image/')) return true
  // Allow relative URLs starting with /
  if (url.startsWith('/')) return true
  // Allow http/https URLs
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export default function QgoLogo({ size = 'md', white = false }) {
  const [logoUrl, setLogoUrl] = useState(null)
  const [imageError, setImageError] = useState(false)
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }
  const heights = { sm: 'h-10', md: 'h-12', lg: 'h-16' }

  useEffect(() => {
    async function loadLogo() {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'logo_url')
          .single()

        // Only set if it's a valid URL
        if (data?.value && isValidLogoUrl(data.value)) {
          setLogoUrl(data.value)
          setImageError(false)
        } else {
          setLogoUrl(null)
        }
      } catch (err) {
        console.log('Could not load logo from settings')
      }
    }
    loadLogo()
  }, [])

  // Handle image load error
  function handleImageError() {
    setImageError(true)
  }

  // If logo URL exists and image hasn't errored, show image
  if (logoUrl && !imageError) {
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className={`${heights[size]} w-auto object-contain`}
        onError={handleImageError}
      />
    )
  }

  // Fallback to text logo
  return (
    <div className={`font-bold ${sizes[size]} ${white ? 'text-white' : 'text-qgo-blue'} flex items-center gap-2`}>
      <div className={`${white ? 'bg-white' : 'bg-qgo-blue'} ${white ? 'text-qgo-blue' : 'text-white'} rounded-lg px-2 py-0.5 font-black text-sm`}>Q</div>
      <span>Q'go <span className="text-qgo-cyan">Cargo</span></span>
    </div>
  )
}
