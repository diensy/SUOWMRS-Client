import { useEffect, useState, useRef, useCallback } from 'react';
import { io as socketIO } from 'socket.io-client';

let socketInstance = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [waterLevel, setWaterLevel] = useState(null);
  const [storageData, setStorageData] = useState(null);
  const [latestAlert, setLatestAlert] = useState(null);
  const onAlertRef = useRef(null);

  // Allow components to register an alert callback
  const setAlertCallback = useCallback((fn) => {
    onAlertRef.current = fn;
  }, []);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = socketIO(window.location.origin, {
        path: '/socket.io',
        transports: ['websocket'],
      });
    }

    const socket = socketInstance;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onWaterLevel = (data) => {
      setWaterLevel(data);
    };

    const onStorageUpdate = (data) => {
      setStorageData(data);
    };

    const onWaterAlert = (data) => {
      setLatestAlert(data);
      if (onAlertRef.current) {
        onAlertRef.current(data);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('water:level', onWaterLevel);
    socket.on('storage:update', onStorageUpdate);
    socket.on('water:alert', onWaterAlert);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('water:level', onWaterLevel);
      socket.off('storage:update', onStorageUpdate);
      socket.off('water:alert', onWaterAlert);
    };
  }, []);

  return { isConnected, waterLevel, storageData, latestAlert, setAlertCallback };
}
