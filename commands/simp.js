'use strict';
const { miscCommand } = require('./misc');
async function simpCommand(sock, chatId, quotedMessage, mentionedJid, senderId, message) {
  // No third-party avatar service or unauthorized profile image retrieval.
  const localMessage = message || { key: { remoteJid: chatId }, message: quotedMessage ? { extendedTextMessage: { contextInfo: { quotedMessage } } } : {} };
  return miscCommand(sock, chatId, localMessage, ['simpcard', 'SIMP']);
}
module.exports = { simpCommand };
