// Third-party screenshot service previously received submitted URLs.
async function handleSsCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, { text: 'External screenshot service disabled for privacy.' }, { quoted: message });
}
module.exports = { handleSsCommand };
