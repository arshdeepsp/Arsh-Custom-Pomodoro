# Timers — install as an Android app with background alarms

These files turn the timer into an installable PWA whose alarms fire even when
the phone is locked or the app is closed (Android/Chromium only).

## Files
- `Pomodoro.html` — the app
- `manifest.webmanifest` — install metadata
- `sw.js` — service worker (offline + handles alarm taps)
- `icon-192.png`, `icon-512.png` — app icons

All four (plus the icons) must sit in the **same folder** and be served over **https**.

## Host it (pick one)
- **GitHub Pages:** create a repo, upload these files, enable Pages on the branch.
  Visit `https://<you>.github.io/<repo>/Pomodoro.html`.
- **Netlify Drop:** drag the folder onto https://app.netlify.com/drop.
- **Local test:** `python3 -m http.server` then open `http://localhost:8000/Pomodoro.html`
  (localhost counts as a secure context; phone alarms need a real https host though).

## On your phone
1. Open the hosted `Pomodoro.html` in Chrome (Android).
2. Tap the screen once — it asks for **notification permission**. Allow it.
3. Chrome menu → **Add to Home screen / Install**.
4. Launch it from the home-screen icon.

## How the alarm behaves
- **App open & in front:** your custom laser plays (exact timing).
- **App backgrounded / screen off / app closed:** a system notification with
  sound + vibration fires at the timer/step end. Tap it to jump back in.
- Background alarms are scheduled only while you're away and cleared when you return,
  so you never get a duplicate buzz while looking at the screen.

## Notes / limits
- Works on Chrome, Edge, Samsung Internet (Android). iOS Safari and Firefox don't
  support scheduled triggers — there it falls back to the in-app sound only.
- The background sound is the Android notification sound (set per-app in system
  settings), not the laser. To make it loud, give the app/site its own notification
  sound and turn off Do Not Disturb.
- If alarms are ever late, disable battery optimization for Chrome / the installed app.
