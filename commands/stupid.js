'use strict';
const { miscCommand } = require('./misc');
async function stupidCommand(sock, chatId, quotedMessage, mentionedJid, senderId, args = [], message) {
  const localMessage = message || { key: { remoteJid: chatId }, message: quotedMessage ? { extendedTextMessage: { contextInfo: { quotedMessage } } } : {} };
  return miscCommand(sock, chatId, localMessage, ['its-so-stupid', ...args]);
}
module.exports = { stupidCommand };
