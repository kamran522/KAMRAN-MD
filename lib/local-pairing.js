'use strict';
const http = require('http');
const QRCode = require('qrcode');
const settings = require('../settings');

let socket = null;
let qr = null;
let code = null;
let status = 'Waiting for WhatsApp connection';
let started = false;
const port = Number(process.env.PAIRING_PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PAIRING_PORT');

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function attachSocket(client) {
  socket = client;
  qr = null;
  code = null;
  status = client.authState.creds.registered ? 'Reconnecting' : 'Waiting for QR or pairing code';
}
function setQr(value) {
  qr = value;
  code = null;
  status = 'Scan QR in WhatsApp > Linked Devices';
}
function setStatus(value) {
  status = value;
  if (value === 'Connected to WhatsApp' || value === 'Disconnected') {
    qr = null;
    code = null;
  }
}
async function requestCode() {
  if (!socket || socket.authState.creds.registered) throw new Error('Not available for an already linked session');
  const number = String(settings.ownerNumber || '').replace(/\D/g, '');
  if (!/^\d{8,15}$/.test(number)) throw new Error('Invalid owner phone number');
  const value = await socket.requestPairingCode(number);
  code = String(value).match(/.{1,4}/g).join('-');
  qr = null;
  status = 'Enter pairing code in WhatsApp > Linked Devices';
  return code;
}
function start() {
  if (started) return;
  started = true;
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src data:; style-src 'unsafe-inline'; form-action 'self'");
    if (req.method === 'POST' && req.url === '/pair') {
      try { await requestCode(); }
      catch (error) { status = 'Pairing failed: ' + error.message; }
      res.writeHead(303, { Location: '/' });
      return res.end();
    }
    if (req.method !== 'GET' || req.url !== '/') {
      res.writeHead(404); return res.end('Not found');
    }
    let image = '';
    if (qr) {
      try { image = '<img width="260" height="260" alt="WhatsApp login QR" src="' +
        await QRCode.toDataURL(qr, { margin: 1, width: 260 }) + '">'; }
      catch (error) { status = 'QR generation error'; }
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="5">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Local WhatsApp pairing</title></head>' +
      '<body style="font-family:system-ui;max-width:480px;margin:3em auto;padding:1em">' +
      '<h1>' + escapeHTML(settings.botName) + '</h1><p>' + escapeHTML(status) + '</p>' +
      image + (code ? '<h2>Pairing code: <code>' + escapeHTML(code) + '</code></h2>' : '') +
      '<p>Number: +' + escapeHTML(settings.ownerNumber) + '</p>' +
      '<form method="post" action="/pair"><button type="submit">Generate pairing code locally</button></form>' +
      '<p>Only accessible at 127.0.0.1. Credentials remain in SESSION_DIR on this server.</p></body></html>');
  });
  server.on('error', err => console.error('Local pairing server error:', err.message));
  server.listen(port, '127.0.0.1', () => console.log('Local pairing page: http://127.0.0.1:' + port));
}
module.exports = { start, attachSocket, setQr, setStatus, requestCode };
