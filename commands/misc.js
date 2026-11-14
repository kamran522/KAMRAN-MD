'use strict';
const { sharp, source, readImage, card, escapeXML, sendFailure } = require('../lib/local-media');
const COLORS = {
  horny: ['#390c2f', '#b62e65', '#ffd5eb'],
  circle: ['#10182e', '#334d87', '#c4ecff'],
  lgbt: ['#35124d', '#c04c87', '#ffe3b8'],
  lolice: ['#182438', '#5379a9', '#e7f3ff'],
  simpcard: ['#2b0c2a', '#99496a', '#ffc9d6'],
  tonikawa: ['#241e60', '#8374db', '#ffcaef'],
  'its-so-stupid': ['#1c2033', '#875b52', '#fff0cf'],
  namecard: ['#112b2b', '#478b7b', '#e2fff2'],
  oogway: ['#1a3319', '#63995a', '#f0ffc9'],
  oogway2: ['#172e18', '#406b5d', '#c4ffef'],
  tweet: ['#132337', '#347ea4', '#f0ffff'],
  'youtube-comment': ['#281118', '#b03a47', '#fff2f2'],
  comrade: ['#350e14', '#ab2932', '#fff2dc'],
  gay: ['#351b55', '#a658ad', '#fceeff'],
  glass: ['#122c41', '#5a8da0', '#e7faff'],
  jail: ['#2b2b2b', '#626262', '#f3f3f3'],
  triggered: ['#3a1010', '#ca3323', '#ffedc7']
};

async function miscCommand(sock, chatId, message, args = []) {
  const type = String(args[0] || 'effect').toLowerCase();
  const palette = COLORS[type] || ['#1c2340', '#435189', '#eaf0ff'];
  const text = (args.slice(1).join(' ') || type.toUpperCase()).slice(0, 80);
  try {
    let png;
    if (source(message)) {
      const image = await readImage(message);
      const base = await sharp(image, { limitInputPixels: 20000000 })
        .rotate().resize(640, 640, { fit: 'cover' })
        .modulate({ saturation: type === 'glass' ? 0.7 : 1.15 })
        .png().toBuffer();
      const overlay = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640">' +
        '<rect y="510" width="640" height="130" fill="' + palette[0] + '" opacity=".88"/>' +
        '<text x="320" y="584" text-anchor="middle" font-family="DejaVu Sans,Arial" font-size="44" fill="' + palette[2] + '" font-weight="bold">' +
        escapeXML(type.toUpperCase().slice(0, 18)) + '</text></svg>');
      png = await sharp(base).composite([{ input: overlay, left: 0, top: 0 }]).png().toBuffer();
    } else {
      png = await sharp(card(text, type.toUpperCase(), palette)).png().toBuffer();
    }
    await sock.sendMessage(chatId, { image: png, caption: 'KAMRAN-MD · ' + type + ' (local graphic)' }, { quoted: message });
  } catch (error) { await sendFailure(sock, chatId, message, error, type); }
}
async function handleHeart(sock, chatId, message) {
  return miscCommand(sock, chatId, message, ['heart', '♥']);
}
module.exports = { miscCommand, handleHeart };
