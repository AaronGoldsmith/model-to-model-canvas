# Cybernetic Canvas — Implementation Plan

This document lists the remaining work, grouped by priority and scope. Check items off as we ship them.

## P0 — Bugs and polish

- [x] Per-window processing indicator
  - [x] Hook exposes isProcessingFor(windowId)
  - [x] Audit all usages to ensure no component still uses a global `isProcessing`
  - [x] Add a small spinner glyph next to the Model selector while processing
- [x] Resizer stability
  - [x] Resize uses captured origin (startX/startY/startWidth/startHeight)
  - [x] Throttle `mousemove` handler to ~60fps (requestAnimationFrame) to smooth updates
  - [x] Enforce min/max window sizes and clamp to viewport
  - [x] Prevent resize from causing content reflow jitter (CSS tweaks)
- [x] Remove debug and temporary code
  - [x] Remove `console.log` from Window.jsx
  - [x] Remove try/catch render guard around Window (leave error boundaries for later)
- [x] Spawn position
  - [x] Fix off-screen spawn (use window width minus exact window width)
  - [x] Add cascade offset to avoid overlapping same position repeatedly

## P0 — Connection creation (drag-to-connect)

- [x] Add visible connector nodes in each window title bar (left/right sides)
- [x] Start connection on mousedown of node; show “pending” line while dragging
- [x] Hit-test on mouseup to determine target window (center or target node)
- [x] Create connection via useConnectionManager.addConnection(fromId, toId)
- [x] Visual feedback
  - [x] Highlight potential target window on hover
  - [x] Color pending line differently (yellow)
- [ ] Connection deletion
  - [ ] Click a line to select; press Delete to remove
  - [ ] Or right-click context menu on line to remove
- [x] Edge cases
  - [x] Don’t allow duplicate connections or self-connections
  - [x] Handle windows moved/resized during drag

## P1 — Propagation and Auto-Run

- [ ] Propagation semantics
  - [ ] Pipe the assistant’s final output to all outgoing connections
  - [ ] Optional: choose to pipe “final output” vs. full raw response
- [ ] Cycle detection and duplicate prevention
  - [ ] Track message IDs/hops to avoid loops between windows
- [ ] Auto-Run controls
  - [ ] When enabled, responses auto-propagate
  - [ ] “Run Next” should process one step of the graph manually

## P1 — Export/Import & Persistence

- [ ] Export conversations to JSON (all windows, histories, connections)
- [ ] Import from JSON to restore a session
- [ ] Local persistence
  - [ ] Save windows, positions/sizes, and connections to localStorage
  - [ ] Restore on app load

## P1 — Streaming & UX

- [ ] Add streaming support in `ollamaService` and `useOllamaAPI`
- [ ] Show incremental assistant tokens in the target window
- [ ] Allow cancel in-flight request per window

## P2 — UI/UX improvements

- [ ] Better status for connections (active/pending/error)
- [ ] Connection labels/tooltips (model, last message summary)
- [ ] Snap-to-grid dragging; optional grid toggle
- [ ] Keyboard affordances (Esc cancels connection drag, arrow keys nudge window)
- [ ] Rename windows; color-code border by model
- [ ] Multi-select windows and group move

## P2 — Architecture & Quality

- [ ] Break down App.jsx (lift connection drag logic into a dedicated hook)
- [ ] Convert to TypeScript (start with hooks and services)
- [ ] Unit tests
  - [ ] useWindowManager (add/move/resize/focus/close)
  - [ ] useConnectionManager (add/remove/clear/status)
  - [ ] useOllamaAPI (per-window processing state)
- [ ] Lint/format: add Prettier config and consistent import sorting
- [ ] Error boundaries at app-level

## P3 — Documentation & Ops

- [ ] Update README with drag-to-connect gesture and shortcuts
- [ ] Add CONTRIBUTING.md with dev workflow and coding standards
- [ ] Add screenshots/gifs of common flows

## Nice-to-haves / Backlog

- [ ] Window templates (prompt presets per window)
- [ ] Duplicate window including context & model
- [ ] Metrics panel (per-model latency, token counts)
- [ ] Theming (light/dark, retro themes)

---

Owner notes:
- Connection creation currently has an experimental Alt+drag from the title bar; this will be replaced by explicit connector nodes.
- “Thinking…” showing on other windows should already be resolved by `isProcessingFor(windowId)`; verify after cleanup and remove any legacy global usage.
