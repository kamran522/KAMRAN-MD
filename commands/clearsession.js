// Do not delete individual Baileys key files while the process is running.
async function clearSessionCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, {
    text: 'Session cleanup is disabled to prevent corrupting local WhatsApp credentials. Stop the bot before intentionally resetting SESSION_DIR.'
  }, { quoted: message });
}
module.exports = clearSessionCommand;
