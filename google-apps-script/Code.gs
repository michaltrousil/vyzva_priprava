/**
 * Výzva Příprava - Google Apps Script API
 *
 * Nastavení:
 * 1. Otevřete Google Sheets s atlety
 * 2. Rozšíření > Apps Script
 * 3. Vložte tento kód
 * 4. Nahraďte SPREADSHEET_ID skutečným ID vaší tabulky
 * 5. Nasaďte jako webovou aplikaci (Kdokoli má přístup)
 */

// === KONFIGURACE ===
const SPREADSHEET_ID = 'VLOŽTE_ID_VAŠÍ_TABULKY';
const SHEET_ATHLETES = 'Atleti';
const SHEET_ENTRIES = 'Priprava';

// === HLAVNÍ HANDLER ===

function doGet(e) {
  try {
    const action = e.parameter.action;
    const version = e.parameter.version;

    // Kontrola verze
    if (version !== 'priprava') {
      return createJsonResponse({ error: 'Neplatná verze API' });
    }

    switch (action) {
      case 'getAthletes':
        return createJsonResponse(getAthletes());
      case 'getLeaderboard':
        return createJsonResponse(getLeaderboard());
      case 'getEntry':
        return createJsonResponse(getEntry(e.parameter.athlete, e.parameter.date));
      case 'saveEntry':
        return createJsonResponse(saveEntry(e.parameter));
      case 'getDebug':
        return createJsonResponse(getDebug());
      default:
        return createJsonResponse({ error: 'Neznámá akce' });
    }
  } catch (error) {
    return createJsonResponse({ error: error.toString() });
  }
}

function doPost(e) {
  return doGet(e);
}

// === POMOCNÉ FUNKCE ===

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function formatDateString(value) {
  if (!value) return null;

  // Pokud je to Date objekt
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Pokud je to string
  const str = value.toString().trim();

  // Formát YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Formát DD.MM.YYYY
  const match = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (match) {
    const day = String(parseInt(match[1])).padStart(2, '0');
    const month = String(parseInt(match[2])).padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  return str;
}

// === API FUNKCE ===

/**
 * Vrátí seznam atletů
 */
function getAthletes() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ATHLETES);

  if (!sheet) {
    return { athletes: [], error: 'List Atleti nenalezen' };
  }

  const data = sheet.getDataRange().getValues();
  const athletes = [];

  // Přeskočit hlavičku
  for (let i = 1; i < data.length; i++) {
    const name = data[i][0]?.toString().trim();
    if (name) {
      athletes.push(name);
    }
  }

  return { athletes: athletes };
}

/**
 * Vrátí existující záznam pro atleta a datum
 */
function getEntry(athlete, date) {
  if (!athlete || !date) {
    return { entry: null };
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ENTRIES);

  if (!sheet) {
    return { entry: null };
  }

  const data = sheet.getDataRange().getValues();
  const targetDate = formatDateString(date);

  // Hledat záznam
  for (let i = 1; i < data.length; i++) {
    const rowDate = formatDateString(data[i][0]);
    const rowName = data[i][1]?.toString().trim();

    if (rowDate === targetDate && rowName === athlete) {
      return {
        entry: {
          date: rowDate,
          athlete: rowName,
          type: data[i][2],
          completed: data[i][3] === 'ANO',
          value: data[i][4],
          note: data[i][5],
          points: data[i][6]
        }
      };
    }
  }

  return { entry: null };
}

/**
 * Uloží nový záznam
 */
function saveEntry(params) {
  const athlete = params.athlete;
  const date = params.date;
  const type = params.type;
  const completed = params.completed === '1';
  const value = parseInt(params.value) || 0;
  const points = parseInt(params.points) || 0;
  const note = params.note || '';

  // Validace
  if (!athlete || !date || !type) {
    return { success: false, error: 'Chybí povinné údaje' };
  }

  // Validace data - pouze dnes nebo včera
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = formatDateString(date);
  const todayStr = formatDateString(today);
  const yesterdayStr = formatDateString(yesterday);

  if (targetDate !== todayStr && targetDate !== yesterdayStr) {
    return { success: false, error: 'Lze zadat pouze za dnešek nebo včerejšek' };
  }

  // Kontrola duplicity
  const existing = getEntry(athlete, date);
  if (existing.entry) {
    return { success: false, error: 'Pro tento den již existuje záznam' };
  }

  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_ENTRIES);

  // Vytvořit list pokud neexistuje
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ENTRIES);
    sheet.appendRow(['Datum', 'Jméno', 'Typ cviku', 'Splněno', 'Hodnota', 'Poznámka', 'Body', 'Čas zápisu']);
  }

  // Přidat záznam
  const timestamp = new Date();
  sheet.appendRow([
    targetDate,
    athlete,
    type,
    completed ? 'ANO' : 'NE',
    value,
    note,
    points,
    timestamp
  ]);

  return { success: true, points: points };
}

/**
 * Vrátí žebříček
 */
function getLeaderboard() {
  const ss = getSpreadsheet();
  const athletesSheet = ss.getSheetByName(SHEET_ATHLETES);
  const entriesSheet = ss.getSheetByName(SHEET_ENTRIES);

  // Inicializovat všechny atlety
  const athletes = {};

  if (athletesSheet) {
    const athletesData = athletesSheet.getDataRange().getValues();

    for (let i = 1; i < athletesData.length; i++) {
      const name = athletesData[i][0]?.toString().trim();
      if (name) {
        athletes[name] = {
          name: name,
          totalPoints: 0,
          completedDays: 0,
          days: {}
        };
      }
    }
  }

  // Načíst záznamy
  if (entriesSheet) {
    const data = entriesSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const date = formatDateString(data[i][0]);
      const name = data[i][1]?.toString().trim();
      const completed = data[i][3] === 'ANO';
      const points = parseInt(data[i][6]) || 0;

      if (name && athletes[name] && completed) {
        athletes[name].totalPoints += points;
        athletes[name].days[date] = true;
      }
    }
  }

  // Spočítat aktivní dny a sestavit žebříček
  const leaderboard = Object.values(athletes).map(a => ({
    name: a.name,
    totalPoints: a.totalPoints,
    completedDays: Object.keys(a.days).length
  }));

  // Seřadit podle bodů
  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

  return { leaderboard: leaderboard };
}

/**
 * Debug informace
 */
function getDebug() {
  const ss = getSpreadsheet();

  const athletesSheet = ss.getSheetByName(SHEET_ATHLETES);
  const entriesSheet = ss.getSheetByName(SHEET_ENTRIES);

  return {
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetName: ss.getName(),
    sheets: {
      athletes: athletesSheet ? {
        name: SHEET_ATHLETES,
        rows: athletesSheet.getLastRow()
      } : null,
      entries: entriesSheet ? {
        name: SHEET_ENTRIES,
        rows: entriesSheet.getLastRow()
      } : null
    },
    timestamp: new Date().toISOString()
  };
}

// === ZÁLOHA ===

/**
 * Vytvoří zálohu a odešle emailem
 */
function createBackup() {
  const ss = getSpreadsheet();
  const email = Session.getActiveUser().getEmail();

  // Export listů
  const athletesSheet = ss.getSheetByName(SHEET_ATHLETES);
  const entriesSheet = ss.getSheetByName(SHEET_ENTRIES);

  const attachments = [];
  const dateStr = Utilities.formatDate(new Date(), 'Europe/Prague', 'yyyy-MM-dd');

  if (athletesSheet) {
    const csv = sheetToCsv(athletesSheet);
    attachments.push(Utilities.newBlob(csv, 'text/csv', `atleti_${dateStr}.csv`));
  }

  if (entriesSheet) {
    const csv = sheetToCsv(entriesSheet);
    attachments.push(Utilities.newBlob(csv, 'text/csv', `priprava_${dateStr}.csv`));
  }

  // Statistiky
  const stats = getBackupStats();

  const body = `Záloha Výzvy Příprava ze dne ${dateStr}

Statistiky:
- Atletů: ${stats.totalAthletes}
- Záznamů: ${stats.totalEntries}
- Celkem bodů: ${stats.totalPoints}

V příloze najdete CSV soubory s daty.`;

  MailApp.sendEmail({
    to: email,
    subject: `[Výzva Příprava] Záloha ${dateStr}`,
    body: body,
    attachments: attachments
  });

  return { success: true, sentTo: email };
}

function sheetToCsv(sheet) {
  const data = sheet.getDataRange().getValues();
  return data.map(row =>
    row.map(cell => {
      const str = cell.toString();
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',')
  ).join('\n');
}

function getBackupStats() {
  const ss = getSpreadsheet();
  const athletesSheet = ss.getSheetByName(SHEET_ATHLETES);
  const entriesSheet = ss.getSheetByName(SHEET_ENTRIES);

  let totalAthletes = 0;
  let totalEntries = 0;
  let totalPoints = 0;

  if (athletesSheet) {
    totalAthletes = Math.max(0, athletesSheet.getLastRow() - 1);
  }

  if (entriesSheet) {
    const data = entriesSheet.getDataRange().getValues();
    totalEntries = Math.max(0, data.length - 1);

    for (let i = 1; i < data.length; i++) {
      totalPoints += parseInt(data[i][6]) || 0;
    }
  }

  return {
    totalAthletes: totalAthletes,
    totalEntries: totalEntries,
    totalPoints: totalPoints
  };
}

/**
 * Nastaví denní zálohu
 */
function setupBackupTrigger() {
  // Smazat existující triggery
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'createBackup') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Vytvořit nový trigger - každý den v 6:00
  ScriptApp.newTrigger('createBackup')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .create();

  return { success: true, message: 'Denní záloha nastavena na 6:00' };
}
