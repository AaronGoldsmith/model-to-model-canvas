// src/hooks/useOllamaAPI.js
import { useState, useCallback } from 'react';
import { sendChatRequest, extractThoughts } from '../services/ollamaService';

export const useOllamaAPI = () => {
  // Track processing state per window id
  const [processingByWindow, setProcessingByWindow] = useState({});
  const [error, setError] = useState(null);

  const setWindowProcessing = useCallback((windowId, value) => {
    setProcessingByWindow(prev => ({ ...prev, [windowId]: value }));
  }, []);

  const isProcessingFor = useCallback((windowId) => !!processingByWindow[windowId], [processingByWindow]);

  /**
   * Send a message to a specific model and get a response
   * @param {string} windowId - The window sending the message
   * @param {string} model - The model to use
   * @param {Array} conversationHistory - Previous conversation messages
   * @param {string} newMessage - The new message to send
   * @returns {Promise<Object>} Response with final output and thoughts
   */
  const sendMessage = useCallback(async (windowId, model, conversationHistory, newMessage) => {
    setWindowProcessing(windowId, true);
    setError(null);
    try {
      const messages = [
        ...conversationHistory,
        { role: 'user', content: newMessage }
      ];
      const result = await sendChatRequest(model, messages, false);
      if (result.message && result.message.content) {
        const { finalOutput, thoughts } = extractThoughts(result.message.content);
        return { finalOutput, thoughts, rawResponse: result.message.content, success: true };
      } else {
        throw new Error('Invalid response from Ollama');
      }
    } catch (err) {
      setError(err.message);
      return { finalOutput: '', thoughts: [], rawResponse: '', success: false, error: err.message };
    } finally {
      setWindowProcessing(windowId, false);
    }
  }, [setWindowProcessing]);

  /**
   * Process a piped message (from another window)
   */
  const processPipedMessage = useCallback(async (windowId, model, conversationHistory, pipedMessage) => {
    setWindowProcessing(windowId, true);
    setError(null);
    try {
      const isDuplicate = conversationHistory.some(entry => entry.role === 'user' && entry.content === pipedMessage);
      if (isDuplicate) {
        console.warn('Duplicate piped message detected, skipping processing');
        return { finalOutput: '', thoughts: [], rawResponse: '', success: false, isDuplicate: true };
      }
      const messages = [
        ...conversationHistory,
        { role: 'user', content: pipedMessage }
      ];
      const result = await sendChatRequest(model, messages, false);
      if (result.message && result.message.content) {
        const { finalOutput, thoughts } = extractThoughts(result.message.content);
        return { finalOutput, thoughts, rawResponse: result.message.content, success: true };
      } else {
        throw new Error('Invalid response from Ollama');
      }
    } catch (err) {
      setError(err.message);
      return { finalOutput: '', thoughts: [], rawResponse: '', success: false, error: err.message };
    } finally {
      setWindowProcessing(windowId, false);
    }
  }, [setWindowProcessing]);

  return {
    sendMessage,
    processPipedMessage,
    isProcessingFor,
    error
  };
};
