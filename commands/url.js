// External hosting uploads disabled to avoid uploading WhatsApp media to third parties.
async function urlCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, { text: 'External media upload-to-URL is disabled for privacy. Downloader commands are unaffected.' }, { quoted: message });
}
module.exports = urlCommand;
