/**
 * WhatsApp Integration Utility
 * Generate WhatsApp links and send messages via WhatsApp API
 */

// WhatsApp Business API credentials (configured in Supabase Edge Functions)
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'
const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID

/**
 * Generate a WhatsApp link for opening a chat with pre-filled message
 */
export function generateWhatsAppLink(phoneNumber, message = '') {
  // Remove all non-numeric characters
  const cleanNumber = phoneNumber?.replace(/\D/g, '') || ''

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
}

/**
 * Generate WhatsApp link with tracking info
 */
export function generateTrackingWhatsAppLink(trackingToken, customerName = '') {
  const trackingUrl = `${window.location.origin}/track/${trackingToken}`
  const message = `Hello ${customerName}!👋

Thank you for choosing Q'go Cargo!

Track your shipment here: ${trackingUrl}

If you have any questions, feel free to ask.
- Q'go Cargo Team`

  return generateWhatsAppLink('', message)
}

/**
 * Generate WhatsApp link for survey confirmation
 */
export function generateConfirmationWhatsAppLink(referenceNumber, customerName = '', surveyDate = '') {
  const message = `Hello ${customerName}! 🎉

Your survey request has been received!

📋 Reference: ${referenceNumber}
📅 Survey Date: ${surveyDate || 'To be confirmed'}

Our team will contact you shortly to confirm the appointment.

- Q'go Cargo Team`

  return generateWhatsAppLink('', message)
}

/**
 * Generate WhatsApp link for surveyor assignment
 */
export function generateSurveyorAssignedWhatsAppLink(referenceNumber, surveyorName = '', surveyDate = '') {
  const message = `Great news! 🚚

Your survey has been assigned to ${surveyorName}.

📋 Reference: ${referenceNumber}
👤 Surveyor: ${surveyorName}
📅 Date: ${surveyDate || 'To be confirmed'}

Track your surveyor's location on the day of survey.

- Q'go Cargo Team`

  return generateWhatsAppLink('', message)
}

/**
 * Generate WhatsApp link for quote ready
 */
export function generateQuoteReadyWhatsAppLink(referenceNumber, quoteAmount = '', currency = 'KWD') {
  const quoteUrl = `${window.location.origin}/quote/${referenceNumber}`
  const message = `Your quote is ready! 📄

📋 Reference: ${referenceNumber}
💰 Amount: ${quoteAmount ? `${quoteAmount} ${currency}` : 'Login to view'}

View and accept your quote here: ${quoteUrl}

This quote is valid for 30 days.

- Q'go Cargo Team`

  return generateWhatsAppLink('', message)
}

/**
 * Generate WhatsApp link for survey completion
 */
export function generateSurveyCompletedWhatsAppLink(referenceNumber, totalCBM = 0, container = '') {
  const message = `Survey Completed! ✅

📋 Reference: ${referenceNumber}
📦 Total Volume: ${totalCBM.toFixed(2)} CBM
🚢 Recommended Container: ${container}

Your detailed quote will be sent shortly.

- Q'go Cargo Team`

  return generateWhatsAppLink('', message)
}

/**
 * Send WhatsApp message via API (requires server-side Edge Function)
 */
export async function sendWhatsAppMessage({
  to,
  templateName,
  templateData = {},
  language = 'en'
}) {
  try {
    // Call Supabase Edge Function for WhatsApp API
    const { data, error } = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to,
        templateName,
        templateData,
        language
      })
    }).then(res => res.json())

    if (error) throw error

    return { success: true, data }
  } catch (err) {
    console.error('WhatsApp API error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Format phone number for WhatsApp API
 */
export function formatPhoneNumber(phoneNumber) {
  // Remove all non-numeric characters
  let cleaned = phoneNumber?.replace(/\D/g, '') || ''

  // Add country code if missing (assuming Kuwait +965)
  if (cleaned.length === 8 && !cleaned.startsWith('965')) {
    cleaned = '965' + cleaned
  }

  return cleaned
}

/**
 * Get WhatsApp share button component props
 */
export function getWhatsAppShareProps({
  type,
  referenceNumber,
  customerName,
  customerPhone,
  ...data
}) {
  const links = {
    confirmation: generateConfirmationWhatsAppLink(referenceNumber, customerName, data.surveyDate),
    assigned: generateSurveyorAssignedWhatsAppLink(referenceNumber, data.surveyorName, data.surveyDate),
    quote_ready: generateQuoteReadyWhatsAppLink(referenceNumber, data.quoteAmount),
    completed: generateSurveyCompletedWhatsAppLink(referenceNumber, data.totalCBM, data.container),
    tracking: generateTrackingWhatsAppLink(data.trackingToken, customerName)
  }

  return {
    url: links[type] || generateWhatsAppLink(customerPhone),
    label: getLabel(type)
  }
}

function getLabel(type) {
  const labels = {
    confirmation: 'Send Confirmation via WhatsApp',
    assigned: 'Notify Surveyor Assigned',
    quote_ready: 'Send Quote via WhatsApp',
    completed: 'Notify Survey Completed',
    tracking: 'Share Tracking Link'
  }
  return labels[type] || 'Send via WhatsApp'
}
