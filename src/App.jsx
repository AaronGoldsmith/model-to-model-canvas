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
    isProcessing,
  } = useOllamaAPI();

  const [isAutoRunEnabled, setIsAutoRunEnabled] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [availableModels, setAvailableModels] = useState(['llama3.1']);
  const [selectedModel, setSelectedModel] = useState('llama3.1');
  const [conversations, setConversations] = useState([]);
  const nextWindowId = useRef(1);

  const [windowContents, setWindowContents] = useState({
    'initial-window': `Welcome to Cybernetic Canvas!

This is a multi-window conversational AI interface.

Features:
- Create multiple windows
- Connect windows to pass messages
- Run conversations automatically or manually
- Export conversations

Click "New Window" to create more windows.`
  });
  const [windowHistories, setWindowHistories] = useState({
    'initial-window': []
  });

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
    const window = windows.find(w => w.id === windowId);
    if (!window) return;

    const userMessage = `
[user]: ${message}`;
    const newContent = (windowContents[windowId] || '') + userMessage;
    setWindowContents(prev => ({ ...prev, [windowId]: newContent }));

    const currentHistory = windowHistories[windowId] || [];
    const newHistory = [...currentHistory, { role: 'user', content: message }];
    setWindowHistories(prev => ({ ...prev, [windowId]: newHistory }));

    try {
      const response = await sendMessage(window.model, newHistory, message);
      
      if (response.success) {
        const aiMessage = `
[assistant]: ${response.finalOutput}`;
        const updatedContent = newContent + aiMessage;
        setWindowContents(prev => ({ ...prev, [windowId]: updatedContent }));

        const finalHistory = [...newHistory, { role: 'assistant', content: response.finalOutput }];
        setWindowHistories(prev => ({ ...prev, [windowId]: finalHistory }));

        if (isAutoRunEnabled) {
          propagateData(windowId, response.finalOutput);
        }
      } else {
        const errorMessage = `
[error]: ${response.error}`;
        setWindowContents(prev => ({ ...prev, [windowId]: prev[windowId] + errorMessage }));
      }
    } catch (err) {
      const errorMessage = `
[error]: Failed to get response from model`;
      setWindowContents(prev => ({ ...prev, [windowId]: prev[windowId] + errorMessage }));
    }
  };
  
  const propagateData = async (fromWindowId, data) => {
    connections.forEach(conn => {
      if (conn.from === fromWindowId) {
        const targetWindow = windows.find(w => w.id === conn.to);
        if (targetWindow) {
          processPipedMessageToWindow(conn.to, data, targetWindow.model);
        }
      }
    });
  };
  
  const processPipedMessageToWindow = async (windowId, message, model) => {
    // Simplified for clarity
    handleSendMessage(windowId, message);
  };

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
        onConnect={addConnection}
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
          isProcessing={isProcessing}
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
