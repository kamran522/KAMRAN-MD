'use strict';

// Render text effects on this server. No text, pictures, or session data
// are uploaded to an external image-generation API.
const sharp = require('sharp');

const THEMES = Object.freeze({
  metallic:   ['#090f1c', '#293343', '#f9fdff', '#718ba7'],
  ice:        ['#061725', '#174d6a', '#dbfbff', '#52cfff'],
  snow:       ['#102239', '#50647e', '#ffffff', '#a7d6ff'],
  impressive: ['#151127', '#4b297b', '#ffeab7', '#ff7bd5'],
  matrix:     ['#020d07', '#0c3019', '#b0ff9b', '#18d66d'],
  light:      ['#121e32', '#39506d', '#fff9d6', '#ffe985'],
  neon:       ['#0b0629', '#38184f', '#ecbaff', '#ff49d5'],
  devil:      ['#1a050a', '#470f18', '#ffb39e', '#ff3249'],
  purple:     ['#1c0634', '#48266e', '#f3c6ff', '#b071ff'],
  thunder:    ['#060d31', '#28396c', '#edfbff', '#5daeff'],
  leaves:     ['#081b10', '#2a5431', '#e0ffb4', '#73d963'],
  '1917':     ['#1b1510', '#5a4331', '#fff0c8', '#e9b16e'],
  arena:      ['#1c0b11', '#79212b', '#ffe4c1', '#ff7b36'],
  hacker:     ['#020b08', '#103524', '#dcffda', '#23ed77'],
  sand:       ['#392517', '#927049', '#fff0c5', '#f1c16a'],
  blackpink:  ['#170d18', '#411836', '#ffe5ed', '#f987c3'],
  glitch:     ['#100b24', '#342c58', '#e9fdff', '#00e8e5'],
  fire:       ['#260807', '#6d160b', '#fff6aa', '#ff6b21'],
});

function escapeXML(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
  })[char]);
}

function wrapText(value) {
  const lines = [];
  let rest = value;
  while (rest.length && lines.length < 4) {
    if (rest.length <= 19) {
      lines.push(rest);
      break;
    }
    let cut = rest.lastIndexOf(' ', 19);
    if (cut < 7) cut = 19;
    lines.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  return lines;
}

function makeSVG(value, effect) {
  const [dark, mid, light, accent] = THEMES[effect] || THEMES.neon;
  const lines = wrapText(value);
  const longest = Math.max(...lines.map(line => [...line].length));
  const fontSize = Math.max(36, Math.min(112, Math.floor(1080 / (longest * 0.67))));
  const lineHeight = fontSize * 1.18;
  const firstY = 272 - ((lines.length - 1) * lineHeight) / 2;
  const matrix = (effect === 'hacker' || effect === 'matrix')
    ? Array.from({ length: 32 }, (_, i) => {
        const x = i * 30 + 12;
        const y = 70 + (i * 97 % 310);
        return '<text x="' + x + '" y="' + y + '" fill="' + accent
          + '" opacity="0.26" font-size="22" font-family="monospace">'
          + (i % 2 ? '1010101' : '0011001') + '</text>';
      }).join('')
    : Array.from({ length: 24 }, (_, i) => {
        const x = (i * 197 + 73) % 960;
        const y = (i * 131 + 29) % 500;
        return '<circle cx="' + x + '" cy="' + y + '" r="' + (i % 3 + 1)
          + '" fill="' + light + '" opacity="0.36"/>';
      }).join('');
  const text = lines.map((line, i) => {
    const y = (firstY + i * lineHeight).toFixed(1);
    return '<text x="480" y="' + y + '" text-anchor="middle" '
      + 'font-family="DejaVu Sans,Arial,sans-serif" font-size="' + fontSize
      + '" font-weight="900" stroke="' + dark + '" stroke-width="9" '
      + 'stroke-linejoin="round" paint-order="stroke fill" fill="url(#letter)">'
      + escapeXML(line) + '</text>';
  }).join('');
  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">'
    + '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
    + '<stop stop-color="' + dark + '"/><stop offset="1" stop-color="' + mid + '"/>'
    + '</linearGradient><linearGradient id="letter" x1="0" y1="0" x2="0" y2="1">'
    + '<stop stop-color="' + light + '"/><stop offset="1" stop-color="' + accent + '"/>'
    + '</linearGradient><filter id="glow" x="-40%" y="-40%" width="180%" height="180%">'
    + '<feGaussianBlur stdDeviation="12"/></filter></defs>'
    + '<rect width="960" height="540" fill="url(#bg)"/>'
    + '<rect x="24" y="24" width="912" height="492" rx="24" fill="none" '
    + 'stroke="' + accent + '" stroke-width="3" opacity="0.45"/>'
    + matrix + '<g opacity="0.45" fill="' + accent + '" filter="url(#glow)">'
    + text.replace(/fill="url\(#letter\)"/g, 'fill="' + accent + '"') + '</g>'
    + text + '<text x="480" y="489" text-anchor="middle" font-size="20" '
    + 'letter-spacing="8" font-family="monospace" fill="' + accent + '">'
    + escapeXML(effect.toUpperCase()) + ' · KAMRAN-MD</text></svg>');
}

async function textmakerCommand(sock, chatId, message, userMessage, effect) {
  const command = '.' + effect;
  const input = String(userMessage || '').slice(command.length).trim().replace(/\s+/g, ' ');

  if (!input) {
    await sock.sendMessage(chatId, { text: 'Usage: ' + command + ' <text>' }, { quoted: message });
    return;
  }
  if ([...input].length > 64) {
    await sock.sendMessage(chatId, { text: 'Please use 64 characters or fewer.' }, { quoted: message });
    return;
  }
  try {
    const png = await sharp(makeSVG(input, effect), { density: 144 })
      .png().toBuffer();
    await sock.sendMessage(chatId, { image: png, caption: 'KAMRAN-MD · ' + effect + ' (local effect)' }, { quoted: message });
  } catch (error) {
    console.error('[textmaker] Local rendering failed:', error.message);
    await sock.sendMessage(chatId, { text: 'Unable to render text effect locally. Check that sharp is installed.' }, { quoted: message });
  }
}

module.exports = textmakerCommand;
