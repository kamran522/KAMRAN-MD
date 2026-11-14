// Remote ZIP updates and hard resets are disabled to prevent unreviewed remote code execution.
async function updateCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, {
    text: 'Remote self-update is disabled for security. Review code on GitHub, then deploy a verified commit manually.'
  }, { quoted: message });
}
module.exports = updateCommand;
