import { Scale, FileText, Shield } from 'lucide-react'

export default function LegalTab({ settings, updateSetting }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Scale className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-bold text-qgo-text">Legal Documents</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          These legal documents will be displayed on your website and can be referenced in your quotes and contracts.
        </p>
      </div>

      {/* Terms & Conditions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-qgo-blue" />
          <h3 className="font-semibold text-gray-700">Terms & Conditions</h3>
        </div>
        <textarea
          className="input min-h-[150px] font-mono text-sm"
          value={settings.terms_content || ''}
          onChange={e => updateSetting('terms_content', e.target.value)}
          placeholder="Enter your terms and conditions..."
        />
      </div>

      {/* Privacy Policy */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-green-600" />
          <h3 className="font-semibold text-gray-700">Privacy Policy</h3>
        </div>
        <textarea
          className="input min-h-[150px] font-mono text-sm"
          value={settings.privacy_content || ''}
          onChange={e => updateSetting('privacy_content', e.target.value)}
          placeholder="Enter your privacy policy..."
        />
      </div>

      {/* Refund Policy */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-gray-700">Refund & Cancellation Policy</h3>
        </div>
        <textarea
          className="input min-h-[150px] font-mono text-sm"
          value={settings.refund_content || ''}
          onChange={e => updateSetting('refund_content', e.target.value)}
          placeholder="Enter your refund policy..."
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Tip:</strong> Use markdown formatting for headers, lists, and emphasis. These documents will be rendered on your legal pages.
        </p>
      </div>
    </div>
  )
}
