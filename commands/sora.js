// Remote text-to-video endpoint disabled. This is not a media downloader.
async function soraCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, { text: 'Remote AI video generation is disabled for privacy.' }, { quoted: message });
}
module.exports = soraCommand;
