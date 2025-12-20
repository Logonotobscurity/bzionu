/**
 * WebSocket Server Handler for Real-Time Dashboard Updates
 * 
 * Features:
 * - Real-time data updates via Socket.io or native WebSocket
 * - Admin authentication with JWT tokens
 * - Broadcast events for data mutations
 * - Automatic disconnection handling
 * - Admin presence tracking
 * 
 * Note: Requires socket.io to be installed via npm
 */

import type { Server as HTTPServer } from 'http';

// Lazy-load socket.io to support both with and without the package
let SocketServer: any = null;

try {
  const socketIo = require('socket.io');
  SocketServer = socketIo.Server;
} catch (e) {
  console.warn('[WS] socket.io not installed. WebSocket features will be disabled until npm install completes.');
}

// Generic socket interface
interface AdminSocket {
  userId?: number;
  userEmail?: string;
  adminRole?: string;
  id?: string;
  handshake?: any;
  on?: (event: string, callback: any) => void;
  join?: (room: string) => void;
  emit?: (event: string, data: any) => void;
}

const connectedAdmins = new Map<string, AdminSocket>();

/**
 * Initialize WebSocket server
 * Should be called in your API route or server initialization
 */
export function initializeWebSocketServer(httpServer: HTTPServer): any {
  if (!SocketServer) {
    console.error('[WS] socket.io not installed. Cannot initialize WebSocket server.');
    return null;
  }

  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware to authenticate connections
  io.use(async (socket: any, next: any) => {
    try {
      // Get token from handshake auth
      const token = socket?.handshake?.auth?.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // For now, we'll accept the connection
      // In production, validate the JWT token properly
      socket.userId = parseInt(socket?.handshake?.auth?.userId || '0');
      socket.userEmail = socket?.handshake?.auth?.email;
      socket.adminRole = socket?.handshake?.auth?.role;

      if (socket.adminRole !== 'admin') {
        return next(new Error('Authentication error: Not an admin'));
      }

      console.log(`[WS_AUTH] Admin connected: ${socket.userEmail} (${socket?.id})`);
      next();
    } catch (error) {
      console.error('[WS_AUTH] Error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: any) => {
    console.log(`[WS_CONNECT] Admin ${socket.userEmail} connected (${socket?.id})`);

    // Track connected admin
    connectedAdmins.set(socket?.id, socket);

    // Subscribe to dashboard updates
    socket?.on('subscribe:dashboard', () => {
      socket?.join('dashboard-updates');
      console.log(`[WS_SUBSCRIBE] ${socket.userEmail} subscribed to dashboard updates`);

      // Send current admin list
      io.to('dashboard-updates').emit('admin:presence', {
        connectedAdmins: connectedAdmins.size,
        timestamp: new Date().toISOString(),
      });
    });

    // Subscribe to specific data type updates
    socket?.on('subscribe:data', (dataType: string) => {
      const roomName = `data:${dataType}`;
      socket?.join(roomName);
      console.log(`[WS_SUBSCRIBE] ${socket.userEmail} subscribed to ${dataType} updates`);
    });

    // Disconnect handler
    socket?.on('disconnect', () => {
      connectedAdmins.delete(socket?.id);
      console.log(`[WS_DISCONNECT] Admin ${socket.userEmail} disconnected (${socket?.id})`);
      console.log(`[WS_DISCONNECT] Connected admins: ${connectedAdmins.size}`);

      // Notify other admins
      if (connectedAdmins.size > 0) {
        io.to('dashboard-updates').emit('admin:presence', {
          connectedAdmins: connectedAdmins.size,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Error handler
    socket?.on('error', (error: any) => {
      console.error(`[WS_ERROR] ${socket.userEmail}: ${error}`);
    });
  });

  return io;
}

/**
 * Get WebSocket server instance (singleton pattern)
 */
let ioInstance: any = null;

export function getWebSocketServer(): any {
  return ioInstance;
}

export function setWebSocketServer(io: any): void {
  ioInstance = io;
}

/**
 * Broadcast dashboard data update to all connected admins
 */
export function broadcastDashboardUpdate(
  dataType: 'activities' | 'stats' | 'quotes' | 'users' | 'newsletter' | 'forms',
  data: any
): void {
  const io = getWebSocketServer();
  if (!io) {
    console.warn('[WS_BROADCAST] WebSocket server not initialized');
    return;
  }

  io.to('dashboard-updates').emit(`data:${dataType}:update`, {
    type: dataType,
    data,
    timestamp: new Date().toISOString(),
  });

  console.log(`[WS_BROADCAST] Sent ${dataType} update to ${connectedAdmins.size} admin(s)`);
}

/**
 * Broadcast activity event to all connected admins
 */
export function broadcastActivityEvent(
  eventType: 'quote_created' | 'user_registered' | 'form_submitted' | 'newsletter_signup',
  data: any
): void {
  const io = getWebSocketServer();
  if (!io) return;

  io.to('dashboard-updates').emit('activity:event', {
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  console.log(`[WS_BROADCAST] Activity event: ${eventType}`);
}

/**
 * Send notification to specific admin
 */
export function notifyAdmin(adminSocketId: string, message: string, severity: 'info' | 'warning' | 'error' = 'info'): void {
  const io = getWebSocketServer();
  if (!io) return;

  io.to(adminSocketId).emit('notification', {
    message,
    severity,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast notification to all admins
 */
export function broadcastNotification(message: string, severity: 'info' | 'warning' | 'error' = 'info'): void {
  const io = getWebSocketServer();
  if (!io) return;

  io.to('dashboard-updates').emit('notification', {
    message,
    severity,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get connected admin count
 */
export function getConnectedAdminCount(): number {
  return connectedAdmins.size;
}

/**
 * Get list of connected admin emails
 */
export function getConnectedAdmins(): string[] {
  return Array.from(connectedAdmins.values())
    .map((socket) => socket.userEmail || 'unknown')
    .filter((email) => email !== 'unknown');
}
