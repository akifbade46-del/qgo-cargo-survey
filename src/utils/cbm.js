// CBM = (L cm × W cm × H cm) / 1,000,000
export const calcCBM = (l, w, h) =>
  parseFloat(((l * w * h) / 1_000_000).toFixed(4))

// Container specs (mirrors DB)
export const CONTAINERS = {
  lcl:     { label: 'LCL',           maxCBM: 4.25,  maxKg: 5000,  color: '#6B7280' },
  groupage:{ label: 'Groupage',      maxCBM: 12.75, maxKg: 12000, color: '#8B5CF6' },
  '20ft':  { label: "20' Container", maxCBM: 28.2,  maxKg: 21770, color: '#0D5C9E' },
  '20ft_hc':{ label:"20' HC",        maxCBM: 31.7,  maxKg: 21770, color: '#1D78C4' },
  '40ft':  { label: "40' Container", maxCBM: 57.5,  maxKg: 26780, color: '#27AE60' },
  '40ft_hc':{ label:"40' HC",        maxCBM: 64.9,  maxKg: 26780, color: '#2ECC71' },
}

export function recommendContainer(totalCBM) {
  if (totalCBM <= 4.25)  return { primary: 'lcl',      alternatives: ['groupage'] }
  if (totalCBM <= 12.75) return { primary: 'groupage', alternatives: ['20ft'] }
  if (totalCBM <= 28.2)  return { primary: '20ft',     alternatives: ['20ft_hc', 'groupage'] }
  if (totalCBM <= 31.7)  return { primary: '20ft_hc',  alternatives: ['40ft'] }
  if (totalCBM <= 57.5)  return { primary: '40ft',     alternatives: ['40ft_hc'] }
  return { primary: '40ft_hc', alternatives: ['40ft'] }
}

export function getFillPercent(cbm, containerKey) {
  const c = CONTAINERS[containerKey]
  if (!c) return 0
  return Math.min(Math.round((cbm / c.maxCBM) * 100), 100)
}

export function formatCBM(n) {
  return parseFloat(n).toFixed(2)
}
