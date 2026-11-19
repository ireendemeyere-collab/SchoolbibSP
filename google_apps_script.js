/**
 * Google Apps Script voor SchoolbibSP (Schoolbibliotheek Don Bosco Gent campus Sint-Pieters)
 * 
 * UPDATE:
 * 1. Automatische synchronisatie naar tabblad 'Boeken': bij een uitlening wordt kolom K ('Status')
 *    automatisch op 'Uitgeleend' gezet (wordt direct ROOD). Bij inleveren weer op 'Aanwezig'.
 * 2. Ondersteuning voor sam.steppe@dbsp.gent als beheerder + robuuste parsing van de 'Instellingen'-sheet
 *    (negeert enters, witruimtes en hoofdletters in e-maillijsten).
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = {};
    
    // Ondersteun zowel JSON POST als form-urlencoded POST
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var action = data.action || (e && e.parameter ? e.parameter.action : '');

    // ACTIE 1: E-MAIL VERIFICATIECODE AANVRAGEN (OTP)
    if (action === 'request_email_otp') {
      var email = (data.email || (e && e.parameter ? e.parameter.email : '')).toString().trim().toLowerCase();
      if (!email || email.indexOf('@') === -1) {
        return createJsonResponse({ status: 'error', message: 'Ongeldig e-mailadres.' });
      }

      var authInfo = getStaffRoleAndName(ss, email);
      if (!authInfo.allowed) {
        return createJsonResponse({ 
          status: 'forbidden', 
          message: 'Toegang geweigerd: Dit account staat niet geregistreerd in de personeelslijst van Don Bosco Gent. Leerlingen hebben geen toegang tot het beheer.' 
        });
      }

      var otp = Math.floor(100000 + Math.random() * 900000).toString();
      var props = PropertiesService.getScriptProperties();
      var otpData = {
        code: otp,
        email: email,
        role: authInfo.role,
        name: authInfo.name,
        expires: new Date().getTime() + (15 * 60 * 1000) // 15 minuten geldig
      };
      props.setProperty('OTP_' + email, JSON.stringify(otpData));

      // Verzend e-mail
      var subject = "Inlogcode Schoolbib Don Bosco Gent: " + otp;
      var body = "Beste " + authInfo.name + ",\n\n" +
                 "Je hebt een inlogcode aangevraagd voor de Schoolbibliotheek van Don Bosco Gent campus Sint-Pieters.\n\n" +
                 "Jouw 6-cijferige verificatiecode is: " + otp + "\n\n" +
                 "Deze code is 15 minuten geldig.\n\n" +
                 "Met vriendelijke groeten,\nSchoolbib DBSP";

      try {
        MailApp.sendEmail(email, subject, body);
      } catch (mailErr) {
        GmailApp.sendEmail(email, subject, body);
      }

      return createJsonResponse({ 
        status: 'success', 
        message: 'Een 6-cijferige inlogcode is verzonden naar ' + email + '. Controleer je inbox.' 
      });
    }

    // ACTIE 2: E-MAIL VERIFICATIECODE CONTROLEREN
    if (action === 'verify_email_otp') {
      var emailVerify = (data.email || '').toString().trim().toLowerCase();
      var inputCode = (data.code || '').toString().trim();
      var propsVerify = PropertiesService.getScriptProperties();
      var rawOtp = propsVerify.getProperty('OTP_' + emailVerify);

      if (!rawOtp) {
        return createJsonResponse({ status: 'error', message: 'Geen actieve code gevonden voor dit e-mailadres. Vraag een nieuwe code aan.' });
      }

      var storedOtp = JSON.parse(rawOtp);
      var now = new Date().getTime();

      if (now > storedOtp.expires) {
        propsVerify.deleteProperty('OTP_' + emailVerify);
        return createJsonResponse({ status: 'error', message: 'De verificatiecode is verlopen. Vraag een nieuwe code aan.' });
      }

      if (storedOtp.code !== inputCode) {
        return createJsonResponse({ status: 'error', message: 'Onjuiste code. Controleer de cijfers in je mail.' });
      }

      propsVerify.deleteProperty('OTP_' + emailVerify);
      var sessionToken = Utilities.getUuid();
      propsVerify.setProperty('SESSION_' + sessionToken, JSON.stringify({
        email: emailVerify,
        role: storedOtp.role,
        name: storedOtp.name,
        expires: now + (24 * 60 * 60 * 1000) // 24 uur geldig
      }));

      return createJsonResponse({
        status: 'success',
        sessionToken: sessionToken,
        role: storedOtp.role,
        user: { email: emailVerify, name: storedOtp.name, role: storedOtp.role }
      });
    }

    // ACTIE 3: UITLENING OPSLAAN + TABBLAD 'BOEKEN' AUTOMATISCH OP 'UITGELEEND' ZETTEN (ROOD)
    if (action === 'save_loan') {
      var loansSheet = getOrCreateLoansSheet(ss);
      var bookTitle = data.bookTitle ? data.bookTitle.toString().trim() : '';
      var copyLabel = data.copyLabel ? data.copyLabel.toString().trim() : 'Exemplaar 1';

      // 1. Voeg toe aan tabblad 'Uitleningen'
      loansSheet.appendRow([
        data.id ? data.id.toString() : new Date().getTime().toString(),
        new Date(),
        data.student ? data.student.toString().trim() : '',
        data.klas ? data.klas.toString().trim() : '',
        bookTitle,
        copyLabel,
        data.copyLoc ? data.copyLoc.toString().trim() : '',
        data.loanDate || new Date().toISOString().split('T')[0],
        data.dueDate || '',
        'Uitgeleend',
        ''
      ]);

      // 2. Pas automatisch de Status aan in het tabblad 'Boeken' -> kleurt direct ROOD!
      updateCatalogBookStatus(ss, bookTitle, copyLabel, 'Uitgeleend');

      return createJsonResponse({ 
        status: 'success', 
        message: 'Uitlening succesvol opgeslagen! Boek staat nu als Uitgeleend in de sheet.' 
      });
    }

    // ACTIE 4: BOEK INLEVEREN + TABBLAD 'BOEKEN' AUTOMATISCH TERUG OP 'AANWEZIG' ZETTEN
    if (action === 'return_loan') {
      var loansSheetRet = getOrCreateLoansSheet(ss);
      var rowsRet = loansSheetRet.getDataRange().getValues();
      var foundRet = false;
      var targetId = data.id ? data.id.toString() : '';
      var retDate = data.returnDate || new Date().toISOString().split('T')[0];
      var condition = data.condition ? data.condition.toString().trim() : 'Goed';
      var note = data.note ? data.note.toString().trim() : '';
      var conditionText = condition + (note ? ': ' + note : '');
      var statusText = condition !== 'Goed' ? 'Ingeleverd (' + conditionText + ')' : 'Ingeleverd';
      var returnedTitle = '';
      var returnedCopy = '';

      for (var r = 1; r < rowsRet.length; r++) {
        if (rowsRet[r][0] && rowsRet[r][0].toString() === targetId) {
          loansSheetRet.getRange(r + 1, 10).setValue(statusText);
          loansSheetRet.getRange(r + 1, 11).setValue(retDate);
          loansSheetRet.getRange(r + 1, 12).setValue(conditionText);
          returnedTitle = rowsRet[r][4] ? rowsRet[r][4].toString().trim() : '';
          returnedCopy = rowsRet[r][5] ? rowsRet[r][5].toString().trim() : '';
          foundRet = true;
          break;
        }
      }

      // Pas de status in het tabblad 'Boeken' weer aan naar 'Aanwezig'
      if (returnedTitle) {
        updateCatalogBookStatus(ss, returnedTitle, returnedCopy, 'Aanwezig');
      }

      return createJsonResponse({ 
        status: 'success', 
        found: foundRet, 
        message: 'Boek succesvol gemarkeerd als ingeleverd! Status in de sheet staat weer op Aanwezig.' 
      });
    }

    // ACTIE 5: UITLENING VERWIJDEREN
    if (action === 'delete_loan') {
      var loansSheetDel = getOrCreateLoansSheet(ss);
      var rowsDel = loansSheetDel.getDataRange().getValues();
      var targetIdDel = data.id ? data.id.toString() : '';
      var delTitle = '';
      var delCopy = '';

      for (var rd = 1; rd < rowsDel.length; rd++) {
        if (rowsDel[rd][0] && rowsDel[rd][0].toString() === targetIdDel) {
          delTitle = rowsDel[rd][4] ? rowsDel[rd][4].toString().trim() : '';
          delCopy = rowsDel[rd][5] ? rowsDel[rd][5].toString().trim() : '';
          loansSheetDel.deleteRow(rd + 1);
          break;
        }
      }

      if (delTitle) {
        updateCatalogBookStatus(ss, delTitle, delCopy, 'Aanwezig');
      }

      return createJsonResponse({ status: 'success', message: 'Uitlening verwijderd.' });
    }

    // ACTIE 6: INSTELLING OPSLAAN
    if (action === 'save_setting') {
      var settingsSheet = getOrCreateSettingsSheet(ss);
      var sRows = settingsSheet.getDataRange().getValues();
      var key = data.key ? data.key.toString().trim() : '';
      var val = data.value !== undefined ? data.value.toString() : '';
      var updated = false;

      for (var s = 1; s < sRows.length; s++) {
        if (sRows[s][0] && sRows[s][0].toString().trim() === key) {
          settingsSheet.getRange(s + 1, 2).setValue(val);
          settingsSheet.getRange(s + 1, 3).setValue(new Date());
          updated = true;
          break;
        }
      }

      if (!updated) {
        settingsSheet.appendRow([key, val, new Date()]);
      }

      return createJsonResponse({ status: 'success', message: 'Instelling succesvol opgeslagen!' });
    }

    // ACTIE 7: BEOORDELING OPSLAAN
    if (action === 'rate') {
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

    // ACTIE 8: BOEK TOEVOEGEN
    if (action === 'add_book') {
      var booksSheet = getBooksSheet(ss);
      if (!booksSheet) {
        return createJsonResponse({ status: 'error', message: 'Tabblad Boeken niet gevonden.' });
      }
      var count = data.count ? parseInt(data.count, 10) : 1;
      var startCopyNum = data.exemplaar ? parseInt(data.exemplaar, 10) : 1;
      
      for (var i = 0; i < count; i++) {
        booksSheet.appendRow([
          data.titel ? data.titel.toString().trim() : '',
          data.auteur ? data.auteur.toString().trim() : '',
          data.tags ? data.tags.toString().trim() : '',
          data.goodreads ? data.goodreads.toString().trim() : '',
          data.locatie ? data.locatie.toString().trim() : '',
          data.graad ? data.graad.toString().trim() : '',
          data.niveau ? data.niveau.toString().trim() : '',
          data.isbn ? data.isbn.toString().trim() : '',
          data.cover ? data.cover.toString().trim() : '',
          startCopyNum + i,
          'Aanwezig',
          ''
        ]);
      }
      return createJsonResponse({ status: 'success', message: 'Boek succesvol toegevoegd aan catalogus!' });
    }

    return createJsonResponse({ status: 'error', message: 'Onbekende actie: ' + action });

  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Actie 1: Publieke status (voor niet-ingelogde bezoekers op schoolbib.dbsp.gent)
  if (action === 'get_public_status') {
    var loansSheetPub = ss.getSheetByName("Uitleningen");
    var activeLoans = [];
    if (loansSheetPub) {
      var lData = loansSheetPub.getDataRange().getValues();
      for (var li = 1; li < lData.length; li++) {
        var rowL = lData[li];
        var isRet = (rowL[9] && rowL[9].toString().toLowerCase().indexOf('ingeleverd') !== -1);
        if (!isRet && rowL[4]) {
          activeLoans.push({
            bookTitle: rowL[4].toString().trim(),
            copyLabel: rowL[5] ? rowL[5].toString().trim() : 'Exemplaar 1'
          });
        }
      }
    }

    var featuredTheme = null;
    var settingsSheetPub = ss.getSheetByName("Instellingen");
    if (settingsSheetPub) {
      var stData = settingsSheetPub.getDataRange().getValues();
      for (var si = 1; si < stData.length; si++) {
        if (stData[si][0] && stData[si][0].toString().trim() === 'schoolbib_featured_theme') {
          try {
            featuredTheme = JSON.parse(stData[si][1]);
          } catch(err){}
        }
      }
    }

    return createJsonResponse({ status: 'success', activeLoans: activeLoans, featuredTheme: featuredTheme });
  }

  // Actie 2: Volledige data ophalen voor personeelsbalie
  if (action === 'get_all_data' || action === 'get_loans') {
    var loansSheet = ss.getSheetByName("Uitleningen");
    var loans = [];
    if (loansSheet) {
      var data = loansSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0] && !row[4]) continue;
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
          returned: (row[9] && row[9].toString().toLowerCase().indexOf('ingeleverd') !== -1),
          returnDate: formatCellDate(row[10]),
          condition: row[11] ? row[11].toString() : ''
        });
      }
    }

    var settings = {};
    var settingsSheet = ss.getSheetByName("Instellingen");
    if (settingsSheet) {
      var sData = settingsSheet.getDataRange().getValues();
      for (var s = 1; s < sData.length; s++) {
        var k = sData[s][0] ? sData[s][0].toString().trim() : '';
        if (k) settings[k] = sData[s][1] ? sData[s][1].toString() : '';
      }
    }

    return createJsonResponse({ status: 'success', loans: loans, settings: settings });
  }

  return createJsonResponse({ status: 'active', message: 'Schoolbib API is actief!' });
}

/**
 * Werkt direct kolom K ('Status') bij in het tabblad 'Boeken'.
 * 'Uitgeleend' activeert direct de rode voorwaardelijke opmaak in Google Sheets!
 */
function updateCatalogBookStatus(ss, bookTitle, copyLabel, newStatus) {
  if (!bookTitle) return;
  var booksSheet = getBooksSheet(ss);
  if (!booksSheet) return;

  var bData = booksSheet.getDataRange().getValues();
  var targetTitle = bookTitle.toLowerCase().trim();
  var targetNum = copyLabel ? copyLabel.toString().replace(/[^0-9]/g, '') : '';

  for (var r = 1; r < bData.length; r++) {
    var rowTitle = (bData[r][0] || '').toString().toLowerCase().trim();
    if (rowTitle === targetTitle) {
      var rowCopy = (bData[r][9] || '').toString().trim(); // Kolom J = Exemplaar
      var rowCopyNum = rowCopy.replace(/[^0-9]/g, '');

      // Als exemplaarnummer overeenkomt, of als er maar 1 exemplaar is
      if (!targetNum || !rowCopyNum || targetNum === rowCopyNum) {
        booksSheet.getRange(r + 1, 11).setValue(newStatus); // Kolom 11 (K) = Status
        break;
      }
    }
  }
}

/**
 * Controleert of een e-mailadres beheer- of balierechten heeft.
 * Ondersteunt:
 * 1. Standaard beheerders (Ireen De Meyere & Sam Steppe)
 * 2. Tabblad 'Instellingen' (schoolbib_admin_emails & schoolbib_teacher_emails)
 * 3. Tabblad 'Personeel' (Kolom A = email, Kolom B = rol)
 */
function getStaffRoleAndName(ss, email) {
  var cleanEmail = email.toLowerCase().trim();

  // 1. Ingebouwde hoofdbeheerders (altijd gegarandeerd toegang)
  var defaultAdmins = [
    'ireen.demeyere@dbsp.gent', 
    'ireen.demeyere@sintpietersgent.be', 
    'sam.steppe@dbsp.gent'
  ];
  if (defaultAdmins.indexOf(cleanEmail) !== -1) {
    var name = cleanEmail.indexOf('sam') !== -1 ? 'Sam Steppe' : 'Ireen De Meyere';
    return { allowed: true, role: 'admin', name: name };
  }

  // 2. Controleer tabblad 'Personeel'
  var persSheet = ss.getSheetByName("Personeel");
  if (persSheet) {
    var pData = persSheet.getDataRange().getValues();
    for (var i = 1; i < pData.length; i++) {
      var pEmail = (pData[i][0] || '').toString().toLowerCase().trim();
      if (pEmail === cleanEmail) {
        var pRole = (pData[i][1] || '').toString().toLowerCase().trim();
        var pName = (pData[i][2] || '').toString().trim() || cleanEmail.split('@')[0];
        return {
          allowed: true,
          role: (pRole.indexOf('beheer') !== -1 || pRole.indexOf('admin') !== -1) ? 'admin' : 'teacher',
          name: pName
        };
      }
    }
  }

  // 3. Controleer tabblad 'Instellingen' (robuust met enters, spaties en komma's)
  var setSheet = ss.getSheetByName("Instellingen");
  if (setSheet) {
    var sData = setSheet.getDataRange().getValues();
    for (var j = 1; j < sData.length; j++) {
      var key = (sData[j][0] || '').toString().trim();
      var val = (sData[j][1] || '').toString();

      if (key === 'schoolbib_admin_emails' || key === 'schoolbib_teacher_emails') {
        // Splits op komma's, puntkomma's én nieuwe regels (\n)
        var list = val.split(/[,;\n\r]+/).map(function(item) {
          return item.trim().toLowerCase();
        });

        if (list.indexOf(cleanEmail) !== -1) {
          var role = (key === 'schoolbib_admin_emails') ? 'admin' : 'teacher';
          var displayName = cleanEmail.split('@')[0].replace('.', ' ');
          return { allowed: true, role: role, name: displayName };
        }
      }
    }
  }

  return { allowed: false, role: 'none', name: '' };
}

function getBooksSheet(ss) {
  return ss.getSheetByName("Boeken") || ss.getSheetByName("boeken");
}

function getOrCreateLoansSheet(ss) {
  var sheet = ss.getSheetByName("Uitleningen");
  if (!sheet) {
    sheet = ss.insertSheet("Uitleningen");
    sheet.appendRow([
      "ID", "Tijdstip", "Leerling", "Klas", "Boektitel", "Exemplaar", "Locatie", "Uitleendatum", "Inleverdatum", "Status", "Werkelijke Inleverdatum", "Staat van het boek"
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
