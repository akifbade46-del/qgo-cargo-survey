import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { FileText, Download, Mail, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { formatCurrency, calculateQuote } from '@/utils/pricing'
import { formatCBM, getFillPercent, CONTAINERS } from '@/utils/cbm'
import SignatureCanvas, { SignatureDisplay } from '@/components/common/SignatureCanvas'
import QgoLogo from '@/components/common/QgoLogo'

// Default branding colors (fallback)
const DEFAULT_BRANDING = {
  color_primary: '#0D5C9E',
  color_secondary: '#90CCE0',
  color_navy: '#083D6E',
  company_name: 'Q\'go Cargo',
  company_tagline: 'International Moving & Logistics',
  company_address: 'Kuwait | UAE | Saudi Arabia | Qatar',
  logo_url: null,
  pdf_footer_text: 'Thank you for choosing Q\'go Cargo for your moving needs.',
  pdf_terms: [
    '1. This quote is valid for 30 days from the date of issue.',
    '2. Final price may vary based on actual weight/volume measurement.',
    '3. Payment terms: 50% advance, 50% before delivery.',
    '4. Insurance is optional but recommended for valuable items.',
    '5. Customs duties and taxes at destination are not included.',
    '6. Q\'go Cargo reserves the right to adjust pricing for special requirements.'
  ]
}

/**
 * PDF Quote Generator Component
 * Generates professional PDF quotes with company branding
 */
export default function PDFQuoteGenerator({ survey, rooms, report, onQuoteGenerated }) {
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [signature, setSignature] = useState(report?.customer_signature_data || null)
  const [quoteData, setQuoteData] = useState(null)
  const [branding, setBranding] = useState(DEFAULT_BRANDING)

  // Load branding settings on mount
  useEffect(() => {
    loadBrandingSettings()
  }, [])

  async function loadBrandingSettings() {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', [
          'color_primary', 'color_secondary', 'color_navy',
          'company_name', 'company_tagline', 'company_address',
          'logo_url', 'pdf_footer_text', 'pdf_terms'
        ])

      if (data) {
        const settings = { ...DEFAULT_BRANDING }
        data.forEach(({ key, value }) => {
          if (value) {
            if (key === 'pdf_terms') {
              try {
                settings[key] = JSON.parse(value)
              } catch {
                settings[key] = value.split('\n').filter(t => t.trim())
              }
            } else {
              settings[key] = value
            }
          }
        })
        setBranding(settings)
      }
    } catch (err) {
      console.error('Failed to load branding settings:', err)
    }
  }

  const totalCBM = rooms?.flatMap(r => r.survey_items).reduce((a, i) => a + (parseFloat(i.cbm) * i.quantity || 0), 0) || 0
  const containerType = survey?.selected_container || report?.recommended_container
  const container = CONTAINERS[containerType] || { label: containerType, color: '#0D5C9E' }

  // Load quote data on mount
  useState(() => {
    loadQuoteData()
  }, [])

  async function loadQuoteData() {
    const quote = await calculateQuote(
      containerType,
      totalCBM,
      survey?.move_type || 'international',
      survey?.additional_services || [],
      survey?.from_country || 'Kuwait'
    )
    setQuoteData(quote)
  }

  // Helper function to load image and get dimensions
  function loadImageWithDimensions(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const maxWidth = 80
        const maxHeight = 30
        let imgWidth = img.width || 400
        let imgHeight = img.height || 150

        // Scale down if too large
        if (imgWidth > maxWidth) {
          const ratio = maxWidth / imgWidth
          imgWidth = maxWidth
          imgHeight = imgHeight * ratio
        }
        if (imgHeight > maxHeight) {
          const ratio = maxHeight / imgHeight
          imgHeight = maxHeight
          imgWidth = imgWidth * ratio
        }

        resolve({ width: imgWidth, height: imgHeight, data: src })
      }
      img.onerror = () => reject(new Error('Failed to load signature image'))
      img.src = src
    })
  }

  // Helper to convert hex color to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 13, g: 92, b: 158 }
  }

  // Helper to load logo image as base64 (handles URLs, data URLs, and relative paths)
  async function loadLogoAsBase64(logoUrl) {
    if (!logoUrl) return null

    // If already a base64 data URL, return as-is
    if (logoUrl.startsWith('data:image/')) {
      return logoUrl
    }

    // Build full URL for relative paths
    let fullUrl = logoUrl
    if (logoUrl.startsWith('/')) {
      fullUrl = window.location.origin + logoUrl
    }

    // Fetch and convert to base64
    if (fullUrl.startsWith('http') || fullUrl.startsWith(window.location.origin)) {
      try {
        const response = await fetch(fullUrl)
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (err) {
        console.error('Failed to load logo:', err)
        return null
      }
    }

    return null
  }

  async function generatePDF() {
    setGenerating(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // Get branding colors as RGB
      const primaryRgb = hexToRgb(branding.color_primary)
      const navyRgb = hexToRgb(branding.color_navy)

      // Company Header with branding color
      doc.setFillColor(navyRgb.r, navyRgb.g, navyRgb.b)
      doc.rect(0, 0, pageWidth, 45, 'F')

      // Try to load and add logo image
      let logoAdded = false
      if (branding.logo_url) {
        try {
          const logoBase64 = await loadLogoAsBase64(branding.logo_url)
          if (logoBase64) {
            // Add logo image (centered in header)
            const logoWidth = 50
            const logoHeight = 20
            doc.addImage(logoBase64, 'PNG', 15, 10, logoWidth, logoHeight)
            logoAdded = true
          }
        } catch (err) {
          console.error('Logo image error:', err)
        }
      }

      // Fallback to text logo if no image
      if (!logoAdded) {
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text(branding.company_name?.toUpperCase() || 'QGO CARGO', 20, 20)
      }

      // Company tagline and address
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(branding.company_tagline || 'International Moving & Logistics', 20, 28)
      doc.text(branding.company_address || 'Kuwait | UAE | Saudi Arabia | Qatar', 20, 34)

      // Quote info on right
      doc.setFontSize(8)
      doc.text(`Quote #: ${survey?.reference_number}`, pageWidth - 20, 20, { align: 'right' })
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 26, { align: 'right' })
      doc.text(`Valid Until: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}`, pageWidth - 20, 32, { align: 'right' })
      doc.text(`Status: ${report?.quote_status || 'Draft'}`, pageWidth - 20, 38, { align: 'right' })

      yPosition = 55

      // Customer Information
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(15, yPosition, pageWidth - 30, 30, 3, 3, 'F')

      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Customer Information', 20, yPosition + 8)

      doc.setTextColor(60, 60, 60)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Name: ${survey?.customer_name || 'N/A'}`, 20, yPosition + 16)
      doc.text(`Email: ${survey?.customer_email || 'N/A'}`, 20, yPosition + 22)
      doc.text(`Phone: ${survey?.customer_phone || survey?.whatsapp_number || 'N/A'}`, 20, yPosition + 28)

      yPosition += 40

      // Route Information
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(15, yPosition, pageWidth - 30, 30, 3, 3, 'F')

      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Route Information', 20, yPosition + 8)

      doc.setTextColor(60, 60, 60)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`From: ${survey?.from_city}, ${survey?.from_country}`, 20, yPosition + 16)
      doc.text(`${survey?.from_address?.substring(0, 50) || ''}...`, 20, yPosition + 22)
      doc.text(`To: ${survey?.to_city}, ${survey?.to_country}`, pageWidth / 2, yPosition + 16)
      doc.text(`${survey?.to_address?.substring(0, 50) || ''}...`, pageWidth / 2, yPosition + 22)
      doc.text(`Move Type: ${survey?.move_type?.toUpperCase() || 'INTERNATIONAL'}`, 20, yPosition + 28)

      yPosition += 40

      // Survey Details
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(15, yPosition, pageWidth - 30, 25, 3, 3, 'F')

      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Survey Details', 20, yPosition + 8)

      doc.setTextColor(60, 60, 60)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Total Items: ${rooms?.flatMap(r => r.survey_items).reduce((a, i) => a + i.quantity, 0) || 0}`, 20, yPosition + 16)
      doc.text(`Total Volume: ${formatCBM(totalCBM)} CBM`, 70, yPosition + 16)
      doc.text(`Recommended Container: ${container.label}`, 150, yPosition + 16)
      doc.text(`Container Fill: ${getFillPercent(totalCBM, containerType)}%`, 20, yPosition + 22)

      yPosition += 35

      // Pricing Breakdown
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Quote Summary', 15, yPosition)

      yPosition += 10

      // Table header
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.rect(15, yPosition, pageWidth - 30, 10, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Description', 20, yPosition + 7)
      doc.text('Details', 100, yPosition + 7)
      doc.text('Amount (KWD)', pageWidth - 20, yPosition + 7, { align: 'right' })

      yPosition += 10

      // Shipping cost row
      doc.setFillColor(yPosition % 20 === 0 ? 248 : 255, yPosition % 20 === 0 ? 250 : 255, yPosition % 20 === 0 ? 252 : 255)
      doc.rect(15, yPosition, pageWidth - 30, 10, 'F')

      doc.setTextColor(60, 60, 60)
      doc.setFont('helvetica', 'normal')
      doc.text('Shipping Cost', 20, yPosition + 7)
      doc.text(`${container.label} (${formatCBM(totalCBM)} CBM)`, 100, yPosition + 7)
      doc.text(formatCurrency(quoteData?.shipping?.total || 0), pageWidth - 20, yPosition + 7, { align: 'right' })

      yPosition += 10

      // Additional services
      if (quoteData?.additional_services?.length > 0) {
        quoteData.additional_services.forEach(service => {
          doc.setFillColor(yPosition % 20 === 0 ? 248 : 255, yPosition % 20 === 0 ? 250 : 255, yPosition % 20 === 0 ? 252 : 255)
          doc.rect(15, yPosition, pageWidth - 30, 10, 'F')

          doc.text(service.name, 20, yPosition + 7)
          doc.text(formatCurrency(service.cost), pageWidth - 20, yPosition + 7, { align: 'right' })
          yPosition += 10
        })
      }

      // Total row
      yPosition += 5
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.rect(15, yPosition, pageWidth - 30, 12, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL', 20, yPosition + 8)
      doc.text(formatCurrency(quoteData?.total || 0), pageWidth - 20, yPosition + 8, { align: 'right' })

      yPosition += 20

      // Terms & Conditions
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Terms & Conditions', 15, yPosition)

      yPosition += 7
      doc.setTextColor(80, 80, 80)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')

      const terms = branding.pdf_terms || [
        '1. This quote is valid for 30 days from the date of issue.',
        '2. Final price may vary based on actual weight/volume measurement.',
        '3. Payment terms: 50% advance, 50% before delivery.',
        '4. Insurance is optional but recommended for valuable items.',
        '5. Customs duties and taxes at destination are not included.',
        '6. Q\'go Cargo reserves the right to adjust pricing for special requirements.'
      ]

      terms.forEach(term => {
        if (yPosition < pageHeight - 20) {
          doc.text(term, 15, yPosition)
          yPosition += 5
        }
      })

      // Signature section
      if (signature) {
        yPosition = pageHeight - 60

        // Section border
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.5)
        doc.line(15, yPosition + 10, pageWidth - 15, yPosition + 10)

        // Title
        doc.setFontSize(11)
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
        doc.setFont('helvetica', 'bold')
        doc.text('Customer Acceptance', 15, yPosition + 20)

        // Signature label
        doc.setFontSize(9)
        doc.setTextColor(80, 80, 80)
        doc.setFont('helvetica', 'normal')
        doc.text('Signature:', 15, yPosition + 8)

        // Load signature image with proper dimensions (await before continuing)
        try {
          const sigImage = await loadImageWithDimensions(signature)
          doc.addImage(sigImage.data, 'JPEG', 15, yPosition - 5, sigImage.width, sigImage.height)
        } catch (err) {
          console.error('Signature image error:', err)
        }

        // Signature line
        doc.setDrawColor(200, 200, 200)
        doc.line(15, yPosition - 30, pageWidth - 15, yPosition - 30)

        // Date and name placeholders
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('Date: ________________', 15, yPosition - 25)
        doc.text('Printed Name: ________________', pageWidth - 80, yPosition - 25)
      }

      // New page for item details if needed
      if (rooms && rooms.length > 0) {
        doc.addPage()
        yPosition = 20

        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Inventory Details', 15, yPosition)

        yPosition += 15

        rooms.forEach(room => {
          if (yPosition > pageHeight - 40) {
            doc.addPage()
            yPosition = 20
          }

          doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text(`🏠 ${room.room_name}`, 15, yPosition)
          yPosition += 7

          doc.setTextColor(80, 80, 80)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')

          room.survey_items?.forEach(item => {
            if (yPosition > pageHeight - 20) {
              doc.addPage()
              yPosition = 20
            }
            doc.text(`  • ${item.custom_name} × ${item.quantity} (${(parseFloat(item.cbm) * item.quantity).toFixed(3)} CBM)`, 15, yPosition)
            yPosition += 5
          })

          yPosition += 5
        })
      }

      // Footer on every page
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          branding.pdf_footer_text || 'Thank you for choosing Q\'go Cargo for your moving needs.',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 15,
          pageHeight - 10,
          { align: 'right' }
        )
      }

      // Save PDF
      const companyPrefix = branding.company_name?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'QGO'
      const filename = `${companyPrefix}_Quote_${survey?.reference_number}_${Date.now()}.pdf`
      doc.save(filename)

      // Upload to Supabase Storage
      await uploadPDFToSupabase(doc, filename)

      toast.success('Quote generated successfully!')
      onQuoteGenerated?.(filename)
    } catch (err) {
      console.error('PDF generation error:', err)
      toast.error('Failed to generate quote')
    } finally {
      setGenerating(false)
    }
  }

  async function uploadPDFToSupabase(doc, filename) {
    try {
      const pdfBlob = doc.output('arraybuffer')
      const { data, error } = await supabase.storage
        .from('quotes')
        .upload(`${survey?.id}/${filename}`, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('quotes')
        .getPublicUrl(data.path)

      // Update survey report with PDF URL
      await supabase
        .from('survey_reports')
        .update({
          pdf_url: publicUrl,
          pdf_generated_at: new Date().toISOString()
        })
        .eq('survey_request_id', survey?.id)

      return publicUrl
    } catch (err) {
      console.error('PDF upload error:', err)
      // Don't throw - the PDF was already saved locally
    }
  }

  async function saveSignature() {
    if (!signature) {
      return toast.error('Please provide your signature first')
    }

    try {
      await supabase
        .from('survey_reports')
        .update({
          customer_signature_data: signature,
          customer_signed_at: new Date().toISOString(),
          customer_ip_address: null, // Would need backend to get real IP
          quote_status: 'accepted'
        })
        .eq('survey_request_id', survey?.id)

      toast.success('Signature saved successfully!')
    } catch (err) {
      console.error('Signature save error:', err)
      toast.error('Failed to save signature')
    }
  }

  async function sendQuoteEmail() {
    setSending(true)
    try {
      const { error } = await supabase.functions.invoke('send-quote-email', {
        body: {
          surveyId: survey?.id,
          customerEmail: survey?.customer_email,
          customerName: survey?.customer_name
        }
      })

      if (error) throw error

      await supabase
        .from('survey_reports')
        .update({ quote_status: 'sent' })
        .eq('survey_request_id', survey?.id)

      toast.success('Quote sent to customer!')
    } catch (err) {
      console.error('Email send error:', err)
      toast.error('Failed to send quote email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={generatePDF}
          disabled={generating}
          className="btn-primary flex items-center gap-2"
        >
          {generating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <FileText size={18} />
          )}
          {generating ? 'Generating...' : 'Generate PDF Quote'}
        </button>

        {report?.pdf_url && (
          <button
            onClick={sendQuoteEmail}
            disabled={sending}
            className="btn-secondary flex items-center gap-2"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Mail size={18} />
            )}
            {sending ? 'Sending...' : 'Email to Customer'}
          </button>
        )}
      </div>

      {/* Quote Preview */}
      {quoteData && (
        <div className="card !p-6">
          <h3 className="font-bold text-lg text-qgo-text mb-4">Quote Preview</h3>

          {/* Pricing Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Shipping Cost ({container.label})</span>
              <span className="font-semibold">{formatCurrency(quoteData.shipping?.total || 0)}</span>
            </div>

            {quoteData.additional_services?.map(service => (
              <div key={service.key} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{service.name}</span>
                <span className="font-semibold">{formatCurrency(service.cost)}</span>
              </div>
            ))}

            <div className="flex justify-between items-center py-3 bg-qgo-navy text-white px-4 rounded-lg">
              <span className="font-bold">Total Amount</span>
              <span className="font-bold text-xl">{formatCurrency(quoteData.total || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Signature Section */}
      <div className="card !p-6">
        <h3 className="font-bold text-lg text-qgo-text mb-4 flex items-center gap-2">
          <CheckCircle size={20} className={signature ? 'text-green-600' : 'text-gray-400'} />
          Customer Signature
        </h3>

        {report?.customer_signature_data && !signature ? (
          <SignatureDisplay
            signatureData={report.customer_signature_data}
            signedAt={report.customer_signed_at}
          />
        ) : (
          <>
            <SignatureCanvas
              value={signature}
              onChange={setSignature}
            />

            {signature && (
              <button
                onClick={saveSignature}
                className="mt-4 btn-primary w-full"
              >
                Save Signature & Accept Quote
              </button>
            )}
          </>
        )}
      </div>

      {/* Quote Status Badge */}
      {report?.quote_status && (
        <div className="flex items-center justify-center">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            report.quote_status === 'accepted' ? 'bg-green-100 text-green-700' :
            report.quote_status === 'sent' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            Quote Status: {report.quote_status.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}
