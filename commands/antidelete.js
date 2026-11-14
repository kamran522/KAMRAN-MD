// Automatic copying/forwarding of deleted and view-once messages is disabled.
// This change does not affect the explicit media download commands.
async function handleAntideleteCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, {
    text: 'Anti-delete auto-copying/forwarding is disabled for privacy.'
  }, { quoted: message });
}
async function handleMessageRevocation() {}
async function storeMessage() {}
module.exports = { handleAntideleteCommand, handleMessageRevocation, storeMessage };
