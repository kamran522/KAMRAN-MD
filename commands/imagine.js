// Remote text-to-image endpoint disabled. No image prompts are uploaded.
async function imagineCommand(sock, chatId, message) {
  await sock.sendMessage(chatId, { text: 'Remote image generation is disabled for privacy. Local Ollama currently provides text AI only.' }, { quoted: message });
}
module.exports = imagineCommand;
