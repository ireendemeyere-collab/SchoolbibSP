// =========================================================================
// SCHOOLBIB DBSP - CENTRAAL BEHEER: STATUSSEN, ERK, RATINGS, BALIE & OTP
// =========================================================================

// -------------------------------------------------------------------------
// 1. EIGEN MENU BOVENAAN IN GOOGLE SHEETS
// -------------------------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📚 Schoolbibbeheer')
    .addItem('⚡ Alles in 1 klik bijwerken (Status, ERK & Sterren)', 'synchroniseerAlles')
    .addSeparator()
    .addItem('📦 Uitleenstatussen bijwerken (per exemplaar)', 'werkUitleenStatussenBij')
    .addItem('🏷️ ERK & OKAN niveaus automatisch toekennen', 'kenErkAutomatischToe')
    .addItem('⭐ Sterren & Beoordelingen herberekenen', 'berekenAlleBestaandeGemiddelden')
    .addToUi();
}

// -------------------------------------------------------------------------
// 2. KOPPELING MET DE WEBSITE (doGet)
// -------------------------------------------------------------------------
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // A. Publieke status (voor bezoekers op schoolbib.dbsp.gent)
    if (action === 'get_public_status') {
      const settingsSheet = ss.getSheetByName('Instellingen');
      const settings = {};
      let featuredTheme = null;
      if (settingsSheet) {
        const data = settingsSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          const k = data[i][0] ? data[i][0].toString().trim() : '';
          if (k) {
            settings[k] = data[i][1];
            if (k === 'schoolbib_featured_theme') {
              try { featuredTheme = JSON.parse(data[i][1]); } catch(err){}
            }
          }
        }
      }

      // Actieve leningen anoniem ophalen (100% GDPR-veilig)
      const loansSheet = ss.getSheetByName('Uitleningen');
      const activeLoans = [];
      if (loansSheet) {
        const lData = loansSheet.getDataRange().getValues();
        for (let i = 1; i < lData.length; i++) {
          const titel = lData[i][4] ? lData[i][4].toString().trim() : ''; // Kolom E (Boektitel)
          const exemplaar = lData[i][5] ? lData[i][5].toString().trim() : 'Exemplaar 1'; // Kolom F (Exemplaar)
          const werkelijkIngeleverd = lData[i][10]; // Kolom K
          const status = lData[i][9] ? lData[i][9].toString().trim().toLowerCase() : ''; // Kolom J

          const isActief = (!werkelijkIngeleverd || werkelijkIngeleverd.toString().trim() === '') && 
                           (!status.includes('ingeleverd') && !status.includes('aanwezig'));

          if (titel && isActief) {
            activeLoans.push({ bookTitle: titel, copyLabel: exemplaar });
          }
        }
      }

      return createJsonResponse({ 
        status: 'success', 
        settings: settings, 
        featuredTheme: featuredTheme,
        activeLoans: activeLoans 
      });
    }

    // B. Volledige data ophalen voor personeelsbalie
    if (action === 'get_all_data' || action === 'get_loans') {
      const loansSheet = ss.getSheetByName('Uitleningen');
      const loans = [];
      if (loansSheet) {
        const data = loansSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
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
            returned: (row[9] && row[9].toString().toLowerCase().includes('ingeleverd')),
            returnDate: formatCellDate(row[10]),
            condition: row[11] ? row[11].toString() : ''
          });
        }
      }

      const settings = {};
      const settingsSheet = ss.getSheetByName('Instellingen');
      if (settingsSheet) {
        const sData = settingsSheet.getDataRange().getValues();
        for (let s = 1; s < sData.length; s++) {
          const k = sData[s][0] ? sData[s][0].toString().trim() : '';
          if (k) settings[k] = sData[s][1] ? sData[s][1].toString() : '';
        }
      }

      return createJsonResponse({ status: 'success', loans: loans, settings: settings });
    }
    
    return createJsonResponse({ status: 'ready', message: 'Schoolbib API is actief!' });
  } catch(err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// -------------------------------------------------------------------------
// 3. KOPPELING MET DE WEBSITE (doPost)
// -------------------------------------------------------------------------
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const action = data.action || (e && e.parameter ? e.parameter.action : '');
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. E-MAIL VERIFICATIECODE AANVRAGEN (OTP) - 100% DYNAMISCH VIA DE SHEET
    if (action === 'request_email_otp') {
      const email = (data.email || (e && e.parameter ? e.parameter.email : '')).toString().trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return createJsonResponse({ status: 'error', message: 'Ongeldig e-mailadres.' });
      }

      const authInfo = getStaffRoleAndName(ss, email);
      if (!authInfo.allowed) {
        return createJsonResponse({ 
          status: 'forbidden', 
          message: 'Toegang geweigerd: Dit account staat niet geregistreerd in de personeelslijst van Don Bosco Gent. Leerlingen hebben geen toegang tot het beheer.' 
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const props = PropertiesService.getScriptProperties();
      const otpData = {
        code: otp,
        email: email,
        role: authInfo.role,
        name: authInfo.name,
        expires: new Date().getTime() + (15 * 60 * 1000)
      };
      props.setProperty('OTP_' + email, JSON.stringify(otpData));

      const subject = "Inlogcode Schoolbib Don Bosco Gent: " + otp;
      const body = "Beste " + authInfo.name + ",\n\n" +
                   "Je hebt een inlogcode aangevraagd voor de Schoolbibliotheek van Don Bosco Gent campus Sint-Pieters.\n\n" +
                   "Jouw 6-cijferige verificatiecode is: " + otp + "\n\n" +
                   "Deze code is 15 minuten geldig.\n\n" +
                   "Met vriendelijke groeten,\nSchoolbib DBSP";

      try {
        MailApp.sendEmail(email, subject, body);
      } catch (mErr) {
        GmailApp.sendEmail(email, subject, body);
      }

      return createJsonResponse({ 
        status: 'success', 
        message: 'Een 6-cijferige inlogcode is verzonden naar ' + email + '. Controleer je inbox.' 
      });
    }

    // 2. E-MAIL VERIFICATIECODE VERIFIËREN
    if (action === 'verify_email_otp') {
      const emailVerify = (data.email || '').toString().trim().toLowerCase();
      const inputCode = (data.code || '').toString().trim();
      const propsVerify = PropertiesService.getScriptProperties();
      const rawOtp = propsVerify.getProperty('OTP_' + emailVerify);

      if (!rawOtp) {
        return createJsonResponse({ status: 'error', message: 'Geen actieve code gevonden voor dit e-mailadres. Vraag een nieuwe code aan.' });
      }

      const storedOtp = JSON.parse(rawOtp);
      const now = new Date().getTime();

      if (now > storedOtp.expires) {
        propsVerify.deleteProperty('OTP_' + emailVerify);
        return createJsonResponse({ status: 'error', message: 'De verificatiecode is verlopen. Vraag een nieuwe code aan.' });
      }

      if (storedOtp.code !== inputCode) {
        return createJsonResponse({ status: 'error', message: 'Onjuiste code. Controleer de cijfers in je mail.' });
      }

      propsVerify.deleteProperty('OTP_' + emailVerify);
      const sessionToken = Utilities.getUuid();
      propsVerify.setProperty('SESSION_' + sessionToken, JSON.stringify({
        email: emailVerify,
        role: storedOtp.role,
        name: storedOtp.name,
        expires: now + (24 * 60 * 60 * 1000)
      }));

      return createJsonResponse({
        status: 'success',
        sessionToken: sessionToken,
        role: storedOtp.role,
        user: { email: emailVerify, name: storedOtp.name, role: storedOtp.role }
      });
    }

    // 3. UITLENING OPSLAAN + TABBLAD 'BOEKEN' AUTOMATISCH OP 'UITGELEEND' ZETTEN (ROOD)
    if (action === 'save_loan') {
      const loansSheet = getOrCreateLoansSheet(ss);
      const bookTitle = data.bookTitle ? data.bookTitle.toString().trim() : '';
      const copyLabel = data.copyLabel ? data.copyLabel.toString().trim() : 'Exemplaar 1';

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

      // Werk direct de statussen in 'boeken' bij -> rij kleurt direct ROOD!
      werkUitleenStatussenBij();

      return createJsonResponse({ 
        status: 'success', 
        message: 'Uitlening opgeslagen! Status in de sheet kleurt nu rood.' 
      });
    }

    // 4. BOEK INLEVEREN + STATUS IN 'BOEKEN' AUTOMATISCH WEER OP 'AANWEZIG' ZETTEN
    if (action === 'return_loan') {
      const loansSheetRet = getOrCreateLoansSheet(ss);
      const rowsRet = loansSheetRet.getDataRange().getValues();
      const targetId = data.id ? data.id.toString() : '';
      const retDate = data.returnDate || new Date().toISOString().split('T')[0];
      const condition = data.condition ? data.condition.toString().trim() : 'Goed';
      const note = data.note ? data.note.toString().trim() : '';
      const conditionText = condition + (note ? ': ' + note : '');
      const statusText = condition !== 'Goed' ? 'Ingeleverd (' + conditionText + ')' : 'Ingeleverd';
      let foundRet = false;

      for (let r = 1; r < rowsRet.length; r++) {
        if (rowsRet[r][0] && rowsRet[r][0].toString() === targetId) {
          loansSheetRet.getRange(r + 1, 10).setValue(statusText);
          loansSheetRet.getRange(r + 1, 11).setValue(retDate);
          loansSheetRet.getRange(r + 1, 12).setValue(conditionText);
          foundRet = true;
          break;
        }
      }

      // Werk direct de statussen in 'boeken' bij -> rood verdwijnt automatisch!
      werkUitleenStatussenBij();

      return createJsonResponse({ 
        status: 'success', 
        found: foundRet, 
        message: 'Boek gemarkeerd als ingeleverd! Status in de sheet staat weer op Aanwezig.' 
      });
    }

    // 5. UITLENING VERWIJDEREN
    if (action === 'delete_loan') {
      const loansSheetDel = getOrCreateLoansSheet(ss);
      const rowsDel = loansSheetDel.getDataRange().getValues();
      const targetIdDel = data.id ? data.id.toString() : '';

      for (let rd = 1; rd < rowsDel.length; rd++) {
        if (rowsDel[rd][0] && rowsDel[rd][0].toString() === targetIdDel) {
          loansSheetDel.deleteRow(rd + 1);
          break;
        }
      }

      werkUitleenStatussenBij();
      return createJsonResponse({ status: 'success', message: 'Uitlening verwijderd.' });
    }

    // 6. INSTELLING OPSLAAN
    if (action === 'save_setting' && data.key) {
      let sSheet = ss.getSheetByName('Instellingen') || ss.insertSheet('Instellingen');
      if (sSheet.getLastRow() === 0) sSheet.appendRow(['Instelling', 'Waarde', 'Laatst Bijgewerkt']);
      
      const sData = sSheet.getDataRange().getValues();
      let foundRow = -1;
      for (let i = 1; i < sData.length; i++) {
        if (sData[i][0] && sData[i][0].toString().trim() === data.key.toString().trim()) {
          foundRow = i + 1; 
          break; 
        }
      }
      const val = typeof data.value === 'object' ? JSON.stringify(data.value) : String(data.value);
      if (foundRow !== -1) {
        sSheet.getRange(foundRow, 2).setValue(val);
        sSheet.getRange(foundRow, 3).setValue(new Date());
      } else {
        sSheet.appendRow([data.key, val, new Date()]);
      }
      return createJsonResponse({ status: 'success' });
    }

    // 7. STEM / RATINGS VAN LEERLING REGISTREREN
    if (data.action === 'rate' && data.titel && data.rating) {
      let ratingsSheet = ss.getSheetByName('Beoordelingen') || ss.insertSheet('Beoordelingen');
      if (ratingsSheet.getLastRow() === 0) ratingsSheet.appendRow(['Datum', 'Titel', 'Score']);
      ratingsSheet.appendRow([new Date(), data.titel, Number(data.rating)]);

      berekenAlleBestaandeGemiddelden();
      return createJsonResponse({ status: 'success' });
    }

    // 8. BOEK TOEVOEGEN
    if (action === 'add_book') {
      const booksSheet = getBooksSheet(ss);
      if (!booksSheet) {
        return createJsonResponse({ status: 'error', message: 'Tabblad Boeken niet gevonden.' });
      }
      const count = data.count ? parseInt(data.count, 10) : 1;
      const startCopyNum = data.exemplaar ? parseInt(data.exemplaar, 10) : 1;
      
      for (let i = 0; i < count; i++) {
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

    return createJsonResponse({ status: 'unknown_action' });
  } catch(err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// -------------------------------------------------------------------------
// 4. TWEERICHTINGSVERKEER BIJ HANDMATIGE CELWIJZIGING IN DE SHEET (onEdit)
// -------------------------------------------------------------------------
function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const sheetName = sheet.getName().toLowerCase();
  const row = e.range.getRow();
  const col = e.range.getColumn();
  if (row <= 1) return;

  const ss = e.source || SpreadsheetApp.getActiveSpreadsheet();

  // Als je in 'boeken' de kolom 'Status' manueel aanpast
  if (sheetName === 'boeken') {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const statusCol = headers.findIndex(h => h && h.toString().trim().toLowerCase() === 'status');
    
    if (col === statusCol + 1) {
      const newVal = (e.value || sheet.getRange(row, col).getValue() || '').toString().trim().toLowerCase();
      const title = sheet.getRange(row, 1).getValue().toString().trim();
      if (!title) return;

      const loansSheet = ss.getSheetByName('Uitleningen');
      if (!loansSheet) return;

      // Manueel op Aanwezig gezet -> sluit de lening in 'Uitleningen' af
      if (newVal === 'aanwezig' || newVal === '') {
        const lData = loansSheet.getDataRange().getValues();
        let closedCount = 0;
        for (let i = 1; i < lData.length; i++) {
          const lTitle = (lData[i][4] || '').toString().trim().toLowerCase();
          const lReturned = lData[i][10];
          const lStatus = (lData[i][9] || '').toString().trim().toLowerCase();

          if (lTitle === title.toLowerCase() && (!lReturned || lStatus.includes('uitgeleend'))) {
            const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
            loansSheet.getRange(i + 1, 11).setValue(todayStr); // Werkelijke Inleverdatum
            loansSheet.getRange(i + 1, 10).setValue('Ingeleverd'); // Status
            closedCount++;
          }
        }
        if (closedCount > 0) {
          ss.toast("Openstaande lening voor '" + title + "' afgesloten in Uitleningen.", "Schoolbib", 4);
        }
      } 
      // Manueel op Uitgeleend gezet -> noteer als beheerder
      else if (newVal.includes('uitgeleend') || newVal.includes('afwezig')) {
        const lData = loansSheet.getDataRange().getValues();
        const hasActive = lData.slice(1).some(r => 
          (r[4] || '').toString().trim().toLowerCase() === title.toLowerCase() && 
          (!r[10] || (r[9] || '').toString().trim().toLowerCase().includes('uitgeleend'))
        );
        if (!hasActive) {
          const now = new Date();
          const id = 'M-' + Math.floor(1000 + Math.random() * 9000);
          loansSheet.appendRow([id, now, "Manueel door beheerder", "-", title, "1", "Bibliotheek", now, "", "Uitgeleend", ""]);
          ss.toast("Nieuwe lening geregistreerd in tabblad Uitleningen.", "Schoolbib", 4);
        }
      }
    }
  }

  // Als je in 'Uitleningen' iets verandert
  if (sheetName === 'uitleningen') {
    werkUitleenStatussenBij();
  }
}

// -------------------------------------------------------------------------
// 5. BIJWERKFUNCTIES
// -------------------------------------------------------------------------

// A. Synchroniseert alle statussen (Aanwezig/Uitgeleend) in 'boeken' STRIKT PER EXEMPLAAR
function werkUitleenStatussenBij() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const loansSheet = ss.getSheetByName('Uitleningen');
  const booksSheet = getBooksSheet(ss);
  if (!loansSheet || !booksSheet) return;

  const loansData = loansSheet.getDataRange().getValues();
  const activeCopyLoans = new Set();
  const genericLoansCount = {};

  for (let i = 1; i < loansData.length; i++) {
    const titel = (loansData[i][4] || '').toString().trim().toLowerCase();
    const rawEx = (loansData[i][5] || '').toString().trim().toLowerCase();
    const cleanEx = rawEx.replace(/[^0-9]/g, '');
    const werkelijkIngeleverd = loansData[i][10];
    const status = (loansData[i][9] || '').toString().trim().toLowerCase();

    const isActief = (!werkelijkIngeleverd || werkelijkIngeleverd.toString().trim() === '') && 
                     (!status.includes('ingeleverd') && !status.includes('aanwezig'));

    if (titel && isActief) {
      if (cleanEx) {
        activeCopyLoans.add(`${titel}|||${cleanEx}`);
      } else {
        genericLoansCount[titel] = (genericLoansCount[titel] || 0) + 1;
      }
    }
  }

  const booksData = booksSheet.getDataRange().getValues();
  const headers = booksData[0];
  let statusCol = headers.findIndex(h => h && h.toString().trim().toLowerCase() === 'status');
  if (statusCol === -1) {
    statusCol = headers.length;
    booksSheet.getRange(1, statusCol + 1).setValue('Status');
  }

  const exemplaarCol = headers.findIndex(h => h && h.toString().trim().toLowerCase().includes('exemplaar'));
  const titleCounters = {};

  for (let r = 1; r < booksData.length; r++) {
    const bTitle = (booksData[r][0] || '').toString().trim().toLowerCase();
    const rawCopy = exemplaarCol !== -1 && booksData[r][exemplaarCol] ? booksData[r][exemplaarCol].toString().trim().toLowerCase() : '';
    const cleanCopy = rawCopy.replace(/[^0-9]/g, '');
    
    if (bTitle) {
      titleCounters[bTitle] = (titleCounters[bTitle] || 0) + 1;
      let isLoaned = false;

      if (cleanCopy && activeCopyLoans.has(`${bTitle}|||${cleanCopy}`)) {
        isLoaned = true;
      } else if (!cleanCopy && activeCopyLoans.has(`${bTitle}|||${titleCounters[bTitle]}`)) {
        isLoaned = true;
      } else if (genericLoansCount[bTitle] && genericLoansCount[bTitle] >= titleCounters[bTitle]) {
        isLoaned = true;
      }

      const targetVal = isLoaned ? 'Uitgeleend' : 'Aanwezig';
      const currentVal = (booksData[r][statusCol] || '').toString().trim();
      
      if (currentVal !== targetVal) {
        booksSheet.getRange(r + 1, statusCol + 1).setValue(targetVal);
      }
    }
  }
}

// B. Kent ERK & OKAN niveaus automatisch toe op basis van tags
function kenErkAutomatischToe() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const booksSheet = getBooksSheet(ss);
  if (!booksSheet) return;

  const data = booksSheet.getDataRange().getValues();
  const headers = data[0];
  
  let niveauCol = headers.findIndex(h => h && ['niveau', 'erk-niveau', 'erk'].includes(h.toString().trim().toLowerCase()));
  if (niveauCol === -1) {
    niveauCol = headers.length;
    booksSheet.getRange(1, niveauCol + 1).setValue('Niveau');
  }

  const tagsCol = headers.findIndex(h => h && h.toString().trim().toLowerCase() === 'tags');
  if (tagsCol === -1) return;

  for (let r = 1; r < data.length; r++) {
    const currentVal = (data[r][niveauCol] || '').toString().trim();
    const tags = (data[r][tagsCol] || '').toString().trim();
    
    if (!currentVal && tags) {
      let finalLvl = '';
      if (/\bokan\b/i.test(tags)) {
        finalLvl = 'OKAN';
      } else {
        const m = tags.match(/\b(?:ERK|CEFR)?[-:\s]*([A-C][1-2])\b/i);
        if (m && m[1].toUpperCase() !== 'C2') {
          finalLvl = m[1].toUpperCase();
        }
      }
      if (finalLvl) {
        booksSheet.getRange(r + 1, niveauCol + 1).setValue(finalLvl);
      }
    }
  }
}

// C. Berekent de scores uit het tabblad 'Beoordelingen' opnieuw
function berekenAlleBestaandeGemiddelden() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ratingsSheet = ss.getSheetByName('Beoordelingen');
  const booksSheet = getBooksSheet(ss);
  if (!ratingsSheet || !booksSheet) return;

  const ratingsData = ratingsSheet.getDataRange().getValues();
  const summary = {};

  for (let i = 1; i < ratingsData.length; i++) {
    const title = (ratingsData[i][1] || '').toString().trim().toLowerCase();
    const score = Number(ratingsData[i][2]);
    if (title && !isNaN(score) && score > 0) {
      if (!summary[title]) summary[title] = { total: 0, count: 0 };
      summary[title].total += score;
      summary[title].count += 1;
    }
  }

  const booksData = booksSheet.getDataRange().getValues();
  const headers = booksData[0];
  let ratingCol = headers.findIndex(h => h && h.toString().trim().toLowerCase() === 'sterren');
  if (ratingCol === -1) {
    ratingCol = headers.length;
    booksSheet.getRange(1, ratingCol + 1).setValue('Sterren');
  }

  for (let r = 1; r < booksData.length; r++) {
    const title = (booksData[r][0] || '').toString().trim().toLowerCase();
    if (summary[title]) {
      const avg = Math.round((summary[title].total / summary[title].count) * 10) / 10;
      booksSheet.getRange(r + 1, ratingCol + 1).setValue(avg);
    }
  }
}

// D. ALLES IN ÉÉN KLIK SYNCHRONISEREN (GEKOPPELD AAN DE KNOP)
function synchroniseerAlles() {
  werkUitleenStatussenBij();
  kenErkAutomatischToe();
  berekenAlleBestaandeGemiddelden();
  SpreadsheetApp.getActiveSpreadsheet().toast("Statussen, ERK's en sterren zijn allemaal bijgewerkt!", "Schoolbibbeheer", 4);
}

// -------------------------------------------------------------------------
// 6. HULPFUNCTIES & AUTHENTICATIE
// -------------------------------------------------------------------------

/**
 * Controleert dynamisch in de Google Sheet of een e-mailadres beheer- of balierechten heeft.
 * 100% dynamisch: GEEN namen of specifieke e-mailadressen hardcoded in de code!
 */
function getStaffRoleAndName(ss, email) {
  const cleanEmail = email.toLowerCase().trim();

  // 1. Controleer tabblad 'Personeel' (indien aanwezig)
  const persSheet = ss.getSheetByName("Personeel");
  if (persSheet) {
    const pData = persSheet.getDataRange().getValues();
    for (let i = 1; i < pData.length; i++) {
      const pEmail = (pData[i][0] || '').toString().toLowerCase().trim();
      if (pEmail === cleanEmail) {
        const pRole = (pData[i][1] || '').toString().toLowerCase().trim();
        const pName = (pData[i][2] || '').toString().trim() || formatDisplayName(cleanEmail);
        return {
          allowed: true,
          role: (pRole.includes('beheer') || pRole.includes('admin')) ? 'admin' : 'teacher',
          name: pName
        };
      }
    }
  }

  // 2. Controleer tabblad 'Instellingen' (robuust met enters, spaties, komma's en puntkomma's)
  const setSheet = ss.getSheetByName("Instellingen");
  if (setSheet) {
    const sData = setSheet.getDataRange().getValues();
    for (let j = 1; j < sData.length; j++) {
      const key = (sData[j][0] || '').toString().trim();
      const val = (sData[j][1] || '').toString();

      if (key === 'schoolbib_admin_emails' || key === 'schoolbib_teacher_emails') {
        const list = val.split(/[,;\n\r]+/).map(item => item.trim().toLowerCase()).filter(item => item.length > 0);

        if (list.includes(cleanEmail)) {
          const role = (key === 'schoolbib_admin_emails') ? 'admin' : 'teacher';
          const displayName = formatDisplayName(cleanEmail);
          return { allowed: true, role: role, name: displayName };
        }
      }
    }
  }

  return { allowed: false, role: 'none', name: '' };
}

function formatDisplayName(email) {
  try {
    const localPart = email.split('@')[0];
    const parts = localPart.split(/[._-]+/);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  } catch (e) {
    return 'Collega';
  }
}

function getBooksSheet(ss) {
  return ss.getSheetByName("Boeken") || ss.getSheetByName("boeken");
}

function getOrCreateLoansSheet(ss) {
  let sheet = ss.getSheetByName("Uitleningen");
  if (!sheet) {
    sheet = ss.insertSheet("Uitleningen");
    sheet.appendRow([
      "ID", "Tijdstip", "Leerling", "Klas", "Boektitel", "Exemplaar", "Locatie", "Uitleendatum", "Inleverdatum", "Status", "Werkelijke Inleverdatum", "Staat van het boek"
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatCellDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return val.toString().trim();
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
