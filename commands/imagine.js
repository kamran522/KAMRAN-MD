'use strict';
const { sharp, card, sendFailure } = require('../lib/local-media');
async function imagineCommand(sock, chatId, message) {
  const raw = message.message?.conversation || message.message?.extendedTextMessage?.text || message.message?.imageMessage?.caption || '';
  const prompt = raw.replace(/^\.(?:imagine|flux|dalle)\s*/i, '').trim();
  if (!prompt) return sock.sendMessage(chatId, { text: 'Usage: .imagine <text>. This creates a local prompt-art card, not a generated illustration.' }, { quoted: message });
  if ([...prompt].length > 120) return sock.sendMessage(chatId, { text: 'Please use 120 characters or fewer.' }, { quoted: message });
  try {
    const sum = [...prompt].reduce((v, c) => (v * 31 + c.charCodeAt(0)) >>> 0, 0);
    const colors = ['#211329', '#274970', '#e9bbff'];
    if (sum % 3 === 1) colors.splice(0, 3, '#0a3028', '#247a66', '#aef9da');
    if (sum % 3 === 2) colors.splice(0, 3, '#402018', '#975132', '#ffe1a8');
    const png = await sharp(card(prompt, 'LOCAL PROMPT ART · NOT AI', colors)).png().toBuffer();
    await sock.sendMessage(chatId, { image: png, caption: 'Local prompt-art graphic. This is not AI-generated image content.' }, { quoted: message });
  } catch (error) { await sendFailure(sock, chatId, message, error, 'imagine'); }
}
module.exports = imagineCommand;
