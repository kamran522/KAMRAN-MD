# KAMRAN-MD — locally paired WhatsApp bot

**Configured bot owner:** Kamran Hasil (+923111008401)  
**Repository:** https://github.com/kamran522/KAMRAN-MD

This is an updated deployment of the Baileys-based WhatsApp bot. It stores WhatsApp authentication on **your server** instead of using an external pairing website. Text AI commands use **a local Ollama model** and do not require an AI API key. Existing media download handlers remain unchanged.

## Local deployment

Requirements: Node.js 18+, ffmpeg, enough RAM/disk for an Ollama model, and a server allowed to reach WhatsApp.

```sh
git clone https://github.com/kamran522/KAMRAN-MD.git
cd KAMRAN-MD
npm install --legacy-peer-deps
# Install Ollama from its official instructions if not already installed:
# https://ollama.com/download
ollama pull qwen2.5:1.5b
# Ensure the Ollama service is running (ollama serve if not started by your OS).
npm start
```

The model weights must be downloaded once; subsequent AI inference runs on the same machine, through `127.0.0.1:11434`. Override the model with `OLLAMA_MODEL` and local port with `OLLAMA_PORT`.

## QR and pairing code — hosted locally

The bot opens `http://127.0.0.1:3000` on **the server itself**, showing the WhatsApp QR code and a **Generate pairing code locally** button. Use WhatsApp **Linked devices** to pair the owner phone number. You can also run `node index.js --pairing-code` for terminal pairing.

When using a remote VPS, do **not** expose port 3000 to the internet. Instead, from your computer, use:

```sh
ssh -L 3000:127.0.0.1:3000 user@your-server
```

Then visit `http://127.0.0.1:3000` on your computer. The QR and pairing code are sensitive and are displayed only on this loopback interface. The account is still linked using WhatsApp's own servers; **local pairing does not make WhatsApp itself offline**.

Baileys stores its authentication keys in `./session` by default. Set `SESSION_DIR` to an absolute, persistent server path when deploying. The program requests restrictive permissions (0700 directory, 0077 umask). Never upload this directory, `creds.json`, or your `.env` file to GitHub or a third-party pairing site. Back up securely only if needed.

## What changed for privacy

- External pairing-code service removed from the `.pair` command. Login is available on the local server only.
- `.ai`, `.gpt`, `.gemini`, chatbot responses and translation are routed to loopback Ollama; no third-party AI prompt forwarding.
- Automatic forwarding of deleted messages, view-once media and statuses disabled. **Manual** `.savestatus` stays available.
- Unsafe remote ZIP update / hard Git reset disabled. Deploy reviewed commits manually.
- Third-party content uploads, cloud TTS, screenshot rendering, image processing, image/video generation, image-card/text effects, and remote welcome/goodbye images disabled instead of silently uploading text, profile pictures or media.
- Existing downloader implementations were not changed: YouTube/audio/video, Instagram, TikTok, Facebook, X/Twitter, Spotify, etc. Existing API credentials/settings for downloaders are retained.

**Network privacy boundary:** WhatsApp itself uses Meta's network. Media downloading requires connections to source platforms and the downloader services already present in this project; requested URLs, search text and sometimes media can be visible to those services. Do not treat the entire bot as offline or zero-egress. Review any optional non-downloader commands before enabling them.

## Verification

Run `npm test` for static syntax, key security invariants, and downloader source-preservation checks. These tests do **not** prove the program is free of all backdoors. Review dependencies and deployed processes separately; this repository currently has no tracked lockfile. No deployment or runtime WhatsApp pairing was performed by this change.

## Attribution and license

This repository contains earlier work credited to the original Knight Bot/Professor project and its contributors, as well as the Baileys maintainers. Historic copyright authorship is not reassigned by changing the current bot operator. Keep upstream license notices and check each upstream component's licensing terms when distributing a modified fork. The current package manifest lists `ISC`; some existing source headers refer to `MIT`, so verify license provenance before redistribution.
