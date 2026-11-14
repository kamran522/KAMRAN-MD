// Previous implementation uploaded WhatsApp images to outside image hosting/services.
async function reminiCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, { text: 'External image enhancement disabled for privacy.' }, { quoted: message });
}
module.exports = { reminiCommand };
