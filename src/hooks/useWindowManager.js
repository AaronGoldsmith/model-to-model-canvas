import { useState, useCallback } from 'react';

export const useWindowManager = () => {
  const [windows, setWindows] = useState([
    {
      id: 'initial-window',
      title: 'Main Window',
      content: '', // Content will be managed in App.jsx
      position: { x: 50, y: 50 },
      size: { width: 400, height: 300 },
      model: 'llama3.1',
      isFocused: true
    }
  ]);

  const addWindow = useCallback((windowData) => {
    const newWindow = {
      id: windowData.id,
      title: windowData.title || 'New Window',
      content: windowData.content || '',
      position: { 
        x: Math.max(40, Math.random() * (window.innerWidth - 400)), 
        y: Math.max(40, Math.random() * (window.innerHeight - 300)) 
      },
      size: { width: 400, height: 300 },
      model: windowData.model || 'llama3.1',
      isFocused: true
    };

    setWindows(prevWindows => {
      const updatedWindows = prevWindows.map(w => ({ ...w, isFocused: false }));
      return [...updatedWindows, newWindow];
    });
  }, []);

  const removeWindow = useCallback((windowId) => {
    setWindows(prevWindows => prevWindows.filter(w => w.id !== windowId));
  }, []);

  const moveWindow = useCallback((windowId, newPosition) => {
    setWindows(prevWindows => 
      prevWindows.map(w => 
        w.id === windowId 
          ? { ...w, position: newPosition } 
          : w
      )
    );
  }, []);

  const resizeWindow = useCallback((windowId, newSize) => {
    setWindows(prevWindows => 
      prevWindows.map(w => 
        w.id === windowId 
          ? { ...w, size: newSize } 
          : w
      )
    );
  }, []);

  const focusWindow = useCallback((windowId) => {
    setWindows(prevWindows => 
      prevWindows.map(w => 
        w.id === windowId 
          ? { ...w, isFocused: true } 
          : { ...w, isFocused: false }
      )
    );
  }, []);

  const clearWindowContext = useCallback((windowId) => {
    // This will be handled by App.jsx
  }, []);

  const updateWindowContent = useCallback((windowId, content) => {
    setWindows(prevWindows => 
      prevWindows.map(w => 
        w.id === windowId 
          ? { ...w, content } 
          : w
      )
    );
  }, []);

  const updateWindowModel = useCallback((windowId, model) => {
    setWindows(prevWindows => 
      prevWindows.map(w => 
        w.id === windowId 
          ? { ...w, model } 
          : w
      )
    );
  }, []);

  return {
    windows,
    addWindow,
    removeWindow,
    moveWindow,
    resizeWindow,
    focusWindow,
    clearWindowContext,
    updateWindowContent,
    updateWindowModel
  };
};
