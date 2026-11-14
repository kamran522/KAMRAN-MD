'use strict';
const http = require('http');

// Only the loopback Ollama service is permitted: no external AI endpoint or API key.
const model = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';
const port = Number(process.env.OLLAMA_PORT || 11434);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid OLLAMA_PORT');

function generateAI(prompt) {
  if (typeof prompt !== 'string' || !prompt.trim()) return Promise.reject(new Error('Prompt required'));
  if (prompt.length > 12000) return Promise.reject(new Error('Prompt too long'));
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ model, prompt, stream: false });
    const request = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/generate',
      method: 'POST',
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, response => {
      let buffer = '';
      response.setEncoding('utf8');
      response.on('data', part => {
        buffer += part;
        if (buffer.length > 2_000_000) response.destroy(new Error('AI response too large'));
      });
      response.on('error', reject);
      response.on('end', () => {
        if (response.statusCode !== 200) return reject(new Error('Local Ollama HTTP ' + response.statusCode));
        try {
          const result = JSON.parse(buffer);
          if (typeof result.response !== 'string') throw new Error('No AI response');
          resolve(result.response.trim() || 'No response generated');
        } catch (error) { reject(error); }
      });
    });
    request.on('timeout', () => request.destroy(new Error('Local AI timeout')));
    request.on('error', reject);
    request.end(data);
  });
}
module.exports = { generateAI };
