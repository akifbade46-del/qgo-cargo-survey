import { FileText, Image, Type, AlignLeft, List, Palette } from 'lucide-react'

export default function PDFTab({ settings, updateSetting }) {
  return (
    <div className="space-y-8">
      {/* Logo Settings */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-qgo-blue" />
          <h3 className="font-semibold text-lg">PDF Logo</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Logo URL</label>
            <input
              type="url"
              className="input"
              placeholder="https://example.com/logo.png"
              value={settings.logo_url || ''}
              onChange={(e) => updateSetting('logo_url', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the URL of your logo image (PNG, JPG recommended). This will appear in PDF quotes and invoices.
            </p>
          </div>
          <div>
            <label className="label">Logo Preview</label>
            {settings.logo_url ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-24 flex items-center justify-center">
                <img
                  src={settings.logo_url}
                  alt="Logo Preview"
                  className="max-h-16 max-w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <span className="text-red-500 text-sm hidden">Failed to load image</span>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 h-24 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No logo configured</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Company Info on PDF */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-qgo-blue" />
          <h3 className="font-semibold text-lg">Company Information (PDF Header)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Company Name</label>
            <input
              type="text"
              className="input"
              placeholder="Q'go Cargo"
              value={settings.company_name || ''}
              onChange={(e) => updateSetting('company_name', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input
              type="text"
              className="input"
              placeholder="International Moving & Logistics"
              value={settings.company_tagline || ''}
              onChange={(e) => updateSetting('company_tagline', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Address Line (Locations)</label>
            <input
              type="text"
              className="input"
              placeholder="Kuwait | UAE | Saudi Arabia | Qatar"
              value={settings.company_address || ''}
              onChange={(e) => updateSetting('company_address', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* PDF Colors */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-qgo-blue" />
          <h3 className="font-semibold text-lg">PDF Branding Colors</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          These colors are shared with the Branding tab and will be applied to PDF headers, titles, and accents.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                value={settings.color_primary || '#0D5C9E'}
                onChange={(e) => updateSetting('color_primary', e.target.value)}
              />
              <input
                type="text"
                className="input flex-1"
                placeholder="#0D5C9E"
                value={settings.color_primary || ''}
                onChange={(e) => updateSetting('color_primary', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Secondary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                value={settings.color_secondary || '#90CCE0'}
                onChange={(e) => updateSetting('color_secondary', e.target.value)}
              />
              <input
                type="text"
                className="input flex-1"
                placeholder="#90CCE0"
                value={settings.color_secondary || ''}
                onChange={(e) => updateSetting('color_secondary', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Navy/Dark Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                value={settings.color_navy || '#083D6E'}
                onChange={(e) => updateSetting('color_navy', e.target.value)}
              />
              <input
                type="text"
                className="input flex-1"
                placeholder="#083D6E"
                value={settings.color_navy || ''}
                onChange={(e) => updateSetting('color_navy', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Text */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlignLeft className="w-5 h-5 text-qgo-blue" />
          <h3 className="font-semibold text-lg">PDF Footer</h3>
        </div>
        <div>
          <label className="label">Footer Text</label>
          <textarea
            className="input min-h-[80px]"
            placeholder="Thank you for choosing Q'go Cargo for your moving needs."
            value={settings.pdf_footer_text || ''}
            onChange={(e) => updateSetting('pdf_footer_text', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            This text will appear at the bottom of every PDF page.
          </p>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <List className="w-5 h-5 text-qgo-blue" />
          <h3 className="font-semibold text-lg">Terms & Conditions (PDF)</h3>
        </div>
        <div>
          <label className="label">Terms for Quotes/Invoices</label>
          <textarea
            className="input min-h-[200px] font-mono text-sm"
            placeholder={`1. This quote is valid for 30 days from the date of issue.
2. Final price may vary based on actual weight/volume measurement.
3. Payment terms: 50% advance, 50% before delivery.
4. Insurance is optional but recommended for valuable items.
5. Customs duties and taxes at destination are not included.
6. Q'go Cargo reserves the right to adjust pricing for special requirements.`}
            value={settings.pdf_terms || ''}
            onChange={(e) => updateSetting('pdf_terms', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter each term on a new line. These will appear in the Terms & Conditions section of generated PDFs.
          </p>
        </div>
      </section>

      {/* Additional PDF Settings */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-qgo-blue" />
          <h3 className="font-semibold text-lg">Additional Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Quote Validity (Days)</label>
            <input
              type="number"
              className="input"
              placeholder="30"
              value={settings.quote_validity_days || ''}
              onChange={(e) => updateSetting('quote_validity_days', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Payment Terms</label>
            <select
              className="input"
              value={settings.payment_terms || ''}
              onChange={(e) => updateSetting('payment_terms', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="50-50">50% Advance, 50% Before Delivery</option>
              <option value="full">100% Advance</option>
              <option value="on-delivery">Payment on Delivery</option>
              <option value="net-30">Net 30 Days</option>
              <option value="net-15">Net 15 Days</option>
            </select>
          </div>
          <div>
            <label className="label">Currency Symbol</label>
            <input
              type="text"
              className="input"
              placeholder="KWD"
              maxLength={5}
              value={settings.currency || ''}
              onChange={(e) => updateSetting('currency', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Show Prices in PDF</label>
            <select
              className="input"
              value={settings.pdf_show_prices || 'yes'}
              onChange={(e) => updateSetting('pdf_show_prices', e.target.value)}
            >
              <option value="yes">Yes - Show all prices</option>
              <option value="subtotal">Subtotal only</option>
              <option value="no">No prices (estimate only)</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  )
}
