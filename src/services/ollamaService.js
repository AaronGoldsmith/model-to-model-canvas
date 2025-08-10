// src/services/ollamaService.js
const OLLAMA_SERVER_URL = 'http://localhost:11434';

/**
 * Fetch available models from Ollama
 * @returns {Promise<Array<string>>} Array of model names
 */
export const fetchOllamaModels = async () => {
  try {
    const response = await fetch(`${OLLAMA_SERVER_URL}/api/tags`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const models = result.models ? result.models.map(model => model.name) : [];
    return models;
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error);
    throw new Error('Could not connect to Ollama server. Please ensure it is running.');
  }
};

/**
 * Send a chat request to Ollama
 * @param {string} model - The model to use
 * @param {Array} messages - Array of message objects with role and content
 * @param {boolean} stream - Whether to stream the response
 * @returns {Promise<Object>} The response from Ollama
 */
export const sendChatRequest = async (model, messages, stream = false) => {
  try {
    const response = await fetch(`${OLLAMA_SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to send chat request to ${model}:`, error);
    throw new Error(`Could not connect to Ollama server for model ${model}.`);
  }
};

/**
 * Extract thoughts from model response
 * @param {string} responseText - The raw response text
 * @returns {Object} Object containing final output and thoughts
 */
export const extractThoughts = (responseText) => {
  const thoughtRegex = /<(?:think|thought)>(.*?)<\/(?:think|thought)>/gs;
  const thoughtMatches = [...responseText.matchAll(thoughtRegex)];
  
  const thoughts = thoughtMatches.map(match => match[1].trim());
  const finalOutput = responseText.replace(thoughtRegex, '').trim();
  
  return {
    finalOutput: finalOutput || 'No final output provided.',
    thoughts: thoughts
  };
};

export default {
  fetchOllamaModels,
  sendChatRequest,
  extractThoughts
};
