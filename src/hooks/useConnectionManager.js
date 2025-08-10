import { useState, useCallback } from 'react';

export const useConnectionManager = () => {
  const [connections, setConnections] = useState([]);

  const addConnection = useCallback((fromWindowId, toWindowId) => {
    const newConnection = {
      id: `${fromWindowId}-${toWindowId}`,
      from: fromWindowId,
      to: toWindowId,
      status: 'pending'
    };

    setConnections(prevConnections => [...prevConnections, newConnection]);
  }, []);

  const removeConnection = useCallback((connectionId) => {
    setConnections(prevConnections => 
      prevConnections.filter(c => c.id !== connectionId)
    );
  }, []);

  const clearConnections = useCallback(() => {
    setConnections([]);
  }, []);

  const updateConnectionStatus = useCallback((connectionId, status) => {
    setConnections(prevConnections => 
      prevConnections.map(c => 
        c.id === connectionId 
          ? { ...c, status } 
          : c
      )
    );
  }, []);

  return {
    connections,
    addConnection,
    removeConnection,
    clearConnections,
    updateConnectionStatus
  };
};
