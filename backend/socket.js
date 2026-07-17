const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const prisma = require('./prisma')

let io

// Map of userId to array of socketIds to allow multiple device logins
const userSockets = new Map()

const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token
      if (!token) {
        return next(new Error('Authentication error: Token missing'))
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true }
      })
      
      if (!user) {
        return next(new Error('Authentication error: User not found'))
      }
      
      socket.user = decoded
      next()
    } catch (error) {
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user.userId
    
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set())
    }
    userSockets.get(userId).add(socket.id)
    
    // Join a room specific to this user, making it easy to emit to all devices of this user
    socket.join(`user_${userId}`)

    console.log(`🔌 Socket connected: User ${userId} (Socket: ${socket.id})`)

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: User ${userId} (Socket: ${socket.id})`)
      
      const sockets = userSockets.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          userSockets.delete(userId)
        }
      }
    })
  })

  return io
}

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!')
  }
  return io
}

module.exports = {
  initSocket,
  getIO,
  userSockets
}
