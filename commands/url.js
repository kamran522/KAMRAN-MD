'use strict';
const crypto = require('crypto');
const { sharp, readImage, sendFailure } = require('../lib/local-media');

// Creating a PUBLIC URL would require a public server or third-party upload.
// Offer a local file fingerprint instead; do not leak private WhatsApp media.
async function urlCommand(sock, chatId, message) {
  try {
    const media = await readImage(message);
    const details = await sharp(media, { limitInputPixels: 20000000 }).metadata();
    const digest = crypto.createHash('sha256').update(media).digest('hex');
    await sock.sendMessage(chatId, {
      text: 'Local image information (not a public link):\n'
        + 'Size: ' + media.length + ' bytes\n'
        + 'Dimensions: ' + details.width + '×' + details.height + '\n'
        + 'SHA-256: ' + digest + '\n'
        + 'A publicly accessible URL requires a hosted file. Your image was not uploaded.'
    }, { quoted: message });
  } catch (error) { await sendFailure(sock, chatId, message, error, 'url'); }
}
module.exports = urlCommand;
