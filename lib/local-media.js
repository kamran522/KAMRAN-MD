'use strict';
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

const MAX_BYTES = 12 * 1024 * 1024;
function source(message) {
  const current = message?.message || {};
  const quoted = current.extendedTextMessage?.contextInfo?.quotedMessage;
  const obj = quoted || current;
  const image = obj.imageMessage || obj.stickerMessage;
  if (!image) return null;
  return { image, type: obj.stickerMessage ? 'sticker' : 'image' };
}
async function readImage(message) {
  const selected = source(message);
  if (!selected) throw new Error('Reply to an image or send an image with this command as its caption.');
  const stream = await downloadContentFromMessage(selected.image, selected.type);
  let size = 0;
  const parts = [];
  for await (const chunk of stream) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error('Image exceeds 12 MB; send a smaller photo.');
    parts.push(Buffer.from(chunk));
  }
  if (!size) throw new Error('Image is empty.');
  return Buffer.concat(parts);
}
function escapeXML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
}
function card(text, label = 'KAMRAN-MD', colors = ['#061925', '#17445c', '#73edfc']) {
  const safeText = String(text || '').slice(0, 120).trim();
  const lines = [];
  let remaining = safeText;
  while (remaining && lines.length < 4) {
    let end = remaining.length > 23 ? remaining.lastIndexOf(' ', 23) : remaining.length;
    if (end < 8) end = Math.min(remaining.length, 23);
    lines.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trim();
  }
  const size = Math.min(90, Math.max(36, Math.floor(960 / Math.max(1, ...lines.map(x => [...x].length)) * 1.3)));
  const start = 265 - ((lines.length - 1) * size * 1.22) / 2;
  const texts = lines.map((line, i) => '<text x="480" y="' + (start + i * size * 1.22) +
    '" text-anchor="middle" font-size="' + size + '" font-weight="bold" font-family="DejaVu Sans,Arial,sans-serif" fill="' +
    colors[2] + '">' + escapeXML(line) + '</text>').join('');
  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540">' +
    '<defs><linearGradient id="g"><stop stop-color="' + colors[0] + '"/><stop offset="1" stop-color="' + colors[1] + '"/></linearGradient></defs>' +
    '<rect width="960" height="540" fill="url(#g)"/><rect x="24" y="24" width="912" height="492" rx="30" fill="none" stroke="' + colors[2] + '" opacity=".6" stroke-width="3"/>' +
    texts + '<text x="480" y="475" text-anchor="middle" fill="' + colors[2] +
    '" font-size="20" font-family="DejaVu Sans,Arial" letter-spacing="5">' + escapeXML(label.slice(0, 36)) + '</text></svg>');
}
async function sendFailure(sock, chatId, message, error, command) {
  console.error('[' + command + ']', error?.message || error);
  await sock.sendMessage(chatId, { text: '❌ ' + (error?.message || 'Unable to process this image locally.') }, { quoted: message });
}
module.exports = { sharp, source, readImage, card, escapeXML, sendFailure };
