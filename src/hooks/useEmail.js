import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function useEmail() {
  async function sendEmail(type, survey_request_id) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { type, survey_request_id }
      })
      if (error) throw error
      toast.success('Email sent!')
      return data
    } catch (err) {
      toast.error(`Email failed: ${err.message}`)
      throw err
    }
  }

  return {
    sendConfirmation: (id) => sendEmail('confirmation', id),
    sendAssigned:     (id) => sendEmail('assigned', id),
    sendReportReady:  (id) => sendEmail('report_ready', id),
  }
}
