import { DollarSign, Info } from 'lucide-react'
import SettingInput from '../SettingInput'

export default function PricingTab({ settings, updateSetting }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <DollarSign className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-bold text-qgo-text">Pricing Defaults</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          These are default pricing values. You can override them per quote or customer as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput
          label="Default CBM Rate"
          type="number"
          step="0.01"
          value={settings.default_cbm_rate}
          onChange={v => updateSetting('default_cbm_rate', v)}
          placeholder="15.00"
        />
        <SettingInput
          label="Insurance Percentage"
          type="number"
          step="0.1"
          value={settings.insurance_percent}
          onChange={v => updateSetting('insurance_percent', v)}
          placeholder="1.5"
        />
        <SettingInput
          label="Tax Percentage"
          type="number"
          step="0.1"
          value={settings.tax_percent}
          onChange={v => updateSetting('tax_percent', v)}
          placeholder="5.0"
        />
        <SettingInput
          label="Minimum Charge"
          type="number"
          step="0.01"
          value={settings.minimum_charge}
          onChange={v => updateSetting('minimum_charge', v)}
          placeholder="50.00"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-500">CBM Rate</p>
          <p className="text-xl font-bold text-qgo-blue">{settings.default_cbm_rate || '15.00'}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Insurance</p>
          <p className="text-xl font-bold text-qgo-blue">{settings.insurance_percent || '1.5'}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Tax</p>
          <p className="text-xl font-bold text-qgo-blue">{settings.tax_percent || '5.0'}%</p>
        </div>
      </div>
    </div>
  )
}
