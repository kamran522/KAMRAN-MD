'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');
const { execFileSync } = require('child_process');
const base = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(base, p), 'utf8');
function allJS(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'session'].includes(name)) continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) allJS(full, out);
    else if (name.endsWith('.js')) out.push(full);
  }
  return out;
}
for (const file of allJS(base)) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}
assert(read('settings.js').includes("botOwner: 'Kamran Hasil'"));
assert(read('settings.js').includes("ownerNumber: '923111008401'"));
assert.deepStrictEqual(JSON.parse(read('data/owner.json')), ['923111008401']);
assert.match(read('lib/local-ai.js'), /hostname: '127\.0\.0\.1'/);
assert.match(read('index.js'), /useMultiFileAuthState\(sessionDir\)/);
assert.doesNotMatch(read('index.js'), /forwardedNewsletterMessageInfo/);
assert.match(read('index.js'), /supportGroupLink/);
assert.match(read('lib/messageConfig.js'), /https:\/\/chat\.whatsapp\.com\/EzyVODEyTNiECpAAYgawXR/);
assert.match(read('commands/help.js'), /Join our WhatsApp group for updates/);
assert.match(read('commands/alive.js'), /supportGroupLink/);
assert.match(read('main.js'), /Join our WhatsApp group/);
assert.doesNotMatch(read('commands/help.js'), /Join our channel for updates/i);
for (const file of allJS(base)) {
  if (file === __filename) continue;
  assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /forwardedNewsletterMessageInfo|120363161513685998@newsletter/, 'Stale newsletter promo: ' + file);
}
assert.match(read('index.js'), /terminalQR\.generate\(qr, \{ small: true \}\)/);
assert.match(read('index.js'), /printQRInTerminal: false/);
assert.doesNotMatch(read('commands/pair.js'), /knight-bot-paircode\.onrender\.com/);
assert.doesNotMatch(read('commands/chatbot.js'), /zellapi\.autos/);
assert.doesNotMatch(read('lib/api.js'), /\/api\/ai\/(chat|gpt)/);
assert.doesNotMatch(read('commands/update.js'), /reset --hard|downloadFile\(/);
assert.doesNotMatch(read('commands/antidelete.js'), /sendMessage\(owner/);
assert.doesNotMatch(read('commands/savestatus.js'), /saveStatusContent\(sock, dest, msg\.message/);

// A regression guard: the named media downloader sources match original main branch Git blobs.
const downloaders = {
  'commands/facebook.js': 'bff23c559ffb77c6dff7ad96d913280aa563ec5c',
  'commands/instagram.js': 'a343bbd2225b7ef898ee6c8e936680f5455d0e23',
  'commands/igs.js': 'de6d1093eab231273bfc4b964e623a99f0b7f840',
  'commands/play.js': 'e9a9964a6a3e854b1ce66c149de889f24a1ec441',
  'commands/song.js': '5f4982bf76f79403525217e57490b1c98b41060a',
  'commands/tiktok.js': 'c397d28a0b660d45cf73fc65e6031da96d961783',
  'commands/twitter.js': '6178e1c6ce1bf8a2ce567156c7f82e9ce97b5a20',
  'commands/spotify.js': '8a741c92631599dbc6bf9296787f8cdd3a017ba7',
  'commands/video.js': '51cbed0bf997e4a4f7252b65d4cdea3cef865a39',
  'lib/ytdl2.js': 'a34e48f86f1ce442a9067cf01477f32ba487e143',
  'lib/waVideo.js': 'cbff093ce841044caf90aebf6a2aa63c82ebb791'
};
for (const [file, expected] of Object.entries(downloaders)) {
  const bytes = fs.readFileSync(path.join(base, file));
  const header = Buffer.from('blob ' + bytes.length + '\0');
  const sha = crypto.createHash('sha1').update(header).update(bytes).digest('hex');
  assert.strictEqual(sha, expected, 'Downloader implementation changed: ' + file);
}
console.log('Security smoke checks passed; downloader implementations unchanged.');
