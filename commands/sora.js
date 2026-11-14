'use strict';
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { sharp, card, sendFailure } = require('../lib/local-media');
const run = promisify(execFile);

async function soraCommand(sock, chatId, message) {
  const raw = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
  const prompt = raw.replace(/^\.sora\s*/i, '').trim();
  if (!prompt) return sock.sendMessage(chatId, { text: 'Usage: .sora <text>. This creates a short animated text card, not generative AI video.' }, { quoted: message });
  if ([...prompt].length > 120) return sock.sendMessage(chatId, { text: 'Please use 120 characters or fewer.' }, { quoted: message });
  let dir;
  try {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kamran-sora-'));
    const source = path.join(dir, 'card.png');
    const output = path.join(dir, 'card.mp4');
    await fs.writeFile(source, await sharp(card(prompt, 'KAMRAN-MD · LOCAL ANIMATED CARD')).png().toBuffer());
    await run('ffmpeg', [
      '-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-loop', '1',
      '-framerate', '12', '-i', source, '-t', '3',
      '-vf', "zoompan=z='min(zoom+0.002,1.20)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=960x540:fps=12,format=yuv420p",
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '33', '-movflags', '+faststart', output
    ], { timeout: 30000, maxBuffer: 256000 });
    await sock.sendMessage(chatId, {
      video: await fs.readFile(output), mimetype: 'video/mp4',
      caption: 'Local animated text card (3 seconds). This is not AI-generated video.'
    }, { quoted: message });
  } catch (error) {
    await sendFailure(sock, chatId, message, error.code === 'ENOENT' ? new Error('Install FFmpeg on your server: sudo apt install ffmpeg') : error, 'sora');
  } finally { if (dir) await fs.rm(dir, { recursive: true, force: true }).catch(() => {}); }
}
module.exports = soraCommand;
