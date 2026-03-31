# FORGE

A lightweight, no-fluff gym tracker that lives in the browser.

I built this app because I was annoyed with existing gym apps that are bloated with ads, random paywalls, social features (???), and the like. I just wanted something that could log my workouts, track progress, and that's it.

It's a single HTML file. No frameworks, no build steps, no accounts needed (except Google if you want to use Google Sheets to sync your data). Your data stays on your device (I don't want it man).

## Features

- **Workout days** - organise exercises into custom workout days (e.g. Upper A, Lower B)
- **Set logging** - log weight and reps for each exercise with one tap
- **Personal records** - automatic PR tracking with date stamps
- **Progress charts** - estimated 1RM (Epley formula) trend line per exercise
- **Exercise history** - full log view with chart/table toggle
- **Edit anything** - rename exercises, adjust sets/rep ranges, and all historical logs update to match
- **Google Sheets sync** - optional cloud backup to your own Google Sheet (you own the data, always)
- **Export/Import** - full JSON data export and import
- **PWA** - install on your phone's home screen for a full-screen, app-like experience
- **Offline-first** - works without an internet connection; syncs when you're back online

## Getting Started

### Option 1: Use the hosted version

Visit **[suiyangqiu.github.io/forge-gym](https://suiyangqiu.github.io/forge-gym/)** and start tracking. That's it.

To install as an app on your phone:

**iPhone (Safari)**
1. Open the link above in **Safari**
2. Tap the **Share** button (square with upward arrow)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

**Android (Chrome)**
1. Open the link above in **Chrome**
2. Tap the **three-dot menu** in the top right
3. Tap **Add to Home Screen** (or **Install app**)
4. Tap **Add**

The app will appear on your home screen and run full-screen without browser chrome.

### Option 2: Self-host

1. Clone this repo (or just download `index.html`, `manifest.json`, and the icon files)
2. Serve the files with any static host - GitHub Pages, Netlify, a simple `python -m http.server`, anything
3. Open in a browser and you're good to go

No dependencies. No build step. No configuration.

## Google Sheets Sync (Optional)

By default, all data is stored locally in your browser's `localStorage`. If you want cloud backup or want to access your data across devices, you can connect a Google Sheet.

### Setup

1. Create a new **Google Sheet** (name it whatever you like)
2. Go to **Extensions > Apps Script**
3. Delete any existing code in the editor
4. Copy the contents of [`google-apps-script.js`](google-apps-script.js) from this repo and paste it in
5. Click **Deploy > New deployment**
6. Click the gear icon and select **Web app**
7. Set **Execute as** to **Me**
8. Set **Who has access** to **Anyone**
9. Click **Deploy** and authorise when prompted
10. Copy the **Web app URL**
11. In FORGE, go to **Setup > Google Sheets Sync > Connect** and paste the URL

Your workout config and logs will now sync to your Google Sheet. The sheet is yours - you can view, query, or extend the data however you like.

> **Note:** If you update `google-apps-script.js` (e.g. after pulling new features), you'll need to create a **new deployment version** in Apps Script for changes to take effect.

## Data Model

FORGE stores two things:

**Config** - your workout structure
```json
{
  "days": [
    {
      "id": "abc123",
      "name": "Upper A",
      "exercises": [
        { "id": "def456", "name": "Bench Press", "sets": 3, "repRange": "8-12" }
      ]
    }
  ]
}
```

**Logs** - individual set entries
```json
{
  "timestamp": "2026-03-29T10:30:00.000Z",
  "dayId": "abc123",
  "exerciseId": "def456",
  "exerciseName": "Bench Press",
  "weight": 80,
  "reps": 10
}
```

You can export all data as JSON from **Setup > Export data** at any time.

## Tech Stack

- Vanilla HTML, CSS, JavaScript - single file, no dependencies
- [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) + [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) fonts
- HTML5 Canvas for charts
- Google Apps Script for optional backend sync

## License

MIT
