// This module previously uploaded personal/profile images to third-party image APIs.
async function disabled(sock, chatId, message) {
  return sock.sendMessage(chatId, { text: 'External image-card processing is disabled for privacy.' }, { quoted: message });
}
module.exports = { miscCommand: disabled, handleHeart: disabled };
