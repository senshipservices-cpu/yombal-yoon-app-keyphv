
import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkConnection();

    const interval = setInterval(() => {
      checkConnection();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(networkState.isConnected ?? true);
      console.log('Network status:', networkState.isConnected ? 'Connected' : 'Disconnected');
    } catch (error) {
      console.error('Error checking network status:', error);
      setIsConnected(true);
    } finally {
      setIsChecking(false);
    }
  };

  const retry = async () => {
    setIsChecking(true);
    await checkConnection();
  };

  return { isConnected, isChecking, retry };
}
