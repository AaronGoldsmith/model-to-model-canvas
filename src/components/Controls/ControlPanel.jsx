import React from 'react';
import ModelSelector from './ModelSelector';
import './ControlPanel.css';

const ControlPanel = ({ 
  isAutoRunEnabled, 
  onToggleAutoRun, 
  onRunNext, 
  onNewWindow, 
  onClearWindows, 
  onClearConnections,
  onExportConversations,
  onModelSelect,
  selectedModel,
  availableModels
}) => {
  return (
    <div className="control-panel">
      <div className="control-group">
        <button onClick={onNewWindow} className="control-btn">New Window</button>
        <button onClick={onClearWindows} className="control-btn">Clear Windows</button>
      </div>
      
      <div className="control-group">
        <button 
          onClick={onToggleAutoRun} 
          className={`control-btn ${isAutoRunEnabled ? 'active' : ''}`}
        >
          {isAutoRunEnabled ? 'Disable Auto-Run' : 'Enable Auto-Run'}
        </button>
        <button onClick={onRunNext} className="control-btn">Run Next</button>
      </div>
      
      <div className="control-group">
        <button onClick={onClearConnections} className="control-btn">Clear Connections</button>
        <button onClick={onExportConversations} className="control-btn">Export Conversations</button>
      </div>
      
      <div className="control-group">
        <ModelSelector 
          onSelect={onModelSelect}
          selectedModel={selectedModel}
          availableModels={availableModels}
        />
      </div>
    </div>
  );
};

export default ControlPanel;
