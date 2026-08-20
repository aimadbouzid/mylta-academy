const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const prisma = require('./prisma')

let io

// Map of userId to Set of socketIds for logged-in accounts
const userSockets = new Map()
// Set of socketIds for unauthenticated guest visitors
const guestSockets = new Set()

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
      let token = socket.handshake.auth?.token || socket.handshake.query?.token

      if (!token && socket.handshake.headers?.cookie) {
        const cookieStr = socket.handshake.headers.cookie
        const match = cookieStr.match(/(?:^|;\s*)token=([^;]*)/)
        if (match) token = decodeURIComponent(match[1])
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true, sessionVersion: true }
          })
          
          // Même exigence que le middleware HTTP : sans sessionVersion valide,
          // un jeton révoqué pourrait encore ouvrir un socket authentifié.
          if (user && user.sessionVersion === decoded.sessionVersion) {
            socket.user = {
              userId: user.id,
              name: user.name,
              email: user.email,
              isGuest: false
            }
            return next()
          }
        } catch (e) {
          // Token invalid, treat as guest
        }
      }
      
      // Guest visitor (unauthenticated)
      socket.user = { isGuest: true, guestId: socket.id }
      next()
    } catch (error) {
      socket.user = { isGuest: true, guestId: socket.id }
      next()
    }
  })

  io.on('connection', (socket) => {
    const isGuest = socket.user?.isGuest
    const userId = socket.user?.userId

    if (isGuest) {
      guestSockets.add(socket.id)
      console.log(`👁️ Guest connected (Socket: ${socket.id}) | Total guests: ${guestSockets.size}`)
    } else if (userId) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set())
      }
      userSockets.get(userId).add(socket.id)
      socket.join(`user_${userId}`)
      console.log(`🔌 User connected: ${socket.user.name || socket.user.email} (#${userId}) (Socket: ${socket.id})`)

      // ── Anti-Sharing / IP Limiting Logic ──
      setTimeout(async () => {
        try {
          const sockets = await io.in(`user_${userId}`).fetchSockets()
          // Map to track first connection time for each IP to drop the oldest
          const ipMap = new Map() // ip -> { connectedAt: Date, socketIds: [] }
          
          sockets.forEach(s => {
            const sip = s.handshake.address || s.request.connection.remoteAddress || '127.0.0.1'
            if (!ipMap.has(sip)) {
              ipMap.set(sip, { connectedAt: s.handshake.issued || Date.now(), socketIds: [] })
            }
            ipMap.get(sip).socketIds.push(s.id)
          })

          if (ipMap.size > 2) {
            console.log(`⚠️ Anti-Sharing Triggered for User #${userId} : ${ipMap.size} IPs connected.`)
            // Sort by connection time (oldest first)
            const sortedIps = Array.from(ipMap.entries()).sort((a, b) => a[1].connectedAt - b[1].connectedAt)
            // IPs to kick (all except the 2 newest)
            const ipsToKick = sortedIps.slice(0, sortedIps.length - 2)

            for (const [kickedIp, data] of ipsToKick) {
              console.log(`👢 Kicking IP: ${kickedIp} for User #${userId}`)
              data.socketIds.forEach(sid => {
                const s = io.sockets.sockets.get(sid)
                if (s) {
                  s.emit('force_logout', { message: 'Vous avez été déconnecté car votre compte est utilisé sur trop d\'appareils simultanément.' })
                  s.disconnect(true)
                }
              })
            }
          }
        } catch (err) {
          console.error("Erreur Anti-Sharing:", err)
        }
      }, 1000)
    }

    // Live click tracking handler
    socket.on('track_click', async (data) => {
      try {
        const { pageUrl, elementText, elementTag, elementId } = data || {}
        if (!pageUrl) return

        const ip = socket.handshake.address || socket.request.connection.remoteAddress || '127.0.0.1'

        const clickData = {
          userId: isGuest ? null : userId,
          userName: isGuest ? 'Visiteur Anonyme' : (socket.user.name || 'Utilisateur'),
          userEmail: isGuest ? null : socket.user.email,
          isGuest: !!isGuest,
          pageUrl: String(pageUrl).slice(0, 250),
          elementText: elementText ? String(elementText).trim().slice(0, 200) : null,
          elementTag: elementTag ? String(elementTag).toUpperCase().slice(0, 50) : null,
          elementId: elementId ? String(elementId).slice(0, 100) : null,
          ip: String(ip).slice(0, 45)
        }

        await prisma.clickLog.create({ data: clickData })

        // Broadcast new click event to admin dashboard subscribers
        io.to('admin_analytics').emit('new_click_event', clickData)
      } catch (err) {
        console.error('Erreur lors du suivi du clic:', err.message)
      }
    })

    // Join admin analytics room if client is admin
    socket.on('join_admin_analytics', async () => {
      if (!socket.user?.isGuest && userId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
          })
          if (user && user.role === 'ADMIN') {
            socket.join('admin_analytics')
          } else {
            console.warn(`🚨 Unauthorized attempt to join admin analytics by User #${userId}`)
          }
        } catch (error) {
          console.error('Error checking admin role for analytics:', error)
        }
      }
    })

    socket.on('disconnect', () => {
      if (isGuest) {
        guestSockets.delete(socket.id)
        console.log(`👁️ Guest disconnected (Socket: ${socket.id}) | Total guests: ${guestSockets.size}`)
      } else if (userId) {
        const sockets = userSockets.get(userId)
        if (sockets) {
          sockets.delete(socket.id)
          if (sockets.size === 0) {
            userSockets.delete(userId)
          }
        }
        console.log(`🔌 User disconnected: #${userId} (Socket: ${socket.id})`)
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
  userSockets,
  guestSockets
}

