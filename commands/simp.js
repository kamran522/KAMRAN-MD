async function simpCommand(sock, chatId) {
  await sock.sendMessage(chatId, { text: 'External profile-image processing is disabled for privacy.' });
}
module.exports = { simpCommand };
