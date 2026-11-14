const settings = require('../settings');
const { supportGroupLink } = require('../lib/messageConfig');
async function aliveCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, {
    text: '*' + settings.botName + '* is online. Owner: ' + settings.botOwner + '\nUse .menu for commands.\nWhatsApp group: ' + supportGroupLink
  }, { quoted: message });
}
module.exports = aliveCommand;
