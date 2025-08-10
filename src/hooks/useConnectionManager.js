import { useState, useCallback } from 'react';

export const useConnectionManager = () => {
  const [connections, setConnections] = useState([]);

  const addConnection = useCallback((fromWindowId, toWindowId) => {
    if (fromWindowId === toWindowId) return; // prevent self-connection
    setConnections(prev => {
      // prevent duplicates
      if (prev.some(c => c.from === fromWindowId && c.to === toWindowId)) return prev;
      const newConnection = {
        id: `${fromWindowId}-${toWindowId}`,
        from: fromWindowId,
        to: toWindowId,
        status: 'idle'
      };
      return [...prev, newConnection];
    });
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
