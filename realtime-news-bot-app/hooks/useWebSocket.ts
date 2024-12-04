import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocketIO = (
    url: string,
    onMessage: (data: any) => void,
    onError: (error: any) => void,
    onDisconnect: (reason: string) => void
) => {
  const [isSocketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = () => {
    try {
      // Crear una conexión a Socket.IO
      const socket = io(url, {
        reconnection: true,
        reconnectionAttempts: 5, // Número máximo de intentos de reconexión
        reconnectionDelay: 1000, // Tiempo inicial entre intentos de reconexión
        reconnectionDelayMax: 30000, // Tiempo máximo entre intentos de reconexión
        transports: ['websocket'], // Forzar el uso de WebSocket
      });

      socket.on('connect', () => {
        console.log('Socket.IO connected');
        setSocketConnected(true);
      });

      socket.on('disconnect', (reason: string) => {
        console.log('Socket.IO disconnected:', reason);
        setSocketConnected(false);
        onDisconnect(reason);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        onError(error);
      });

      socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
        onError(error);
      });

      socket.on('incomingResponse', (message) => {
        console.log('Socket.IO message received:', message);
        onMessage(message);
      });

      // Guardar el socket en la referencia
      socketRef.current = socket;
    } catch (error) {
      console.error('Socket.IO connection failed:', error);
      onError(error);
    }
  };

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && isSocketConnected) {
      console.log(`Sending message on event "${event}":`, data);
      socketRef.current.emit('handleIncomingMessage', data);
    } else {
      console.error('Socket.IO is not connected. Cannot send message.');
    }
  };

  useEffect(() => {
    connectSocket();

    // Cleanup: Desconectar el socket al desmontar el componente
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  return { isSocketConnected, sendMessage };
};

export default useSocketIO;
