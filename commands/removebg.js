// Previous implementation uploaded WhatsApp images to outside image hosting/services.
module.exports = {
  async exec(sock, message) {
    const chatId = message.key.remoteJid;
    await sock.sendMessage(chatId, { text: 'External background removal disabled for privacy.' }, { quoted: message });
  }
};
