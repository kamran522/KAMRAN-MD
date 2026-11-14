// Pairing is deliberately restricted to the local server, never a remote code service.
const settings = require('../settings');
async function pairCommand(sock, chatId, message) {
  return sock.sendMessage(chatId, {
    text: 'For your security, pairing is available only on the bot server at http://127.0.0.1:3000 (or PAIRING_PORT). Sign in to the server or use an SSH tunnel. Pairing number: +' + settings.ownerNumber
  }, { quoted: message });
}
module.exports = pairCommand;
