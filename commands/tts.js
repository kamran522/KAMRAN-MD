// Cloud TTS used to upload message text. Disabled until an offline TTS engine is configured.
async function ttsCommand(sock, chatId, text, message) {
  await sock.sendMessage(chatId, { text: 'Cloud text-to-speech is disabled for privacy. Offline TTS is not installed.' }, { quoted: message });
}
module.exports = ttsCommand;
