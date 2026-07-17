import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    let newSocket = null

    if (isAuthenticated && token) {
      newSocket = io(window.location.origin, {
        path: '/socket.io',
        auth: { token }
      })

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected (Real-time Sync Active)')
      })

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected')
      })
      
      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message)
      })

      setSocket(newSocket)
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [isAuthenticated, token])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
