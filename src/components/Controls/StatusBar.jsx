import React, { useState, useEffect } from 'react';
import './StatusBar.css';

const StatusBar = ({ status, windowCount, connectionCount }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="status-bar">
      <div className="status-item">
        Status: <span className="status-value">{status}</span>
      </div>
      <div className="status-item">
        Windows: <span className="status-value">{windowCount}</span>
      </div>
      <div className="status-item">
        Connections: <span className="status-value">{connectionCount}</span>
      </div>
      <div className="status-item clock">
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

export default StatusBar;
