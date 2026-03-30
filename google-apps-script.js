/**
 * GymTracker — Google Apps Script Backend
 *
 * SETUP:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this entire file into the editor (replace any existing code)
 * 3. Click "Deploy" > "New deployment"
 * 4. Choose "Web app" as the type
 * 5. Set "Execute as" to "Me" and "Who has access" to "Anyone"
 * 6. Click "Deploy" and copy the URL
 * 7. Paste that URL into the gym tracker app's settings
 */

const CONFIG_SHEET = 'Config';
const LOGS_SHEET = 'Logs';

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === LOGS_SHEET) {
      sheet.getRange('A1:F1').setValues([['timestamp', 'dayId', 'exerciseId', 'exerciseName', 'weight', 'reps']]);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function getConfig() {
  const sheet = getOrCreateSheet(CONFIG_SHEET);
  const val = sheet.getRange('A1').getValue();
  if (!val) return null;
  try { return JSON.parse(val); } catch { return null; }
}

function saveConfig(config) {
  const sheet = getOrCreateSheet(CONFIG_SHEET);
  sheet.getRange('A1').setValue(JSON.stringify(config));
}

function getLogs() {
  const sheet = getOrCreateSheet(LOGS_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  return data.map(row => ({
    timestamp: row[0] instanceof Date ? row[0].toISOString() : row[0],
    dayId: row[1],
    exerciseId: row[2],
    exerciseName: row[3],
    weight: row[4],
    reps: row[5]
  }));
}

function addLog(entry) {
  const sheet = getOrCreateSheet(LOGS_SHEET);
  sheet.appendRow([
    new Date().toISOString(),
    entry.dayId,
    entry.exerciseId,
    entry.exerciseName,
    entry.weight,
    entry.reps
  ]);
}

function deleteLog(timestamp) {
  const sheet = getOrCreateSheet(LOGS_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    const val = data[i][0] instanceof Date ? data[i][0].toISOString() : data[i][0];
    if (val === timestamp) {
      sheet.deleteRow(i + 2);
      return;
    }
  }
}

function renameExerciseLogs(exerciseId, newName) {
  const sheet = getOrCreateSheet(LOGS_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][2] === exerciseId) {
      sheet.getRange(i + 2, 4).setValue(newName);
    }
  }
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getData';
  let result;

  if (action === 'getData') {
    result = {
      config: getConfig(),
      logs: getLogs()
    };
  } else {
    result = { error: 'Unknown action' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const action = body.action;
  let result = { ok: true };

  if (action === 'saveConfig') {
    saveConfig(body.data);
  } else if (action === 'addLog') {
    addLog(body.data);
  } else if (action === 'deleteLog') {
    deleteLog(body.timestamp);
  } else if (action === 'renameExerciseLogs') {
    renameExerciseLogs(body.exerciseId, body.newName);
  } else {
    result = { error: 'Unknown action' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
