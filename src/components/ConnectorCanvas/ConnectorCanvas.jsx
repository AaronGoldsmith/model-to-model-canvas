import React, { useRef, useEffect } from 'react';
import './ConnectorCanvas.css';

const ConnectorCanvas = ({ connections, windows, tempConnection }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Draw permanent connections
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

    // Draw temporary connection while dragging
    if (tempConnection) {
      const fromWindow = windows.find(w => w.id === tempConnection.from);
      if (fromWindow) {
        drawConnection(
          ctx,
          fromWindow.position.x + fromWindow.size.width / 2,
          fromWindow.position.y + fromWindow.size.height / 2,
          tempConnection.x,
          tempConnection.y,
          'pending'
        );
      }
    }
  }, [connections, windows, tempConnection]);

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
