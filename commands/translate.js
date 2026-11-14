const { generateAI } = require('../lib/local-ai');
async function handleTranslateCommand(sock, chatId, message, match = '') {
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  let text = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
  let lang = '';
  if (text) {
    lang = match.trim();
  } else {
    const args = match.trim().split(/\s+/).filter(Boolean);
    lang = args.pop() || '';
    text = args.join(' ');
  }
  if (!text || !/^[a-z]{2,12}(-[a-z]{2,12})?$/i.test(lang)) {
    return sock.sendMessage(chatId, { text: 'Usage: .trt <text> <language code>, or reply to text with .trt <language code>' }, { quoted: message });
  }
  try {
    const result = await generateAI('Translate the following text into language ' + lang + '. Return only the translation.\n\n' + text.slice(0,3000));
    return sock.sendMessage(chatId, { text: result }, { quoted: message });
  } catch (error) {
    console.error('[local translation]', error.message);
    return sock.sendMessage(chatId, { text: 'Local translation unavailable. Start Ollama.' }, { quoted: message });
  }
}
module.exports = { handleTranslateCommand };
