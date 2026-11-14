# KAMRAN-MD — locally paired WhatsApp bot

**Configured bot owner:** Kamran Hasil (+923111008401)  
**Repository:** https://github.com/kamran522/KAMRAN-MD  
**Official WhatsApp group:** https://chat.whatsapp.com/EzyVODEyTNiECpAAYgawXR

This is an updated deployment of the Baileys-based WhatsApp bot. It stores WhatsApp authentication on **your server** instead of using an external pairing website. Text AI commands use **a local Ollama model** and do not require an AI API key. Existing media download handlers remain unchanged.

## Local deployment

Requirements: Node.js 18+, ffmpeg, enough RAM/disk for an Ollama model, and a server allowed to reach WhatsApp.

```sh
git clone https://github.com/kamran522/KAMRAN-MD.git
cd KAMRAN-MD
npm install --legacy-peer-deps
cp .env.example .env
npm test
# Install Ollama from its official instructions if not already installed:
# https://ollama.com/download
ollama pull qwen2.5:1.5b
# Ensure the Ollama service is running (ollama serve if not started by your OS).
npm start
```

The model weights must be downloaded once; subsequent AI inference runs on the same machine, through `127.0.0.1:11434`. Override the model with `OLLAMA_MODEL` and local port with `OLLAMA_PORT` in `.env`. Make sure Ollama is running: start `ollama serve` if your operating system has not started the service automatically. The selected model needs sufficient memory to load.

## QR and pairing code — hosted locally

The bot **prints a scannable QR code directly in the terminal when you run `npm start`**. Open WhatsApp **Linked devices** → **Link a device** on your phone and scan the QR shown in the server's SSH terminal. You do not need to open a browser or expose any port to scan it. The QR expires and will be refreshed while waiting for login. Keep terminal output private.

The optional local pairing page remains at `http://127.0.0.1:3000` on **the server itself**, showing the same WhatsApp QR code and a **Generate pairing code locally** button. If port 3000 is already occupied, the bot still prints the terminal QR; you can use `PAIRING_PORT=3001 npm start` to move the optional webpage to port 3001.

You can also run `node index.js --pairing-code` to request a pairing code in the same terminal instead of displaying a terminal QR.

When using a remote VPS, do **not** expose port 3000 to the internet. Instead, from your computer, use:

```sh
ssh -L 3000:127.0.0.1:3000 user@your-server
```

Then visit `http://127.0.0.1:3000` on your computer. The QR and pairing code are sensitive and are displayed only on this loopback interface. The account is still linked using WhatsApp's own servers; **local pairing does not make WhatsApp itself offline**.

Baileys stores its authentication keys in `./session` by default. Set `SESSION_DIR` to an absolute, persistent server path when deploying. The program requests restrictive permissions (0700 directory, 0077 umask). Never upload this directory, `creds.json`, or your `.env` file to GitHub or a third-party pairing site. Back up securely only if needed.

## Useful commands

| Command | Behavior |
| --- | --- |
| `.ai <question>`, `.gpt <question>`, `.gemini <question>` | Generate answers with local Ollama |
| `.chatbot on` / `.chatbot off` | Enable or disable the local-AI chatbot in a group |
| `.trt <text> <language>` | Translate through local Ollama |
| `.play <search>`, `.song <search>`, `.video <url>` | Existing YouTube/audio/video downloader functions |
| `.fb <url>`, `.instagram <url>`, `.igs <url>`, `.tiktok <url>` | Existing social-media downloader functions |
| `.twitter <url>`, `.spotify <search>` | Existing downloader functions |
| `.savestatus` (reply to a status) | Manually save a WhatsApp status |
| `.owner`, `.menu`, `.ping` | Owner contact, commands, connectivity |

Media download commands **continue to use the original external services**; they are not offline. Download success depends on those services and platform availability.

## Local textmaker images

Send `.hacker KAMI` to receive a hacker-style PNG image made directly on the bot server. Other effects such as `.matrix TEXT`, `.neon TEXT`, `.metallic TEXT`, `.ice TEXT`, `.blackpink TEXT`, and `.fire TEXT` work the same way. They use the existing `sharp` package; no image API key or cloud service is needed. Text is limited to 64 characters. These are locally generated alternatives rather than replicas of the previously used third-party templates.

Media download commands **continue to use the original external services**; they are not offline. Download success depends on those services and platform availability.

## Support group

Use the official WhatsApp group for bot help, updates, and support: https://chat.whatsapp.com/EzyVODEyTNiECpAAYgawXR

The bot's `.menu` / `.help` and `.alive` messages display this group invite. Old newsletter and channel promotion metadata was removed from outgoing replies; WhatsApp group invitations appear as normal clickable links, not as a "View channel" button.

## What changed for privacy

- External pairing-code service removed from the `.pair` command. Login is available on the local server only.
- `.ai`, `.gpt`, `.gemini`, chatbot responses and translation are routed to loopback Ollama; no third-party AI prompt forwarding.
- Automatic forwarding of deleted messages, view-once media and statuses disabled. **Manual** `.savestatus` stays available.
- Unsafe remote ZIP update / hard Git reset disabled. Deploy reviewed commits manually.
- Third-party content uploads, cloud TTS, screenshot rendering, image processing, image/video generation, image-card effects, and remote welcome/goodbye images remain disabled to avoid uploading text, profile pictures or media. Textmaker effects (including `.hacker`, `.neon`, `.matrix`, `.fire`, and the other listed text styles) are now generated locally with Sharp and SVG, without sending text to external services.
- Existing downloader implementations were not changed: YouTube/audio/video, Instagram, TikTok, Facebook, X/Twitter, Spotify, etc. Existing API credentials/settings for downloaders are retained.

**Network privacy boundary:** WhatsApp itself uses Meta's network. Media downloading requires connections to source platforms and the downloader services already present in this project; requested URLs, search text and sometimes media can be visible to those services. Do not treat the entire bot as offline or zero-egress. Review any optional non-downloader commands before enabling them.

## Verification

Run `npm test` for static syntax, key security invariants, and downloader source-preservation checks. These tests do **not** prove the program is free of all backdoors. Review dependencies and deployed processes separately; this repository currently has no tracked lockfile. The GitHub Actions security smoke checks passed for the reviewed branch. They check JavaScript syntax and source preservation but do not exercise live WhatsApp login or media downloading. No deployment or runtime WhatsApp pairing was performed by this change.

## Attribution and license

This repository contains earlier work credited to the original Knight Bot/Professor project and its contributors, as well as the Baileys maintainers. Historic copyright authorship is not reassigned by changing the current bot operator. Keep upstream license notices and check each upstream component's licensing terms when distributing a modified fork. The current package manifest lists `ISC`; some existing source headers refer to `MIT`, so verify license provenance before redistribution.
