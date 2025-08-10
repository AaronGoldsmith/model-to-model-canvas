import React, { useState, useRef, useEffect } from 'react';
import './Window.css';

const Window = ({ 
  id, 
  title, 
  content, 
  position, 
  size, 
  onMove, 
  onResize, 
  onFocus, 
  isFocused,
  onClose,
  onClearContext,
  model,
  availableModels,
  onModelChange,
  onSendMessage,
  isProcessing
}) => {
  const windowRef = useRef(null);
  console.log(`Rendering window with id: ${id}, title: ${title}`);
  try {
  const titleBarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeOriginRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  const [inputValue, setInputValue] = useState('');
  const contentRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const modelSelectorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClick = () => onFocus(id);
    const windowElement = windowRef.current;
    if (windowElement) {
      windowElement.addEventListener('mousedown', handleClick);
    }
    return () => {
      if (windowElement) {
        windowElement.removeEventListener('mousedown', handleClick);
      }
    };
  }, [id, onFocus]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content]);

  const handleTitleBarMouseDown = (e) => {
    if (e.target.closest('.window-controls')) return;
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        onMove(id, { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onMove]);

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    // capture origin metrics so we resize relative to the start, not the continuously-updating size
    resizeOriginRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const { startX, startY, startWidth, startHeight } = resizeOriginRef.current;
        const width = Math.max(200, startWidth + (e.clientX - startX));
        const height = Math.max(150, startHeight + (e.clientY - startY));
        onResize(id, { width, height });
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, id, onResize]);

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() !== '') {
        onSendMessage(id, inputValue.trim());
        setInputValue('');
      }
    }
  };

  return (
    <div
      ref={windowRef}
      className={`window ${isFocused ? 'focused' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`
      }}
    >
      <div 
        ref={titleBarRef}
        className="title-bar"
        onMouseDown={handleTitleBarMouseDown}
        onMouseDownCapture={(e) => {
          // if user holds Alt/Option while mouse-down on the title, start a connection
          if (e.altKey && windowRef.current) {
            const rect = windowRef.current.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            if (typeof onStartConnect === 'function') {
              onStartConnect(id, startX, startY);
            }
          }
        }}
      >
        <span className="title-text">{title}</span>
        <div className="window-controls">
          <button className="control-btn" onClick={() => onClearContext(id)} title="Clear context">🗑️</button>
          <button className="control-btn" onClick={() => onClose(id)} title="Close window">×</button>
        </div>
      </div>
      
      <div className="window-content">
        <div className="model-selector" ref={modelSelectorRef}>
          <label>Model: </label>
          <div className="custom-select-wrapper">
            <div className="custom-select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {model}
            </div>
            {isDropdownOpen && (
              <div className="custom-options">
                {availableModels.map(m => (
                  <div 
                    key={m} 
                    className={`custom-option ${model === m ? 'selected' : ''}`}
                    onClick={() => {
                      onModelChange(id, m);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="content-display" ref={contentRef}>
          {content}
          {isProcessing && (
            <div className="bot-message blinking">(Model: {model}) Thinking...</div>
          )}
        </div>
        <textarea
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type a prompt and press Enter..."
          disabled={isProcessing}
        />
      </div>
      
      <div className="resize-handle" onMouseDown={handleResizeMouseDown}>↘</div>
    </div>
  );
  } catch (error) {
    console.error(`Error rendering window ${id}:`, error);
    return null; // Don't render the component if there's an error
  }
};

export default Window;
