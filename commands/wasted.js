async function wastedCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, { text: 'External profile-image processing is disabled for privacy.' }, { quoted: message });
}
module.exports = wastedCommand;
