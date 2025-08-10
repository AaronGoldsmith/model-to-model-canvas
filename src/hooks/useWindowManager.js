import { useState, useCallback, useRef } from 'react';

export const useWindowManager = () => {
  const [windows, setWindows] = useState([
    {
      id: 'initial-window',
      title: 'Main Window',
      content: '', // Content will be managed in App.jsx
      position: { x: 50, y: 50 },
      size: { width: 400, height: 300 },
      model: 'llama3.2',
      isFocused: true
    }
  ]);

  // Cascade offset for spawning new windows to avoid overlap
  const cascadeRef = useRef({ x: 30, y: 30, step: 30 });

  const addWindow = useCallback((windowData) => {
    const defaultSize = { width: 400, height: 300 };
    // Compute spawn within viewport, then apply cascade offset from the last window
    const baseX = Math.max(0, Math.min(window.innerWidth - defaultSize.width, 60));
    const baseY = Math.max(0, Math.min(window.innerHeight - defaultSize.height, 60));

    // Get current cascade values then advance for next time
    const { x: cx, y: cy, step } = cascadeRef.current;
    const nextCascade = {
      x: (cx + step) % Math.max(step * 10, window.innerWidth - defaultSize.width - 20),
      y: (cy + step) % Math.max(step * 10, window.innerHeight - defaultSize.height - 20),
      step,
    };
    cascadeRef.current = nextCascade;

    const spawnX = Math.min(window.innerWidth - defaultSize.width, baseX + cx);
    const spawnY = Math.min(window.innerHeight - defaultSize.height, baseY + cy);

    const newWindow = {
      id: windowData.id,
      title: windowData.title || 'New Window',
      content: windowData.content || '',
      position: { x: Math.max(0, spawnX), y: Math.max(0, spawnY) },
      size: defaultSize,
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
