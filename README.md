# FORGE

A lightweight, no-fluff gym tracker that lives in the browser.

I built this app because I was annoyed with existing gym apps that are bloated with ads, random paywalls, social features (???), and the like. I just wanted something that could log my workouts, track progress, and that's it.

It's a single HTML file. No frameworks, no build steps, no accounts needed (except Google if you want to use Google Sheets to sync your data). Your data stays on your device (I don't want it man).

## Features

- **Workout days** - organise exercises into custom workout days (e.g. Upper A, Lower B)
- **Top-set or set-by-set logging** - log a single top set per exercise (default), or flip the per-exercise "Track each set" toggle to log weight, reps, and RPE for every set
- **Rest timer** - auto-starts after every logged set, with -15s / +15s / skip controls and a vibration alert when it hits zero
- **Personal records** - automatic PR tracking with date stamps
- **Progress charts** - estimated 1RM (Epley formula) trend line per exercise
- **Exercise history** - full log view with chart/table toggle
- **Body measurements** - track Weight, Body Fat, circumferences, or any custom measurement; see deltas vs the previous entry
- **Trends** - body weight trendline, weekly volume bar chart (last 8 weeks), top PRs across all lifts
- **Journal** - month-view calendar of completed sessions; tap a day to see what you did
- **Edit anything** - rename exercises, adjust sets/rep ranges, and all historical logs update to match
- **Light, dark, and system themes** - editorial design language with a serif headline + clean sans body
- **Units toggle** - kg or lb
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

## Navigation

The app has four tabs along the bottom:

- **Today** - pick a workout day and start logging
- **Journal** - month calendar of past sessions
- **Trends** - body weight, weekly volume, measurements, and top PRs
- **You** - sync, theme, units, rest timer, workout day management, install guide, data export/import

Workout sessions and per-exercise history are full-screen views (the tab bar hides while you're in them, so the rest timer can dock at the bottom).

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
11. In FORGE, go to **You > Connect** and paste the URL

Your workout config, logs, and measurements will now sync to your Google Sheet. The sheet is yours - you can view, query, or extend the data however you like.

> **Note:** If you update `google-apps-script.js` (e.g. after pulling new features), you'll need to create a **new deployment version** in Apps Script for changes to take effect. For an existing deployment, use **Deploy > Manage deployments > Edit (pencil) > Deploy** - the URL stays the same.

## Data Model

FORGE stores three things:

**Config** - your workout structure
```json
{
  "days": [
    {
      "id": "abc123",
      "name": "Upper A",
      "exercises": [
        { "id": "def456", "name": "Bench Press", "sets": 4, "repRange": "5-8", "trackEachSet": true }
      ]
    }
  ]
}
```

`trackEachSet` is optional. When `true`, the workout view renders one input row per configured set (with optional RPE). When omitted or `false`, you log a single top set per exercise.

**Logs** - individual set entries
```json
{
  "timestamp": "2026-04-22T10:30:00.000Z",
  "dayId": "abc123",
  "exerciseId": "def456",
  "exerciseName": "Bench Press",
  "weight": 87.5,
  "reps": 5,
  "setIndex": 0,
  "rpe": 7.5
}
```

`setIndex` and `rpe` are only present for set-by-set entries. Top-set entries omit them.

**Measurements** - body metrics over time
```json
{
  "timestamp": "2026-04-22T08:00:00.000Z",
  "type": "Weight",
  "value": 83.2,
  "unit": "kg"
}
```

You can export all data as JSON from **You > Export data** at any time.

## Tech Stack

- Vanilla HTML, CSS, JavaScript - single file, no dependencies
- [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) (headlines, numbers) + [Inter](https://fonts.google.com/specimen/Inter) (body, eyebrow labels)
- CSS custom properties for theming (system / light / dark)
- HTML5 Canvas for the per-exercise e1RM chart; SVG for trend lines and bars
- Google Apps Script for optional backend sync
