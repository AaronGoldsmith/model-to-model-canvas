import React, { useState, useEffect, useRef } from 'react';
import Window from './components/Window/Window.jsx';
import ConnectorCanvas from './components/ConnectorCanvas/ConnectorCanvas';
import ControlPanel from './components/Controls/ControlPanel.jsx';
import StatusBar from './components/Controls/StatusBar.jsx';
import { useWindowManager } from './hooks/useWindowManager';
import { useConnectionManager } from './hooks/useConnectionManager';
import { useOllamaAPI } from './hooks/useOllamaAPI';
import { fetchOllamaModels } from './services/ollamaService';
import './App.css';

function App() {
  const {
    windows,
    addWindow,
    removeWindow,
    moveWindow,
    resizeWindow,
    focusWindow,
    updateWindowModel
  } = useWindowManager();

  const {
    connections,
    addConnection,
    removeConnection,
    clearConnections,
  } = useConnectionManager();

  const {
    sendMessage,
    processPipedMessage,
    isProcessingFor,
  } = useOllamaAPI();

  const [isAutoRunEnabled, setIsAutoRunEnabled] = useState(true);
  const [status, setStatus] = useState('Ready');
  const [availableModels, setAvailableModels] = useState(['llama3.1']);
  const [selectedModel, setSelectedModel] = useState('llama3.1');
  const [conversations, setConversations] = useState([]);
  const nextWindowId = useRef(1);

  const [windowContents, setWindowContents] = useState({
    'initial-window': `Welcome to Cybernetic Canvas!\n\nThis is a multi-window conversational AI interface.\n\nFeatures:\n- Create multiple windows\n- Connect windows to pass messages\n- Run conversations automatically or manually\n- Export conversations\n\nClick "New Window" to create more windows.`
  });
  const [windowHistories, setWindowHistories] = useState({
    'initial-window': []
  });

  // Refs to avoid stale-closure issues after async operations
  const connectionsRef = useRef(connections);
  const windowsRef = useRef(windows);
  const isAutoRunEnabledRef = useRef(isAutoRunEnabled);
  useEffect(() => { connectionsRef.current = connections; }, [connections]);
  useEffect(() => { windowsRef.current = windows; }, [windows]);
  useEffect(() => { isAutoRunEnabledRef.current = isAutoRunEnabled; }, [isAutoRunEnabled]);

  // drag-to-connect state
  const [connectionDrag, setConnectionDrag] = useState({ active: false, fromId: null, x: 0, y: 0 });
  const [hoveredTargetId, setHoveredTargetId] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('Fetching Ollama models...');
        const models = await fetchOllamaModels();
        if (models && models.length > 0) {
          setAvailableModels(models);
          setSelectedModel(models[0]);
          setStatus(`Loaded ${models.length} models`);
        } else {
          setStatus('No models found');
        }
      } catch (err) {
        setStatus('Ollama connection failed: ' + err.message);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    // Mouse move/up for connection dragging across the app
    const handleMove = (e) => {
      if (!connectionDrag.active) return;
      setConnectionDrag(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const winEl = target?.closest?.('[data-window-id]');
      if (winEl) {
        const wId = winEl.getAttribute('data-window-id');
        setHoveredTargetId(wId && wId !== connectionDrag.fromId ? wId : null);
      } else {
        setHoveredTargetId(null);
      }
    };
    const handleUp = (e) => {
      if (!connectionDrag.active) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const winEl = target?.closest?.('[data-window-id]');
      if (winEl) {
        const toId = winEl.getAttribute('data-window-id');
        if (toId && toId !== connectionDrag.fromId) {
          // prevent duplicates
          const dup = connectionsRef.current.some(c => c.from === connectionDrag.fromId && c.to === toId);
          if (!dup) addConnection(connectionDrag.fromId, toId);
        }
      }
      setConnectionDrag({ active: false, fromId: null, x: 0, y: 0 });
      setHoveredTargetId(null);
    };
    if (connectionDrag.active) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [connectionDrag.active, connectionDrag.fromId, addConnection]);

  const handleNewWindow = () => {
    const newWindowId = (Date.now() + nextWindowId.current).toString();
    addWindow({
      id: newWindowId,
      title: `Window ${nextWindowId.current}`,
      content: `New window created at ${new Date().toLocaleTimeString()}`,
      model: selectedModel
    });
    
    setWindowContents(prev => ({
      ...prev,
      [newWindowId]: `New window created at ${new Date().toLocaleTimeString()}`
    }));
    setWindowHistories(prev => ({
      ...prev,
      [newWindowId]: []
    }));
    
    nextWindowId.current += 1;
  };

  const handleCloseWindow = (windowId) => {
    removeWindow(windowId);
    setWindowContents(prev => {
      const newContents = { ...prev };
      delete newContents[windowId];
      return newContents;
    });
    setWindowHistories(prev => {
      const newHistories = { ...prev };
      delete newHistories[windowId];
      return newHistories;
    });
  };

  const handleClearContext = (windowId) => {
    setWindowContents(prev => ({ ...prev, [windowId]: '' }));
    setWindowHistories(prev => ({ ...prev, [windowId]: [] }));
  };

  const handleSendMessage = async (windowId, message) => {
    const win = windowsRef.current.find(w => w.id === windowId);
    if (!win) return;

    // Append the user's message to the UI immediately
    const userMessage = `\n[user]: ${message}`;
    const newContent = (windowContents[windowId] || '') + userMessage;
    setWindowContents(prev => ({ ...prev, [windowId]: newContent }));

    const currentHistory = windowHistories[windowId] || [];
    const newHistory = [...currentHistory, { role: 'user', content: message }];
    setWindowHistories(prev => ({ ...prev, [windowId]: newHistory }));

    try {
      // Important: pass the history BEFORE adding the new user message to avoid duplication inside sendMessage
      const response = await sendMessage(windowId, win.model, currentHistory, message);
      
      if (response.success) {
        const aiMessage = `\n[assistant]: ${response.finalOutput}`;
        const updatedContent = newContent + aiMessage;
        setWindowContents(prev => ({ ...prev, [windowId]: updatedContent }));

        const finalHistory = [...newHistory, { role: 'assistant', content: response.finalOutput }];
        setWindowHistories(prev => ({ ...prev, [windowId]: finalHistory }));

        if (isAutoRunEnabledRef.current) {
          propagateData(windowId, response.finalOutput);
        }
      } else {
        const errorMessage = `\n[error]: ${response.error}`;
        setWindowContents(prev => ({ ...prev, [windowId]: prev[windowId] + errorMessage }));
      }
    } catch (err) {
      const errorMessage = `\n[error]: Failed to get response from model`;
      setWindowContents(prev => ({ ...prev, [windowId]: prev[windowId] + errorMessage }));
    }
  };
  
  const propagateData = async (fromWindowId, data) => {
    const conns = connectionsRef.current;
    const wins = windowsRef.current;
    conns.forEach(conn => {
      if (conn.from === fromWindowId) {
        const targetWindow = wins.find(w => w.id === conn.to);
        if (targetWindow) {
          processPipedMessageToWindow(conn.to, data, targetWindow.model);
        }
      }
    });
  };
  
  const processPipedMessageToWindow = async (windowId, message, model) => {
    const targetWindow = windowsRef.current.find(w => w.id === windowId);
    if (!targetWindow) return;

    const currentHistory = windowHistories[windowId] || [];
    const isDup = currentHistory.some(entry => entry.role === 'user' && entry.content === message);
    if (isDup) return; // avoid duplicating the same piped input

    // Append the piped message to the UI immediately
    const pipedUserLine = `\n[user]: ${message}`;
    const currentContent = windowContents[windowId] || '';
    const updatedContent = currentContent + pipedUserLine;
    setWindowContents(prev => ({ ...prev, [windowId]: updatedContent }));

    const newHistory = [...currentHistory, { role: 'user', content: message }];
    setWindowHistories(prev => ({ ...prev, [windowId]: newHistory }));

    // Use the dedicated piped-message path to avoid duplication and keep per-window processing state
    const response = await processPipedMessage(windowId, targetWindow.model, currentHistory, message);
    if (response && response.success) {
      const aiMessage = `\n[assistant]: ${response.finalOutput}`;
      setWindowContents(prev => ({ ...prev, [windowId]: (prev[windowId] || '') + aiMessage }));
      setWindowHistories(prev => ({
        ...prev,
        [windowId]: [...newHistory, { role: 'assistant', content: response.finalOutput }]
      }));

      // Propagate further if Auto-Run is enabled (enables chained piping A -> B -> C)
      if (isAutoRunEnabledRef.current) {
        propagateData(windowId, response.finalOutput);
      }
    } else if (response && response.error) {
      const errorMessage = `\n[error]: ${response.error}`;
      setWindowContents(prev => ({ ...prev, [windowId]: (prev[windowId] || '') + errorMessage }));
    }
  };

  const onConnectStart = (fromId, startX, startY) => {
    setConnectionDrag({ active: true, fromId, x: startX, y: startY });
  };

  // Compute temp connection for canvas
  const tempConnection = connectionDrag.active ? { from: connectionDrag.fromId, x: connectionDrag.x, y: connectionDrag.y } : null;

  return (
    <div className="app">
      <ControlPanel 
        isAutoRunEnabled={isAutoRunEnabled}
        onToggleAutoRun={() => setIsAutoRunEnabled(!isAutoRunEnabled)}
        onRunNext={() => {}}
        onNewWindow={handleNewWindow}
        onClearWindows={() => windows.forEach(w => handleCloseWindow(w.id))}
        onClearConnections={clearConnections}
        onExportConversations={() => {}}
        onModelSelect={setSelectedModel}
        selectedModel={selectedModel}
        availableModels={availableModels}
      />
      
      <ConnectorCanvas 
        connections={connections}
        windows={windows}
        tempConnection={tempConnection}
      />
      
      {windows.map(window => (
        <Window
          key={window.id}
          id={window.id}
          title={window.title}
          content={windowContents[window.id]}
          position={window.position}
          size={window.size}
          model={window.model}
          availableModels={availableModels}
          onMove={moveWindow}
          onResize={resizeWindow}
          onFocus={focusWindow}
          isFocused={window.isFocused}
          onClose={handleCloseWindow}
          onClearContext={handleClearContext}
          onModelChange={updateWindowModel}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessingFor(window.id)}
          onConnectStart={onConnectStart}
          highlightAsTarget={window.id === hoveredTargetId}
        />
      ))}
      
      <StatusBar 
        status={status}
        windowCount={windows.length}
        connectionCount={connections.length}
      />
    </div>
  );
}

export default App;
