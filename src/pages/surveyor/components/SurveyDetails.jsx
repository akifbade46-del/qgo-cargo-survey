import { motion } from 'framer-motion'
import {
  User, Phone, Mail, MapPin, Truck, Package,
  Calendar, FileText, Play
} from 'lucide-react'

export default function SurveyDetails({ survey, onStart }) {
  if (!survey) return null

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-80">Survey Request</p>
              <h1 className="text-xl font-bold">#{survey.reference_number}</h1>
            </div>
            <div className="px-3 py-1 bg-white/20 rounded-lg text-sm">
              {survey.status || 'Pending'}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Calendar size={16} />
            <span>{new Date(survey.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User size={18} className="text-green-500" />
            Customer Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{survey.customer_name}</p>
                <p className="text-sm text-gray-500">Customer</p>
              </div>
            </div>
            {survey.customer_phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={16} />
                <span>{survey.customer_phone}</span>
              </div>
            )}
            {survey.customer_email && (
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={16} />
                <span>{survey.customer_email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Move Details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Truck size={18} className="text-blue-500" />
            Move Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">A</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">From</p>
                <p className="text-sm text-gray-900">{survey.from_address || 'Not specified'}</p>
                <p className="text-xs text-gray-500">{survey.from_city}, {survey.from_country}</p>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-gray-200 ml-4 h-4" />

            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600">B</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">To</p>
                  <p className="text-sm text-gray-900">{survey.to_address || 'Not specified'}</p>
                  <p className="text-xs text-gray-500">{survey.to_city}, {survey.to_country}</p>
                </div>
              </div>
          </div>
        </div>

        {/* Container & Move Type */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-orange-500" />
              <span className="text-xs text-gray-500">Container</span>
            </div>
            <p className="font-semibold text-gray-900">
              {survey.selected_container || 'Not selected'}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-purple-500" />
              <span className="text-xs text-gray-500">Move Type</span>
            </div>
            <p className="font-semibold text-gray-900">
              {survey.move_type || 'Standard'}
            </p>
          </div>
        </div>

        {/* Notes */}
        {survey.notes && (
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
            <h3 className="font-medium text-yellow-800 mb-1">Notes</h3>
            <p className="text-sm text-yellow-700">{survey.notes}</p>
          </div>
        )}

        {/* Start Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-green-600 text-white font-semibold
                   flex items-center justify-center gap-2 shadow-lg mt-4"
        >
          <Play size={20} />
          Start Survey
        </motion.button>
      </div>
    </div>
  )
}
