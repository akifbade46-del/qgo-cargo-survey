import { Workflow, Info } from 'lucide-react'
import SettingInput from '../SettingInput'
import SettingToggle from '../SettingToggle'

export default function WorkflowTab({ settings, updateSetting }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Workflow className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-bold text-qgo-text">Survey Workflow</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Configure how surveys are automatically assigned to surveyors and the default timelines.
        </p>
      </div>

      <div className="space-y-4">
        <SettingToggle
          label="Auto-assign Surveys"
          description="Automatically assign new surveys to available surveyors"
          checked={settings.auto_assign_surveys === 'true'}
          onChange={v => updateSetting('auto_assign_surveys', v.toString())}
        />

        <div>
          <label className="label">Assignment Method</label>
          <select
            className="input"
            value={settings.assignment_method || 'manual'}
            onChange={e => updateSetting('assignment_method', e.target.value)}
          >
            <option value="manual">Manual Assignment (Default)</option>
            <option value="round_robin">Round Robin</option>
            <option value="nearest">Nearest Available</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {settings.assignment_method === 'round_robin' && 'Distribute surveys evenly among all surveyors'}
            {settings.assignment_method === 'nearest' && 'Assign to the geographically closest available surveyor'}
            {settings.assignment_method === 'manual' && 'Admin manually assigns each survey'}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-700 mb-4">Timeline Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingInput
            label="Survey Deadline (hours)"
            type="number"
            value={settings.survey_deadline_hours}
            onChange={v => updateSetting('survey_deadline_hours', v)}
            placeholder="48"
          />
          <SettingInput
            label="Reminder Before (hours)"
            type="number"
            value={settings.reminder_before_hours}
            onChange={v => updateSetting('reminder_before_hours', v)}
            placeholder="24"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="text-xl font-bold text-qgo-blue">{settings.survey_deadline_hours || '48'}h</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Reminder</p>
            <p className="text-xl font-bold text-qgo-blue">{settings.reminder_before_hours || '24'}h</p>
          </div>
        </div>
      </div>
    </div>
  )
}
