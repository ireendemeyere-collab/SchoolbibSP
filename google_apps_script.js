/**
 * Google Apps Script voor SchoolbibSP (Schoolbibliotheek Don Bosco Gent campus Sint-Pieters)
 * 
 * INSTRUCTIES VOOR EENMALIGE INSTELLING:
 * 1. Open je Google Spreadsheet (SchoolbibSP) in je browser.
 * 2. Klik in het bovenmenu op: Extensies > Apps Script.
 * 3. Wis eventuele bestaande code in het venster en plak deze volledige code erin.
 * 4. Klik op 'Opslaan' (het diskette-icoontje bovenaan).
 * 5. Klik rechtsboven op de blauwe knop: 'Implementeren' (Deploy) > 'Nieuwe implementatie' (New deployment).
 * 6. Klik op het tandwieltje naast 'Type selecteren' en kies: 'Web-app'.
 * 7. Vul in:
 *    - Beschrijving: Schoolbib Web API
 *    - Uitvoeren als: 'Ik' (je eigen e-mailadres)
 *    - Wie heeft toegang: 'Iedereen' (Anyone)  <-- BELANGRIJK!
 * 8. Klik op 'Implementeren' en geef Google eenmalig toestemming (klik op Geavanceerd > Doorgaan).
 * 9. Kopieer de 'Web-app-URL' (begint met https://script.google.com/macros/s/...) en plak deze in de website onder Beheer!
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
      }
      reviewsSheet.appendRow([
        new Date(),
        data.titel ? data.titel.toString().trim() : '',
        data.rating ? Number(data.rating) : ''
      ]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', message: 'Beoordeling opgeslagen!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Actie 2: Nieuw boek toevoegen aan de catalogus
    var sheet = ss.getActiveSheet();
    sheet.appendRow([
      data.titel ? data.titel.toString().trim() : '',
      data.auteur ? data.auteur.toString().trim() : '',
      data.tags ? data.tags.toString().trim() : '',
      data.graad ? data.graad.toString().trim() : '',
      data.locatie ? data.locatie.toString().trim() : '',
      data.isbn ? data.isbn.toString().trim() : ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Boek succesvol toegevoegd!' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'active', message: 'Schoolbib API is actief!' }))
    .setMimeType(ContentService.MimeType.JSON);
}
