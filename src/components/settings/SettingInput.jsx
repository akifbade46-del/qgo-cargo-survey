export default function SettingInput({ label, value, onChange, type = 'text', placeholder, required = false, icon: Icon }) {
  return (
    <div>
      <label className="label">
        {Icon && <Icon className="w-4 h-4 inline mr-1" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        className="input"
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
}
