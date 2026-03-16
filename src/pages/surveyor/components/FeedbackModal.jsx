import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, MessageSquare, Send, Check, Loader, MessageCircle, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function FeedbackModal({ isOpen, onClose, survey, onComplete }) {
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState('')
  const [customerName, setCustomerName] = useState(survey?.customer_name || '')
  const [customerEmail, setCustomerEmail] = useState(survey?.customer_email || '')
  const [customerPhone, setCustomerPhone] = useState(survey?.customer_phone || '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSending(true)
    try {
      // Save feedback
      const { error } = await supabase
        .from('survey_feedback')
        .insert([{
          survey_request_id: survey.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          rating,
          comments: comments.trim() || null
        }])

      if (error) throw error

      // Mark survey as feedback sent
      await supabase
        .from('survey_requests')
        .update({
          feedback_sent: true,
          feedback_sent_at: new Date().toISOString()
        })
        .eq('id', survey.id)

      // Send notifications (via edge function or webhook)
      await sendNotifications()

      setSent(true)
      toast.success('Feedback submitted!')

      setTimeout(() => {
        if (onComplete) onComplete()
        onClose()
      }, 2000)

    } catch (err) {
      toast.error('Failed to submit feedback')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const sendNotifications = async () => {
    const message = `Survey Feedback Received!

Survey: ${survey.reference_number}
Customer: ${customerName}
Rating: ${'⭐'.repeat(rating)} (${rating}/5)
${comments ? `Comments: ${comments}` : ''}

From: Q'go Cargo Survey System`

    // WhatsApp notification (via Twilio or similar)
    if (customerPhone) {
      try {
        // Using a webhook/edge function for WhatsApp
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerPhone,
            message: `Thank you ${customerName}! Your feedback (${rating}/5) has been recorded. Thank you for choosing Q'go Cargo!`
          })
        }).catch(() => {}) // Silent fail if endpoint not configured
      } catch (e) {
        console.log('WhatsApp notification skipped')
      }
    }

    // Email notification
    if (customerEmail) {
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerEmail,
            subject: `Survey Feedback - ${survey.reference_number}`,
            body: message
          })
        }).catch(() => {}) // Silent fail if endpoint not configured
      } catch (e) {
        console.log('Email notification skipped')
      }
    }
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Survey Feedback\n\nSurvey: ${survey.reference_number}\nCustomer: ${customerName}\nRating: ${rating}/5\n${comments ? `Comments: ${comments}` : ''}`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-primary)' }}
          onClick={e => e.stopPropagation()}
        >
          {sent ? (
            // Success State
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
              >
                <Check size={32} className="text-green-600" />
              </motion.div>
              <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Thank You!
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your feedback has been submitted successfully.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                  Survey Feedback
                </h3>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={20} style={{ color: 'var(--text-tertiary)' }} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Survey Info */}
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Survey</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{survey?.reference_number}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{customerName}</p>
                </div>

                {/* Rating */}
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    How was your experience?
                  </label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-2 transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          fill={star <= rating ? '#fbbf24' : 'none'}
                          stroke={star <= rating ? '#fbbf24' : 'var(--text-tertiary)'}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {rating === 0 ? 'Tap to rate' : `${rating}/5 - ${rating >= 4 ? 'Great!' : rating >= 3 ? 'Good' : 'Needs Improvement'}`}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Email</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full p-2 rounded-lg text-sm"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Phone</label>
                    <input
                      type="tel"
                      placeholder="+965 xxxxxxxx"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full p-2 rounded-lg text-sm"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                    Comments (Optional)
                  </label>
                  <textarea
                    placeholder="Any additional feedback..."
                    rows={3}
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm resize-none"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={handleSubmit}
                  disabled={sending || rating === 0}
                  className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {sending ? (
                    <><Loader size={18} className="animate-spin" /> Submitting...</>
                  ) : (
                    <><Send size={18} /> Submit Feedback</>
                  )}
                </button>

                {/* Quick Share Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm bg-green-500 text-white"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                  <a
                    href={`mailto:?subject=Survey Feedback - ${survey?.reference_number}&body=Rating: ${rating}/5%0AComments: ${comments}`}
                    className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm bg-blue-500 text-white"
                  >
                    <Mail size={16} /> Email
                  </a>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
