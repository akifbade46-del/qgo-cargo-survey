import { useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RoomTabs({ rooms, activeRoom, onSelectRoom, onAddRoom }) {
  const scrollRef = useRef(null)
  const activeRef = useRef(null)

  // Scroll active tab into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeRoom])

  return (
    <div className="flex items-center gap-2">
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto flex gap-2 pb-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {rooms.map(room => {
          const isActive = activeRoom === room.id
          return (
            <motion.button
              key={room.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSelectRoom(room.id)}
              className={`room-tab ${isActive ? 'active' : ''}`}
              whileTap={{ scale: 0.95 }}
            >
              {room.room_name}
              <span className="ml-1.5 opacity-70 text-xs">
                ({room.survey_items?.length || 0})
              </span>
            </motion.button>
          )
        })}
      </div>
      <button
        onClick={onAddRoom}
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)'
        }}
      >
        <Plus size={18} />
      </button>
    </div>
  )
}
