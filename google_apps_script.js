/**
 * Google Apps Script voor SchoolbibSP (Schoolbibliotheek Don Bosco Gent campus Sint-Pieters)
 * 
 * INSTRUCTIES VOOR EENMALIGE INSTELLING / UPDATE:
 * 1. Open je Google Spreadsheet (SchoolbibSP) in je browser.
 * 2. Klik in het bovenmenu op: Extensies > Apps Script.
 * 3. Wis eventuele bestaande code in het venster en plak deze volledige bijgewerkte code erin.
 * 4. Klik op 'Opslaan' (het diskette-icoontje bovenaan).
 * 5. Klik rechtsboven op de blauwe knop: 'Implementeren' (Deploy) > 'Beheer implementaties' (Manage deployments).
 * 6. Klik op het potlood-icoontje (Bewerken), kies bij Versie: 'Nieuwe versie' en klik op 'Implementeren'.
 *    (Of maak bij een eerste keer: 'Nieuwe implementatie' > Type: 'Web-app' > Toegang: 'Iedereen').
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wacht maximaal 15 seconden om conflicten bij gelijktijdige invoer te voorkomen
  lock.tryLock(15000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    
    // Actie 1: Sterrenbeoordeling van leerling opslaan
    if (data.action === 'rate') {
      var reviewsSheet = ss.getSheetByName("Beoordelingen");
      if (!reviewsSheet) {
        reviewsSheet = ss.insertSheet("Beoordelingen");
        reviewsSheet.appendRow(["Tijdstip", "Titel", "Sterren (1-5)"]);
        reviewsSheet.setFrozenRows(1);
      }
      reviewsSheet.appendRow([
        new Date(),
        data.titel ? data.titel.toString().trim() : '',
        data.rating ? Number(data.rating) : ''
      ]);
      
      return createJsonResponse({ status: 'success', message: 'Beoordeling opgeslagen!' });
    }
    
    // Actie 2: Nieuwe uitlening registreren in centrale spreadsheet
    if (data.action === 'save_loan') {
      var loansSheet = getOrCreateLoansSheet(ss);
      loansSheet.appendRow([
        data.id ? data.id.toString() : new Date().getTime().toString(),
        new Date(),
        data.student ? data.student.toString().trim() : '',
        data.klas ? data.klas.toString().trim() : '',
        data.bookTitle ? data.bookTitle.toString().trim() : '',
        data.copyLabel ? data.copyLabel.toString().trim() : 'Exemplaar 1',
        data.copyLoc ? data.copyLoc.toString().trim() : '',
        data.loanDate || new Date().toISOString().split('T')[0],
        data.dueDate || '',
        data.returned ? 'Ingeleverd' : 'Uitgeleend',
        data.returnDate || ''
      ]);
      
      return createJsonResponse({ status: 'success', message: 'Uitlening succesvol opgeslagen in Google Sheet!' });
    }

    // Actie 3: Boek markeren als ingeleverd in centrale spreadsheet
    if (data.action === 'return_loan') {
      var loansSheet = getOrCreateLoansSheet(ss);
      var rows = loansSheet.getDataRange().getValues();
      var found = false;
      var targetId = data.id ? data.id.toString() : '';
      var retDate = data.returnDate || new Date().toISOString().split('T')[0];

      for (var r = 1; r < rows.length; r++) {
        if (rows[r][0] && rows[r][0].toString() === targetId) {
          loansSheet.getRange(r + 1, 10).setValue('Ingeleverd'); // Kolom 10 = Status
          loansSheet.getRange(r + 1, 11).setValue(retDate);     // Kolom 11 = Werkelijke inleverdatum
          found = true;
          break;
        }
      }

      return createJsonResponse({ 
        status: 'success', 
        found: found, 
        message: found ? 'Boek succesvol gemarkeerd als ingeleverd!' : 'Uitlening niet gevonden in sheet.' 
      });
    }

    // Actie 4: Uitlening verwijderen uit historiek
    if (data.action === 'delete_loan') {
      var loansSheet = getOrCreateLoansSheet(ss);
      var rows = loansSheet.getDataRange().getValues();
      var targetId = data.id ? data.id.toString() : '';

      for (var r = 1; r < rows.length; r++) {
        if (rows[r][0] && rows[r][0].toString() === targetId) {
          loansSheet.deleteRow(r + 1);
          break;
        }
      }

      return createJsonResponse({ status: 'success', message: 'Uitlening verwijderd uit Google Sheet.' });
    }

    // Actie 5: Centrale instelling opslaan (PIN, uitleentermijn, klassen)
    if (data.action === 'save_setting') {
      var settingsSheet = getOrCreateSettingsSheet(ss);
      var sRows = settingsSheet.getDataRange().getValues();
      var key = data.key ? data.key.toString().trim() : '';
      var val = data.value !== undefined ? data.value.toString() : '';
      var updated = false;

      for (var sr = 1; sr < sRows.length; sr++) {
        if (sRows[sr][0] && sRows[sr][0].toString() === key) {
          settingsSheet.getRange(sr + 1, 2).setValue(val);
          settingsSheet.getRange(sr + 1, 3).setValue(new Date());
          updated = true;
          break;
        }
      }
      if (!updated && key) {
        settingsSheet.appendRow([key, val, new Date()]);
      }
      return createJsonResponse({ status: 'success', message: 'Instelling opgeslagen in Google Sheet' });
    }

    // Actie 6: Nieuw boek / exemplaren toevoegen aan de catalogus
    var sheet = ss.getActiveSheet();
    var count = data.aantal ? Math.max(1, parseInt(data.aantal, 10)) : 1;
    
    // Kolomvolgorde conform Google Sheet catalogus:
    // 1: Titel | 2: Auteur | 3: Tags | 4: Locatie | 5: Goodreads Link | 6: Graad | 7: ISBN | 8: Link coverafbeelding
    for (var i = 0; i < count; i++) {
      sheet.appendRow([
        data.titel ? data.titel.toString().trim() : '',
        data.auteur ? data.auteur.toString().trim() : '',
        data.tags ? data.tags.toString().trim() : '',
        data.locatie ? data.locatie.toString().trim() : '',
        data.goodreads ? data.goodreads.toString().trim() : '',
        data.graad ? data.graad.toString().trim() : '',
        data.isbn ? data.isbn.toString().trim() : '',
        data.cover ? data.cover.toString().trim() : ''
      ]);
    }
    
    var successMessage = count > 1 
      ? count + ' exemplaren succesvol toegevoegd aan de Google Sheet!' 
      : 'Boek succesvol toegevoegd!';
      
    return createJsonResponse({ status: 'success', message: successMessage });
      
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

  // Actie: Uitleningen, instellingen en beoordelingen ophalen voor de website
  if (action === 'get_loans' || action === 'get_all_data') {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var loansSheet = ss.getSheetByName("Uitleningen");
      var loans = [];
      if (loansSheet) {
        var data = loansSheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var row = data[i];
          if (!row[0] && !row[4]) continue; // Sla lege rijen over
          
          loans.push({
            id: row[0] ? row[0].toString() : '',
            createdAt: row[1] ? row[1].toString() : '',
            student: row[2] ? row[2].toString() : '',
            klas: row[3] ? row[3].toString() : '',
            bookTitle: row[4] ? row[4].toString() : '',
            copyLabel: row[5] ? row[5].toString() : 'Exemplaar 1',
            copyLoc: row[6] ? row[6].toString() : '',
            loanDate: formatCellDate(row[7]),
            dueDate: formatCellDate(row[8]),
            returned: (row[9] && row[9].toString().toLowerCase() === 'ingeleverd'),
            returnDate: formatCellDate(row[10])
          });
        }
      }

      // Instellingen ophalen
      var settings = {};
      var settingsSheet = ss.getSheetByName("Instellingen");
      if (settingsSheet) {
        var sData = settingsSheet.getDataRange().getValues();
        for (var s = 1; s < sData.length; s++) {
          var k = sData[s][0] ? sData[s][0].toString().trim() : '';
          if (k) {
            settings[k] = sData[s][1] ? sData[s][1].toString() : '';
          }
        }
      }

      // Beoordelingen ophalen
      var ratings = {};
      var reviewsSheet = ss.getSheetByName("Beoordelingen");
      if (reviewsSheet) {
        var rData = reviewsSheet.getDataRange().getValues();
        for (var r = 1; r < rData.length; r++) {
          var t = rData[r][1] ? rData[r][1].toString().trim() : '';
          var stars = rData[r][2] ? Number(rData[r][2]) : 0;
          if (t && stars > 0) {
            if (!ratings[t]) ratings[t] = { count: 0, total: 0, avg: 0 };
            ratings[t].count += 1;
            ratings[t].total += stars;
            ratings[t].avg = Math.round((ratings[t].total / ratings[t].count) * 10) / 10;
          }
        }
      }

      return createJsonResponse({ 
        status: 'success', 
        loans: loans, 
        settings: settings, 
        ratings: ratings 
      });
    } catch (err) {
      return createJsonResponse({ status: 'error', message: err.toString(), loans: [], settings: {}, ratings: {} });
    }
  }

  return createJsonResponse({ status: 'active', message: 'Schoolbib API is actief!' });
}

function getOrCreateLoansSheet(ss) {
  var sheet = ss.getSheetByName("Uitleningen");
  if (!sheet) {
    sheet = ss.insertSheet("Uitleningen");
    sheet.appendRow([
      "ID", "Tijdstip", "Leerling", "Klas", "Boektitel", "Exemplaar", "Locatie", "Uitleendatum", "Inleverdatum", "Status", "Werkelijke Inleverdatum"
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateSettingsSheet(ss) {
  var sheet = ss.getSheetByName("Instellingen");
  if (!sheet) {
    sheet = ss.insertSheet("Instellingen");
    sheet.appendRow(["Instelling", "Waarde", "Laatst Bijgewerkt"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatCellDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = String(val.getMonth() + 1).padStart(2, '0');
    var d = String(val.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return val.toString().trim();
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
