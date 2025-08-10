import React, { useRef, useEffect } from 'react';
import './ConnectorCanvas.css';

const ConnectorCanvas = ({ connections, windows }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size to match display size
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    
    // Scale context to match device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    
    // Draw connections
    connections.forEach(connection => {
      const fromWindow = windows.find(w => w.id === connection.from);
      const toWindow = windows.find(w => w.id === connection.to);
      
      if (fromWindow && toWindow) {
        drawConnection(
          ctx,
          fromWindow.position.x + fromWindow.size.width / 2,
          fromWindow.position.y + fromWindow.size.height / 2,
          toWindow.position.x + toWindow.size.width / 2,
          toWindow.position.y + toWindow.size.height / 2,
          connection.status
        );
      }
    });
  }, [connections, windows]);

  const drawConnection = (ctx, x1, y1, x2, y2, status) => {
    // Set line style based on status
    if (status === 'active') {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
    } else if (status === 'pending') {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1;
    } else {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
    }
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = 10;
    
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - arrowSize * Math.cos(angle - Math.PI / 6),
      y2 - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - arrowSize * Math.cos(angle + Math.PI / 6),
      y2 - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  };

  return (
    <canvas
      ref={canvasRef}
      className="connector-canvas"
    />
  );
};

export default ConnectorCanvas;
