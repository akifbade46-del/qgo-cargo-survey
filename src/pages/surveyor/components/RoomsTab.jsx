import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, Trash2 } from 'lucide-react'

export default function RoomsTab({
  rooms,
  activeRoom,
  onSelectRoom,
  onAddRoom,
  onDeleteRoom
}) {
  const colors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-purple-50 border-purple-200',
    'bg-orange-50 border-orange-200',
    'bg-pink-50 border-pink-200',
    'bg-teal-50 border-teal-200'
  ]

  return (
    <div className="p-4 space-y-3 pb-24">
      <AnimatePresence mode="popLayout">
        {rooms.map((room, index) => {
          const itemCount = room.survey_items?.length || 0
          const totalCb = room.survey_items?.reduce((sum, item) =>
            sum + (item.cbm * (item.quantity || 1)), 0) || 0
          const isSelected = activeRoom === room.id

          return (
            <motion.div
              key={room.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              onClick={() => onSelectRoom(room.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : `${colors[index % colors.length]} hover:shadow-md`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-green-500 text-white' : 'bg-white'
                  }`}>
                    <Home size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{room.room_name}</h3>
                    <p className="text-sm text-gray-500">
                      {itemCount} items • {totalCb.toFixed(2)} CBM
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteRoom(room.id)
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Add Room Button */}
      <button
        onClick={onAddRoom}
        className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-300
                   flex items-center justify-center gap-2 text-gray-500
                   hover:border-green-500 hover:text-green-500 transition-colors"
      >
        <Plus size={20} />
        <span className="font-medium">Add Room</span>
      </button>
    </div>
  )
}
