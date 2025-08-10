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
  isProcessing,
  onConnectStart,
  highlightAsTarget = false,
}) => {
  const windowRef = useRef(null);
  const titleBarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeOriginRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  const rafMoveRef = useRef(null);
  const rafResizeRef = useRef(null);
  const pendingMoveRef = useRef(null);
  const pendingResizeRef = useRef(null);
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

  const clampPositionToViewport = (x, y, width, height) => {
    const maxX = Math.max(0, window.innerWidth - width);
    const maxY = Math.max(0, window.innerHeight - height);
    return { x: Math.min(Math.max(0, x), maxX), y: Math.min(Math.max(0, y), maxY) };
  };

  const clampSizeToViewport = (x, y, width, height, minW = 200, minH = 150) => {
    const maxW = Math.max(minW, window.innerWidth - x);
    const maxH = Math.max(minH, window.innerHeight - y);
    return { width: Math.min(Math.max(minW, width), maxW), height: Math.min(Math.max(minH, height), maxH) };
  };

  const handleTitleBarMouseDown = (e) => {
    if (e.target.closest('.window-controls') || e.target.closest('.connector-node')) return;
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    const onRafMove = () => {
      if (!pendingMoveRef.current) { rafMoveRef.current = null; return; }
      const { clientX, clientY } = pendingMoveRef.current;
      const nx = clientX - dragOffset.x;
      const ny = clientY - dragOffset.y;
      const clamped = clampPositionToViewport(nx, ny, size.width, size.height);
      onMove(id, clamped);
      pendingMoveRef.current = null;
      rafMoveRef.current = requestAnimationFrame(onRafMove);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      pendingMoveRef.current = { clientX: e.clientX, clientY: e.clientY };
      if (!rafMoveRef.current) {
        rafMoveRef.current = requestAnimationFrame(onRafMove);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current);
      rafMoveRef.current = null;
      pendingMoveRef.current = null;
    };
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current);
      rafMoveRef.current = null;
      pendingMoveRef.current = null;
    };
  }, [isDragging, dragOffset, id, onMove, size.width, size.height]);

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
    const onRafResize = () => {
      if (!pendingResizeRef.current) { rafResizeRef.current = null; return; }
      const { clientX, clientY } = pendingResizeRef.current;
      const { startX, startY, startWidth, startHeight } = resizeOriginRef.current;
      const newW = startWidth + (clientX - startX);
      const newH = startHeight + (clientY - startY);
      const { width, height } = clampSizeToViewport(position.x, position.y, newW, newH);
      onResize(id, { width, height });
      pendingResizeRef.current = null;
      rafResizeRef.current = requestAnimationFrame(onRafResize);
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      pendingResizeRef.current = { clientX: e.clientX, clientY: e.clientY };
      if (!rafResizeRef.current) {
        rafResizeRef.current = requestAnimationFrame(onRafResize);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      if (rafResizeRef.current) cancelAnimationFrame(rafResizeRef.current);
      rafResizeRef.current = null;
      pendingResizeRef.current = null;
    };
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafResizeRef.current) cancelAnimationFrame(rafResizeRef.current);
      rafResizeRef.current = null;
      pendingResizeRef.current = null;
    };
  }, [isResizing, id, onResize, position.x, position.y]);

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() !== '') {
        onSendMessage(id, inputValue.trim());
        setInputValue('');
      }
    }
  };

  const getConnectorCenter = (side) => {
    if (!windowRef.current) return { x: 0, y: 0 };
    const rect = windowRef.current.getBoundingClientRect();
    const cx = side === 'left' ? rect.left : rect.right;
    const cy = rect.top + rect.height / 2;
    return { x: cx, y: cy };
  };

  return (
    <div
      ref={windowRef}
      data-window-id={id}
      className={`window ${isFocused ? 'focused' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${highlightAsTarget ? 'target-highlight' : ''}`}
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
      >
        <div className="connector-node left" title="Connect from" onMouseDown={(e) => {
          e.stopPropagation();
          const { x, y } = getConnectorCenter('left');
          onConnectStart && onConnectStart(id, x, y);
        }} />
        <span className="title-text">{title}</span>
        <div className="title-right">
          <div className={`processing-indicator ${isProcessing ? 'visible' : ''}`} title={isProcessing ? 'Processing...' : ''} />
          <div className="window-controls">
            <button className="control-btn" onClick={() => onClearContext(id)} title="Clear context">🗑️</button>
            <button className="control-btn" onClick={() => onClose(id)} title="Close window">×</button>
          </div>
          <div className="connector-node right" title="Connect to" onMouseDown={(e) => {
            e.stopPropagation();
            const { x, y } = getConnectorCenter('right');
            onConnectStart && onConnectStart(id, x, y);
          }} />
        </div>
      </div>
      
      <div className="window-content">
        <div className="model-selector" ref={modelSelectorRef}>
          <label>Model: </label>
          <div className="custom-select-wrapper">
            <div className="custom-select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {model}
              {isProcessing && <span className="inline-spinner" aria-hidden>⏳</span>}
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
};

export default Window;
