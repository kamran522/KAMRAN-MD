'use strict';
const { sharp, readImage, escapeXML, sendFailure } = require('../lib/local-media');
async function wastedCommand(sock, chatId, message) {
  try {
    const image = await readImage(message);
    const base = await sharp(image, { limitInputPixels: 20000000 })
      .rotate().resize(640, 640, { fit: 'cover' })
      .grayscale().modulate({ brightness: 0.75 })
      .png().toBuffer();
    const label = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><rect x="0" y="250" width="640" height="130" fill="#360404" opacity=".75"/><text x="320" y="339" font-family="DejaVu Sans,Arial" text-anchor="middle" font-size="92" font-weight="bold" fill="#da3226">' + escapeXML('WASTED') + '</text></svg>');
    const result = await sharp(base).composite([{ input: label, left: 0, top: 0 }]).png().toBuffer();
    await sock.sendMessage(chatId, { image: result, caption: 'KAMRAN-MD · local WASTED effect' }, { quoted: message });
  } catch (error) { await sendFailure(sock, chatId, message, error, 'wasted'); }
}
module.exports = wastedCommand;
