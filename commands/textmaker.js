// Cloud image-text services received user-submitted text.
async function textmakerCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, { text: 'External text-to-image effects are disabled for privacy.' }, { quoted: message });
}
module.exports = textmakerCommand;
