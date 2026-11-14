'use strict';
const { sharp, readImage, sendFailure } = require('../lib/local-media');

function removeUniformBackground(data, width, height, channels) {
  // Edge-connected color-key removal. Works with mostly plain backgrounds,
  // not with complex scenes; never sends the image to a remote service.
  const cornerPositions = [0, width - 1, (height - 1) * width, height * width - 1];
  const bg = [0, 0, 0];
  for (const pos of cornerPositions) {
    for (let c = 0; c < 3; c++) bg[c] += data[pos * channels + c] / 4;
  }
  const n = width * height;
  const visited = new Uint8Array(n);
  const stack = [];
  const similar = pos => {
    const idx = pos * channels;
    const dr = data[idx] - bg[0], dg = data[idx + 1] - bg[1], db = data[idx + 2] - bg[2];
    return (dr * dr + dg * dg + db * db) < 62 * 62;
  };
  const queue = pos => {
    if (!visited[pos] && similar(pos)) { visited[pos] = 1; stack.push(pos); }
  };
  for (let x = 0; x < width; x++) { queue(x); queue((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { queue(y * width); queue(y * width + width - 1); }
  while (stack.length) {
    const pos = stack.pop();
    data[pos * channels + 3] = 0;
    const x = pos % width;
    if (x > 0) queue(pos - 1);
    if (x < width - 1) queue(pos + 1);
    if (pos >= width) queue(pos - width);
    if (pos + width < n) queue(pos + width);
  }
  return data;
}

async function removeBgCommand(sock, message) {
  const chatId = message.key.remoteJid;
  try {
    const original = await readImage(message);
    const { data, info } = await sharp(original, { limitInputPixels: 20000000 })
      .rotate().resize(900, 900, { fit: 'inside', withoutEnlargement: true })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const processed = removeUniformBackground(data, info.width, info.height, info.channels);
    const result = await sharp(processed, { raw: info }).png().toBuffer();
    await sock.sendMessage(chatId, {
      document: result,
      fileName: 'background_removed.png',
      mimetype: 'image/png',
      caption: '✅ Local simple-background removal (transparent PNG). Best for plain backgrounds; complex backgrounds may remain.'
    }, { quoted: message });
  } catch (error) {
    await sendFailure(sock, chatId, message, error, 'removebg');
  }
}
module.exports = { exec: removeBgCommand, removeUniformBackground };
