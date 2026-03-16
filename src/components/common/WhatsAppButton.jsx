import { MessageCircle } from 'lucide-react'
import { getWhatsAppShareProps } from '@/utils/whatsapp'

/**
 * WhatsApp Share Button Component
 * Opens WhatsApp with pre-filled message
 */
export default function WhatsAppButton({
  type = 'confirmation',
  referenceNumber,
  customerName,
  customerPhone,
  surveyorName,
  surveyDate,
  quoteAmount,
  totalCBM,
  container,
  trackingToken,
  className = '',
  label
}) {
  const props = getWhatsAppShareProps({
    type,
    referenceNumber,
    customerName,
    customerPhone,
    surveyorName,
    surveyDate,
    quoteAmount,
    totalCBM,
    container,
    trackingToken
  })

  const handleClick = () => {
    // Open WhatsApp in new tab
    window.open(props.url, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium ${className}`}
    >
      <MessageCircle size={18} />
      {label || props.label}
    </button>
  )
}

/**
 * Quick WhatsApp Icon Button
 */
export function WhatsAppIconLink({ phoneNumber, message, size = 'md' }) {
  const link = `https://wa.me/${phoneNumber?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message || '')}`

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${sizeClasses[size]} bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl`}
      title="Chat on WhatsApp"
    >
      <MessageCircle size={size === 'sm' ? 16 : size === 'lg' ? 28 : 20} />
    </a>
  )
}
