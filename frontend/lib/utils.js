'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(WS_URL, { transports: ['websocket', 'polling'], reconnection: true });
    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const joinEntity = (type, id) => socketRef.current?.emit('join:entity', { type, id });
  const leaveEntity = (type, id) => socketRef.current?.emit('leave:entity', { type, id });
  const on = (event, cb) => socketRef.current?.on(event, cb);
  const off = (event, cb) => socketRef.current?.off(event, cb);

  return { socket: socketRef.current, connected, joinEntity, leaveEntity, on, off };
}

export function formatPrice(amount, currency = 'INR') {
  if (currency === 'INR') return `₹${Number(amount).toLocaleString('en-IN')}`;
  if (currency === 'USD') return `$${Number(amount).toLocaleString('en-US')}`;
  return `€${Number(amount).toLocaleString('en-DE')}`;
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
