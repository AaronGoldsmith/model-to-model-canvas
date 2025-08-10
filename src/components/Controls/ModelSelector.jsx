import React, { useState, useRef, useEffect } from 'react';

const ModelSelector = ({ onSelect, selectedModel, availableModels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleModelSelect = (model) => {
    onSelect(model);
    setIsOpen(false);
  };

  return (
    <div className="model-selector-container" ref={selectorRef}>
      <button 
        onClick={toggleOpen} 
        className="control-btn"
        id="modelSelectorBtn"
      >
        Select Model
      </button>
      
      {isOpen && (
        <div className="model-dropdown" id="modelSelector">
          {availableModels.map((model) => (
            <div 
              key={model} 
              className={`model-option ${selectedModel === model ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model)}
            >
              {model}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
