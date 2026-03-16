/**
 * i18n utilities for multi-language support
 */

export function getDirection(language) {
  return language === 'ar' ? 'rtl' : 'ltr'
}

export function isRTL(language) {
  return language === 'ar'
}

export function getTextAlignment(language) {
  return language === 'ar' ? 'right' : 'left'
}

/**
 * Format number based on locale
 */
export function formatNumber(num, language = 'en') {
  const locale = language === 'ar' ? 'ar-KW' : 'en-US'
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Format currency based on locale
 */
export function formatCurrencyAmount(amount, currency = 'KWD', language = 'en') {
  const locale = language === 'ar' ? 'ar-KW' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format date based on locale
 */
export function formatDate(date, language = 'en', options = {}) {
  const locale = language === 'ar' ? 'ar-KW' : 'en-US'
  return new Intl.DateTimeFormat(locale, options).format(new Date(date))
}

/**
 * Get localized container name
 */
export function getContainerName(type, language = 'en') {
  const containers = {
    lcl: { en: 'LCL (Less than Container)', ar: 'أقل من حاوية (LCL)' },
    groupage: { en: 'Groupage (Shared Container)', ar: 'حاوية مشتركة' },
    '20ft': { en: '20ft Standard', ar: '20 قدم قياسي' },
    '20ft_hc': { en: '20ft High Cube', ar: '20 قدم عالي الارتفاع' },
    '40ft': { en: '40ft Standard', ar: '40 قدم قياسي' },
    '40ft_hc': { en: '40ft High Cube', ar: '40 قدم عالي الارتفاع' }
  }
  return containers[type]?.[language] || type
}

/**
 * Get localized status name
 */
export function getStatusName(status, language = 'en') {
  const statuses = {
    pending: { en: 'Pending', ar: 'قيد الانتظار' },
    assigned: { en: 'Assigned', ar: 'تم التعيين' },
    in_progress: { en: 'In Progress', ar: 'قيد التنفيذ' },
    surveyed: { en: 'Surveyed', ar: 'تم المسح' },
    completed: { en: 'Completed', ar: 'مكتمل' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' }
  }
  return statuses[status]?.[language] || status
}
