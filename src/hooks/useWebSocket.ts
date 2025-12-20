/**
 * useWebSocket Hook for Admin Dashboard
 * 
 * Manages WebSocket connection lifecycle and data subscriptions
 * Falls back to HTTP polling if WebSocket unavailable
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';

// Lazy-load socket.io-client to support optional dependency
let io: any = null;
let Socket: any = null;

try {
  const socketIoClient = require('socket.io-client');
  io = socketIoClient.io;
  Socket = socketIoClient.Socket;
} catch (e) {
  // socket.io-client not installed yet
  console.warn('[WS] socket.io-client not installed. WebSocket disabled until npm install completes.');
}

interface WebSocketData {
  type: 'activities' | 'stats' | 'quotes' | 'users' | 'newsletter' | 'forms';
  data: any;
  timestamp: string;
}

interface ActivityEvent {
  type: 'quote_created' | 'user_registered' | 'form_submitted' | 'newsletter_signup';
  data: any;
  timestamp: string;
}

interface WebSocketNotification {
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
}

interface UseWebSocketOptions {
  enabled?: boolean;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  debugLog?: boolean;
}

const DEFAULT_OPTIONS: UseWebSocketOptions = {
  enabled: true,
  autoReconnect: true,
  reconnectDelay: 3000,
  debugLog: false,
};

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { data: session } = useSession();
  const socketRef = useRef<any | null>(null);
  const reconnectAttempts = useRef(0);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [connectedAdmins, setConnectedAdmins] = useState(0);

  const log = useCallback(
    (message: string, data?: any) => {
      if (mergedOptions.debugLog) {
        console.log(`[WS] ${message}`, data || '');
      }
    },
    [mergedOptions.debugLog]
  );

  /**
   * Initialize WebSocket connection
   */
  const connect = useCallback(() => {
    if (!io) {
      log('socket.io-client not available, falling back to HTTP polling');
      return;
    }

    if (!mergedOptions.enabled || !session?.user) {
      log('WebSocket disabled or no session');
      return;
    }

    if (socketRef.current?.connected) {
      log('Already connected');
      return;
    }

    setIsConnecting(true);

    try {
      const socket = io(process.env.NEXT_PUBLIC_APP_URL || window.location.origin, {
        auth: {
          token: session.user.id, // In production, use JWT token
          userId: session.user.id,
          email: session.user.email,
          role: (session.user as any).role || 'customer',
        },
        transports: ['websocket', 'polling'],
        reconnection: mergedOptions.autoReconnect,
        reconnectionDelay: mergedOptions.reconnectDelay,
      });

      // Connection established
      socket.on('connect', () => {
        log('Connected to WebSocket server');
        socketRef.current = socket;
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttempts.current = 0;

        // Subscribe to dashboard updates
        socket.emit('subscribe:dashboard');
      });

      // Data updates
      socket.on('data:activities:update', (update: WebSocketData) => {
        log('Received activities update');
        setLastUpdate(update.timestamp);
        // Dispatch event for component to handle
        window.dispatchEvent(
          new CustomEvent('ws:activities:update', { detail: update.data })
        );
      });

      socket.on('data:stats:update', (update: WebSocketData) => {
        log('Received stats update');
        setLastUpdate(update.timestamp);
        window.dispatchEvent(
          new CustomEvent('ws:stats:update', { detail: update.data })
        );
      });

      socket.on('data:quotes:update', (update: WebSocketData) => {
        log('Received quotes update');
        window.dispatchEvent(
          new CustomEvent('ws:quotes:update', { detail: update.data })
        );
      });

      socket.on('data:users:update', (update: WebSocketData) => {
        log('Received users update');
        window.dispatchEvent(
          new CustomEvent('ws:users:update', { detail: update.data })
        );
      });

      socket.on('data:newsletter:update', (update: WebSocketData) => {
        log('Received newsletter update');
        window.dispatchEvent(
          new CustomEvent('ws:newsletter:update', { detail: update.data })
        );
      });

      socket.on('data:forms:update', (update: WebSocketData) => {
        log('Received forms update');
        window.dispatchEvent(
          new CustomEvent('ws:forms:update', { detail: update.data })
        );
      });

      // Activity events (real-time activity feed)
      socket.on('activity:event', (event: ActivityEvent) => {
        log('Received activity event:', event.type);
        window.dispatchEvent(
          new CustomEvent('ws:activity:event', { detail: event })
        );
      });

      // Notifications
      socket.on('notification', (notification: WebSocketNotification) => {
        log('Received notification:', notification.message);
        window.dispatchEvent(
          new CustomEvent('ws:notification', { detail: notification })
        );
      });

      // Admin presence
      socket.on('admin:presence', (presence: { connectedAdmins: number; timestamp: string }) => {
        log(`Connected admins: ${presence.connectedAdmins}`);
        setConnectedAdmins(presence.connectedAdmins);
      });

      // Connection errors
      socket.on('error', (error) => {
        console.error('[WS_ERROR]', error);
      });

      // Disconnection
      socket.on('disconnect', () => {
        log('Disconnected from WebSocket server');
        setIsConnected(false);
        if (!mergedOptions.autoReconnect) {
          socketRef.current = null;
        }
      });

      // Reconnection attempts
      socket.on('reconnect_attempt', () => {
        reconnectAttempts.current++;
        log(`Reconnect attempt ${reconnectAttempts.current}`);
        setIsConnecting(true);
      });
    } catch (error) {
      console.error('[WS_ERROR] Failed to connect:', error);
      setIsConnecting(false);
    }
  }, [session, mergedOptions, log]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      log('Disconnected');
    }
  }, [log]);

  /**
   * Subscribe to specific data type updates
   */
  const subscribe = useCallback(
    (dataType: 'activities' | 'stats' | 'quotes' | 'users' | 'newsletter' | 'forms') => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('subscribe:data', dataType);
        log(`Subscribed to ${dataType}`);
      }
    },
    [log]
  );

  /**
   * Reconnect to WebSocket
   */
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 500);
  }, [connect, disconnect]);

  // Initialize connection on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Expose socket for advanced usage
  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    lastUpdate,
    connectedAdmins,
    subscribe,
    reconnect,
    connect,
    disconnect,
  };
}

/**
 * Hook to listen for WebSocket events
 */
export function useWebSocketEvent(
  eventType:
    | 'ws:activities:update'
    | 'ws:stats:update'
    | 'ws:quotes:update'
    | 'ws:users:update'
    | 'ws:newsletter:update'
    | 'ws:forms:update'
    | 'ws:activity:event'
    | 'ws:notification',
  callback: (data: any) => void
) {
  useEffect(() => {
    const handleEvent = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener(eventType, handleEvent as EventListener);
    return () => {
      window.removeEventListener(eventType, handleEvent as EventListener);
    };
  }, [eventType, callback]);
}
