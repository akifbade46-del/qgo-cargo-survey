import { Switch } from '@/components/ui/switch'

export default function SettingToggle({ label, description, checked, onChange, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <label className="flex items-center gap-2 font-medium text-gray-700">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </label>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  )
}
