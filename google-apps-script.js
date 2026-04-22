/**
 * FORGE — Google Apps Script Backend
 *
 * SETUP:
 * 1. Open your existing Google Sheet (or create a new one)
 * 2. Go to Extensions > Apps Script
 * 3. Replace any existing code with this entire file
 * 4. Click "Deploy" > "Manage deployments" (for an existing deployment)
 *    or "Deploy" > "New deployment" for a fresh one
 * 5. For an existing deployment, edit it and click "Deploy" again to
 *    publish the new version (URL stays the same)
 * 6. For a new deployment: choose "Web app", Execute as "Me",
 *    Who has access "Anyone". Copy the URL into the app.
 *
 * The Logs sheet now uses 8 columns (timestamp, dayId, exerciseId,
 * exerciseName, weight, reps, setIndex, rpe). Old rows with only 6
 * columns continue to read correctly.
 *
 * A new Measurements sheet is auto-created on first measurement.
 */

const CONFIG_SHEET = 'Config';
const LOGS_SHEET = 'Logs';
const MEAS_SHEET = 'Measurements';

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === LOGS_SHEET) {
      sheet.getRange('A1:H1').setValues([['timestamp', 'dayId', 'exerciseId', 'exerciseName', 'weight', 'reps', 'setIndex', 'rpe']]);
      sheet.setFrozenRows(1);
    } else if (name === MEAS_SHEET) {
      sheet.getRange('A1:D1').setValues([['timestamp', 'type', 'value', 'unit']]);
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
  // Read up to 8 columns (timestamp, dayId, exerciseId, exerciseName, weight, reps, setIndex, rpe)
  // Old rows with only 6 columns will return empty strings for the extra fields.
  const lastCol = Math.max(6, sheet.getLastColumn());
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return data.map(row => {
    const entry = {
      timestamp: row[0] instanceof Date ? row[0].toISOString() : row[0],
      dayId: row[1],
      exerciseId: row[2],
      exerciseName: row[3],
      weight: row[4],
      reps: row[5]
    };
    if (row[6] !== '' && row[6] != null) entry.setIndex = row[6];
    if (row[7] !== '' && row[7] != null) entry.rpe = row[7];
    return entry;
  });
}

function addLog(entry) {
  const sheet = getOrCreateSheet(LOGS_SHEET);
  sheet.appendRow([
    new Date().toISOString(),
    entry.dayId,
    entry.exerciseId,
    entry.exerciseName,
    entry.weight,
    entry.reps,
    entry.setIndex == null ? '' : entry.setIndex,
    entry.rpe == null ? '' : entry.rpe
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
  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][2] === exerciseId) {
      sheet.getRange(i + 2, 4).setValue(newName);
    }
  }
}

function getMeasurements() {
  const sheet = getOrCreateSheet(MEAS_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  return data.map(row => ({
    timestamp: row[0] instanceof Date ? row[0].toISOString() : row[0],
    type: row[1],
    value: row[2],
    unit: row[3]
  }));
}

function addMeasurement(entry) {
  const sheet = getOrCreateSheet(MEAS_SHEET);
  sheet.appendRow([
    new Date().toISOString(),
    entry.type,
    entry.value,
    entry.unit || ''
  ]);
}

function deleteMeasurement(timestamp) {
  const sheet = getOrCreateSheet(MEAS_SHEET);
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

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getData';
  let result;

  if (action === 'getData') {
    result = {
      config: getConfig(),
      logs: getLogs(),
      measurements: getMeasurements()
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

  switch (action) {
    case 'saveConfig': saveConfig(body.data); break;
    case 'addLog': addLog(body.data); break;
    case 'deleteLog': deleteLog(body.timestamp); break;
    case 'renameExerciseLogs': renameExerciseLogs(body.exerciseId, body.newName); break;
    case 'addMeasurement': addMeasurement(body.data); break;
    case 'deleteMeasurement': deleteMeasurement(body.timestamp); break;
    default: result = { error: 'Unknown action' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
