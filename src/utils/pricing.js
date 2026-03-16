import { supabase } from '@/lib/supabase'

/**
 * Calculate shipping cost based on container type, CBM, and route
 */
export async function calculateShippingCost(containerType, totalCBM, moveType = 'international', originCountry = 'Kuwait') {
  try {
    const { data, error } = await supabase
      .from('pricing')
      .select('*')
      .eq('container_type', containerType)
      .eq('route_type', moveType)
      .eq('origin_country', originCountry)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      // Return default pricing if no configuration found
      return getFallbackPricing(containerType, totalCBM)
    }

    // For LCL, price is per CBM
    if (containerType === 'lcl' && data.price_per_cbm) {
      const cbmCost = totalCBM * data.price_per_cbm
      return {
        base_price: parseFloat(data.base_price),
        cbm_cost: cbmCost,
        total: Math.max(cbmCost, data.min_charge || parseFloat(data.base_price)),
        currency: data.currency || 'KWD',
        pricing_source: 'database'
      }
    }

    // For groupage, similar to LCL but with different base
    if (containerType === 'groupage' && data.price_per_cbm) {
      const cbmCost = totalCBM * data.price_per_cbm
      return {
        base_price: parseFloat(data.base_price),
        cbm_cost: cbmCost,
        total: Math.max(cbmCost, data.min_charge || parseFloat(data.base_price)),
        currency: data.currency || 'KWD',
        pricing_source: 'database'
      }
    }

    // For FCL (containers), it's a flat rate
    return {
      base_price: parseFloat(data.base_price),
      total: parseFloat(data.base_price),
      currency: data.currency || 'KWD',
      pricing_source: 'database'
    }
  } catch (err) {
    console.error('Pricing calculation error:', err)
    return getFallbackPricing(containerType, totalCBM)
  }
}

/**
 * Get additional services pricing
 */
export async function getAdditionalServices() {
  try {
    const { data, error } = await supabase
      .from('additional_services_pricing')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching services:', err)
    return []
  }
}

/**
 * Calculate total quote including additional services
 */
export async function calculateQuote(containerType, totalCBM, moveType, selectedServices = [], originCountry = 'Kuwait') {
  // Get base shipping cost
  const shippingCost = await calculateShippingCost(containerType, totalCBM, moveType, originCountry)

  // Get additional services
  const services = await getAdditionalServices()

  // Calculate service costs
  let additionalServicesTotal = 0
  const serviceBreakdown = []

  for (const serviceKey of selectedServices) {
    const service = services.find(s => s.service_key === serviceKey)
    if (service) {
      let cost = parseFloat(service.price)

      if (service.unit === 'per_cbm') {
        cost = cost * totalCBM
      } else if (service.unit === 'percentage') {
        cost = (shippingCost.total * cost) / 100
      }

      additionalServicesTotal += cost
      serviceBreakdown.push({
        name: service.service_name,
        key: service.service_key,
        cost: cost,
        unit: service.unit
      })
    }
  }

  return {
    shipping: shippingCost,
    additional_services: serviceBreakdown,
    additional_total: additionalServicesTotal,
    subtotal: shippingCost.total,
    total: shippingCost.total + additionalServicesTotal,
    currency: shippingCost.currency,
    breakdown: {
      shipping: shippingCost.total,
      services: additionalServicesTotal
    }
  }
}

/**
 * Fallback pricing when database lookup fails
 */
function getFallbackPricing(containerType, totalCBM) {
  const fallbackRates = {
    lcl: { base: 50, per_cbm: 25 },
    groupage: { base: 80, per_cbm: 35 },
    '20ft': { base: 1200 },
    '20ft_hc': { base: 1350 },
    '40ft': { base: 1800 },
    '40ft_hc': { base: 2000 }
  }

  const rate = fallbackRates[containerType] || { base: 100, per_cbm: 30 }

  if (containerType === 'lcl' || containerType === 'groupage') {
    const cost = totalCBM * rate.per_cbm
    return {
      base_price: rate.base,
      total: Math.max(cost, rate.base),
      currency: 'KWD',
      pricing_source: 'fallback'
    }
  }

  return {
    base_price: rate.base,
    total: rate.base,
    currency: 'KWD',
    pricing_source: 'fallback'
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount, currency = 'KWD') {
  return new Intl.NumberFormat('en-KW', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Get price per CBM for a container
 */
export function getPricePerCBM(containerType) {
  const rates = {
    lcl: 25,
    groupage: 35,
    '20ft': 0,
    '20ft_hc': 0,
    '40ft': 0,
    '40ft_hc': 0
  }
  return rates[containerType] || 0
}
