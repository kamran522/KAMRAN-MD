'use strict';
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const run = promisify(execFile);

// Offline voice synthesis using Ubuntu's espeak-ng. No cloud TTS requests.
async function ttsCommand(sock, chatId, text, message) {
  const input = String(text || '').trim().slice(0, 350);
  if (!input) return sock.sendMessage(chatId, { text: 'Usage: .tts <text>' }, { quoted: message });
  let dir;
  try {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kamran-tts-'));
    const textFile = path.join(dir, 'message.txt');
    const wav = path.join(dir, 'speech.wav');
    const ogg = path.join(dir, 'speech.ogg');
    await fs.writeFile(textFile, input, { mode: 0o600 });
    await run('espeak-ng', ['-f', textFile, '-w', wav, '-s', '145'], { timeout: 20000, maxBuffer: 100000 });
    await run('ffmpeg', ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav,
      '-c:a', 'libopus', '-b:a', '32k', ogg], { timeout: 20000, maxBuffer: 100000 });
    await sock.sendMessage(chatId, {
      audio: await fs.readFile(ogg), mimetype: 'audio/ogg; codecs=opus', ptt: true
    }, { quoted: message });
  } catch (error) {
    console.error('[local tts]', error.message);
    const hint = error.code === 'ENOENT'
      ? 'Offline TTS needs espeak-ng and ffmpeg. Install: sudo apt-get install -y espeak-ng ffmpeg'
      : 'Local text-to-speech failed. Check PM2 logs and ensure espeak-ng and ffmpeg are installed.';
    await sock.sendMessage(chatId, { text: hint }, { quoted: message });
  } finally { if (dir) await fs.rm(dir, { recursive: true, force: true }).catch(() => {}); }
}
module.exports = ttsCommand;
