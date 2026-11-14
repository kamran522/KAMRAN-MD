const { generateAI } = require('../lib/local-ai');

async function aiCommand(sock, chatId, message) {
  const raw = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
  const query = raw.replace(/^\.(?:ai|gpt|gemini)\s*/i, '').trim();
  if (!query) return sock.sendMessage(chatId, { text: 'Usage: .ai <question>' }, { quoted: message });
  try {
    const response = await generateAI(query);
    await sock.sendMessage(chatId, { text: response }, { quoted: message });
  } catch (error) {
    console.error('[local AI]', error.message);
    await sock.sendMessage(chatId, {
      text: 'Local AI unavailable. Start Ollama on this server and run: ollama pull qwen2.5:1.5b'
    }, { quoted: message });
  }
}
module.exports = aiCommand;
