# Cybernetic Canvas - React Implementation

A multi-window conversational AI interface built with React and Vite.

## Current Status

The React migration has established a solid foundation with core UI components implemented, but the actual AI interaction functionality is still missing. The app currently provides a visual interface for managing windows and connections but doesn't yet connect to the Ollama API for AI responses.

## What's Working

1. **Window Management**
   - Create, move, resize, and close windows
   - Focus management between windows
   - Model selection per window
   - Context clearing functionality

2. **Connection System**
   - Visual connection canvas between windows
   - Connection management (add, remove, clear)

3. **UI Components**
   - Control panel with action buttons
   - Status bar with clock and system information
   - Model selector dropdown
   - Terminal-style styling

4. **State Management**
   - Custom hooks for window and connection management
   - Proper React state handling

## Critical Missing Features (Priority Order)

### 1. Ollama API Integration (Highest Priority)
- Connect to Ollama API for actual AI responses
- Implement chat functionality with streaming responses
- Handle model selection for each window
- Process and display AI responses with proper formatting
- Implement thought processing (extract thoughts from responses)

### 2. Connection Interaction (High Priority)
- Interactive connection creation between window nodes
- Click-to-delete connections
- Visual feedback during connection creation

### 3. Conversation Propagation (High Priority)
- Pass messages between connected windows
- Implement the auto-run functionality for message passing
- Handle context management between connected windows

### 4. Export Functionality (Medium Priority)
- Implement conversation export to JSON
- Add import functionality for saved conversations

### 5. Enhanced UI Features (Medium Priority)
- Add connector nodes to windows for drag-to-connect functionality
- Implement collapse/expand for window content
- Add debug information toggle for API requests/responses

## Component Implementation Status

### App.js
- [x] Basic structure with control panel, windows, and status bar
- [x] State management integration
- [ ] Ollama API integration
- [ ] Conversation propagation logic

### Window Component
- [x] Window creation, movement, resizing
- [x] Model selection dropdown
- [x] Focus management
- [ ] Connector nodes for drag-to-connect
- [ ] Input field for user prompts
- [ ] Response display with proper formatting
- [ ] Collapse/expand functionality

### ConnectorCanvas Component
- [x] Basic connection visualization
- [ ] Interactive connection creation
- [ ] Connection deletion functionality
- [ ] Visual feedback during interaction

### ControlPanel Component
- [x] Basic control buttons
- [x] Model selector integration
- [ ] Actual functionality for all buttons (currently mocked)

### StatusBar Component
- [x] Basic status display
- [x] Clock functionality
- [ ] Real-time system metrics (CPU, memory)

### Hooks
- [x] useWindowManager - Window state management
- [x] useConnectionManager - Connection state management
- [ ] useOllamaAPI - Missing hook for API interactions

## Next Steps - Priority 1 (Ollama Integration)

1. Create a `useOllamaAPI` hook for:
   - Fetching available models from Ollama
   - Sending chat requests to specific models
   - Handling streaming responses
   - Processing thoughts from model responses

2. Update Window component to:
   - Include a chat input field
   - Display user prompts and AI responses
   - Show loading indicators during API requests
   - Handle error states for API failures

3. Integrate API functionality into:
   - App.js for overall orchestration
   - ControlPanel for auto-run toggle functionality

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── ConnectorCanvas/     # Connection visualization
│   ├── Controls/            # Control panel and status bar
│   └── Window/              # Window components and logic
├── hooks/                   # Custom React hooks
├── services/                # API service layer (to be implemented)
└── utils/                   # Utility functions
```

## Environment Requirements

- Node.js 16+
- Ollama server running locally
- At least one AI model downloaded (llama3.1, mistral, etc.)

## Development Notes

The original HTML implementation had extensive functionality that needs to be ported to React:
- Connection drawing with canvas
- Interactive connector nodes on windows
- Mouse event handling for connection creation
- WebSocket-like propagation between connected windows



Current Issues.
Style is not correct