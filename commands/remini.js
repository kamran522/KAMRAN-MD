'use strict';
const { sharp, readImage, sendFailure } = require('../lib/local-media');

async function reminiCommand(sock, chatId, message) {
  try {
    const image = await readImage(message);
    const info = await sharp(image, { limitInputPixels: 20000000 }).metadata();
    if (!info.width || !info.height) throw new Error('Unsupported image.');
    const multiplier = Math.min(2, 2048 / Math.max(info.width, info.height));
    const width = Math.max(1, Math.round(info.width * multiplier));
    const enhanced = await sharp(image, { limitInputPixels: 20000000 })
      .rotate()
      .resize({ width, withoutEnlargement: multiplier <= 1 })
      .normalise()
      .modulate({ saturation: 1.12, brightness: 1.02 })
      .sharpen({ sigma: 1.2 })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
    await sock.sendMessage(chatId, {
      image: enhanced,
      caption: '✅ Local photo enhancement and upscaling (Sharp). Not AI face restoration.'
    }, { quoted: message });
  } catch (error) {
    await sendFailure(sock, chatId, message, error, 'remini');
  }
}
module.exports = { reminiCommand };
