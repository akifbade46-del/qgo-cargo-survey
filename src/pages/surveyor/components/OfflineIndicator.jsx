import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingSync, setPendingSync] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't show anything when online and no pending syncs
  if (isOnline && pendingSync === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`fixed top-0 left-0 right-0 py-2 px-4 text-center text-sm font-medium z-50 flex items-center justify-center gap-2 ${
          isOnline ? 'bg-amber-500' : 'bg-red-500'
        } text-white`}
      >
        {isOnline ? (
          <>
            <Cloud className="w-4 h-4" />
            <span>Syncing {pendingSync} changes...</span>
            <RefreshCw className="w-4 h-4 animate-spin" />
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Changes will sync when connected.</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
