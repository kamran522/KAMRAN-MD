const settings = require('../settings');
async function aliveCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, {
    text: '*' + settings.botName + '* is online. Owner: ' + settings.botOwner + '\nUse .menu for commands.'
  }, { quoted: message });
}
module.exports = aliveCommand;
