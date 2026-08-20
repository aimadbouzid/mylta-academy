import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

// Dérive l'origine du socket depuis VITE_API_URL (comme axios.js) au lieu de
// toujours utiliser window.location.origin — sinon le socket se connecte à
// la mauvaise origine dès que le frontend est déployé séparément de l'API.
function getSocketOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) return window.location.origin
  try {
    return new URL(apiUrl, window.location.origin).origin
  } catch {
    return window.location.origin
  }
}

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    let newSocket = null

    newSocket = io(getSocketOrigin(), {
      path: '/socket.io',
      withCredentials: true, // Send httpOnly cookies for auth
    })

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected (Real-time Sync & Visitor Tracking Active)')
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
    })
    
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })

    setSocket(newSocket)

    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [isAuthenticated])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
