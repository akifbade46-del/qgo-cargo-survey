import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { type, survey_request_id } = await req.json()

    // Get survey details
    const { data: survey } = await supabase
      .from('survey_requests')
      .select('*, survey_reports(*)')
      .eq('id', survey_request_id)
      .single()

    if (!survey) return new Response(JSON.stringify({ error: 'Survey not found' }), { status: 404 })

    // Get SMTP settings
    const { data: settings } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['smtp_host','smtp_port','smtp_user','smtp_pass','smtp_from','smtp_from_name','company_name'])

    const cfg = Object.fromEntries((settings || []).map(s => [s.key, s.value]))

    // Build email content based on type
    let subject = '', html = ''

    if (type === 'confirmation') {
      subject = `Survey Request Confirmed — ${survey.reference_number}`
      html = emailTemplate({
        title: 'Survey Request Received!',
        name: survey.customer_name,
        body: `
          <p>Thank you for requesting a survey with <b>${cfg.company_name || "Q'go Cargo"}</b>.</p>
          <p>Your request has been received and our team will contact you within 24 hours.</p>
          <div style="background:#EAF4FA;padding:16px;border-radius:8px;margin:16px 0">
            <p style="margin:0;font-size:12px;color:#666">Reference Number</p>
            <p style="margin:4px 0 0;font-size:24px;font-weight:900;color:#0D5C9E;letter-spacing:2px">${survey.reference_number}</p>
          </div>
          <p><b>From:</b> ${survey.from_city}, ${survey.from_country}</p>
          <p><b>Preferred Date:</b> ${survey.preferred_date || 'To be confirmed'}</p>
        `,
        companyName: cfg.company_name
      })
    } else if (type === 'assigned') {
      subject = `Surveyor Assigned — ${survey.reference_number}`
      html = emailTemplate({
        title: 'Your Surveyor is Assigned!',
        name: survey.customer_name,
        body: `
          <p>Great news! A surveyor has been assigned to your request.</p>
          <p>You will receive a confirmation call to finalize the appointment time.</p>
          <p><b>Reference:</b> ${survey.reference_number}</p>
          <p><b>Confirmed Date:</b> ${survey.confirmed_date || survey.preferred_date}</p>
        `,
        companyName: cfg.company_name
      })
    } else if (type === 'report_ready') {
      subject = `Survey Report Ready — ${survey.reference_number}`
      html = emailTemplate({
        title: 'Your Survey Report is Ready',
        name: survey.customer_name,
        body: `
          <p>Your survey has been completed and your report is ready.</p>
          ${survey.survey_reports ? `
            <div style="background:#EAF4FA;padding:16px;border-radius:8px;margin:16px 0">
              <p><b>Total CBM:</b> ${survey.survey_reports.total_cbm} CBM</p>
              <p><b>Total Items:</b> ${survey.survey_reports.total_items}</p>
              <p><b>Recommended Container:</b> ${survey.survey_reports.recommended_container || 'To be advised'}</p>
            </div>
          ` : ''}
          <p>Our team will be in touch with a full quotation shortly.</p>
        `,
        companyName: cfg.company_name
      })
    }

    // Send via SMTP using Deno SMTP
    if (cfg.smtp_host && cfg.smtp_user && cfg.smtp_pass) {
      const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')

      const client = new SMTPClient({
        connection: {
          hostname: cfg.smtp_host,
          port: parseInt(cfg.smtp_port || '587'),
          tls: false,
          auth: { username: cfg.smtp_user, password: cfg.smtp_pass }
        }
      })

      await client.send({
        from: `${cfg.smtp_from_name} <${cfg.smtp_from}>`,
        to: survey.customer_email,
        subject,
        html
      })
      await client.close()
    }

    // Log email
    await supabase.from('email_logs').insert([{
      survey_request_id,
      recipient_email: survey.customer_email,
      email_type: type,
      subject,
      status: 'sent',
      sent_at: new Date().toISOString()
    }])

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function emailTemplate({ title, name, body, companyName }: { title: string, name: string, body: string, companyName?: string }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#EAF4FA;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EAF4FA;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;width:100%">
        <!-- Header -->
        <tr>
          <td style="background:#0D5C9E;padding:24px 32px">
            <table width="100%"><tr>
              <td><span style="color:#fff;font-size:22px;font-weight:900">Q</span><span style="color:#fff;font-size:18px;font-weight:700">'go <span style="color:#90CCE0">Cargo</span></span></td>
              <td align="right"><span style="color:rgba(255,255,255,0.6);font-size:12px">Survey Platform</span></td>
            </tr></table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <h1 style="color:#0D5C9E;font-size:22px;margin:0 0 8px">${title}</h1>
            <p style="color:#1A2B3C;font-size:14px">Dear ${name},</p>
            <div style="color:#555;font-size:14px;line-height:1.6">${body}</div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#EAF4FA;padding:20px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#999">This email was sent by ${companyName || "Q'go Cargo"}. Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
