'use strict';
const { sharp, card, sendFailure } = require('../lib/local-media');
// A private URL card, not a live website screenshot. The VPS never visits a
// user-supplied website or uploads its URL to a screenshot-as-a-service API.
async function handleSsCommand(sock, chatId, message, target) {
  const raw = String(target || '').trim();
  if (!raw) return sock.sendMessage(chatId, { text: 'Usage: .ss https://example.com (local URL card, not an actual screenshot)' }, { quoted: message });
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || raw.length > 1000) {
      throw new Error('Provide a valid public HTTPS URL without credentials.');
    }
    const png = await sharp(card(url.hostname, 'LOCAL URL CARD · NOT PAGE SCREENSHOT',
      ['#101b30', '#245272', '#e4f7ff'])).png().toBuffer();
    await sock.sendMessage(chatId, {
      image: png,
      caption: 'Local URL card: ' + url.href.slice(0, 500) + '\nNo website was visited. This is not a webpage screenshot.'
    }, { quoted: message });
  } catch (error) { await sendFailure(sock, chatId, message, error, 'ss'); }
}
module.exports = { handleSsCommand };
