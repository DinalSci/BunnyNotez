/**
 * ========================================================================
 * 🐰 BUNNY NOTES - GOOGLE APPS SCRIPT BACKEND API
 * ========================================================================
 * Complete REST Web App backend for Bunny Notes Study Group.
 * Connects Google Sheets DB, Google Drive Storage, and Telegram Bot Alerts.
 */

// ⚙️ CONFIGURATION: Set your Telegram Bot details here (or pass via request)
const CONFIG = {
  SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  TELEGRAM_BOT_TOKEN: 'YOUR_TELEGRAM_BOT_TOKEN_HERE', // e.g. 7123456789:AAFx...
  TELEGRAM_CHAT_ID: 'YOUR_TELEGRAM_CHAT_ID_HERE',     // e.g. -100123456789 or chat id
  SUBMISSIONS_FOLDER_NAME: 'BunnyNotes_Answer_Submissions',
  MARKED_FOLDER_NAME: 'BunnyNotes_Marked_Papers'
};

// ------------------------------------------------------------------------
// HTTP POST HANDLER (API Actions)
// ------------------------------------------------------------------------
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const rawData = e.postData.contents;
    const body = JSON.parse(rawData);
    const action = body.action;

    let responseData = {};

    switch (action) {
      case 'register':
        responseData = handleRegister(body);
        break;

      case 'login':
        responseData = handleLogin(body);
        break;

      case 'uploadAnswerPaper':
        responseData = handleAnswerPaperUpload(body);
        break;

      case 'getPortalData':
        responseData = handleGetPortalData(body);
        break;

      case 'saveMark':
        responseData = handleSaveMark(body);
        break;

      case 'savePaper':
        responseData = handleSavePaper(body);
        break;

      default:
        responseData = { success: false, error: 'Unknown API action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// ------------------------------------------------------------------------
// HTTP GET HANDLER (Diagnostics & Fetch All Data)
// ------------------------------------------------------------------------
function doGet(e) {
  try {
    initializeSheetsIfMissing();
    const data = getAllData();
    return ContentService.createTextOutput(JSON.stringify({
      status: 'online',
      message: 'Bunny Notes Google Apps Script API is active 🐰',
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ------------------------------------------------------------------------
// 1. REGISTER STUDENT (Auto Index Generator BN001, BN002, ...)
// ------------------------------------------------------------------------
function handleRegister(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Students') || initializeSheet(ss, 'Students', [
    'IndexNo', 'Name', 'Email', 'Password', 'Phone', 'Batch', 'JoinedDate'
  ]);

  const rows = sheet.getDataRange().getValues();
  const email = (data.email || '').trim().toLowerCase();

  // Check email uniqueness
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] && rows[i][2].toString().trim().toLowerCase() === email) {
      return { success: false, error: 'An account with this email already exists.' };
    }
  }

  // Calculate Next BN Index (BN001, BN002...)
  let maxIndex = 0;
  for (let i = 1; i < rows.length; i++) {
    const idxStr = rows[i][0] ? rows[i][0].toString() : '';
    if (idxStr.startsWith('BN')) {
      const num = parseInt(idxStr.replace('BN', ''), 10);
      if (!isNaN(num) && num > maxIndex) {
        maxIndex = num;
      }
    }
  }

  const nextNum = maxIndex + 1;
  const newIndex = 'BN' + ('000' + nextNum).slice(-3);
  const joinedDate = Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyy-MM-dd HH:mm');

  sheet.appendRow([
    newIndex,
    data.name,
    data.email,
    data.password,
    data.phone || '',
    data.batch || '2026 A/L',
    joinedDate
  ]);

  const newUser = {
    index_no: newIndex,
    name: data.name,
    email: data.email,
    role: 'student',
    phone: data.phone || '',
    batch: data.batch || '2026 A/L',
    joined_date: joinedDate
  };

  return {
    success: true,
    index_no: newIndex,
    user: newUser,
    message: 'Registered successfully as ' + newIndex
  };
}

// ------------------------------------------------------------------------
// 2. LOGIN (Student or Admin)
// ------------------------------------------------------------------------
function handleLogin(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const identifier = (data.identifier || '').trim().toLowerCase();
  const password = data.password;
  const role = data.role || 'student';

  if (role === 'admin') {
    const sheet = ss.getSheetByName('Admins');
    if (!sheet) return { success: false, error: 'Admin database not initialized.' };
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const adminEmail = rows[i][2] ? rows[i][2].toString().trim().toLowerCase() : '';
      const adminId = rows[i][0] ? rows[i][0].toString().trim().toLowerCase() : '';
      const adminPass = rows[i][3] ? rows[i][3].toString() : '';
      if ((adminEmail === identifier || adminId === identifier) && adminPass === password) {
        return {
          success: true,
          user: {
            admin_id: rows[i][0],
            name: rows[i][1],
            email: rows[i][2],
            role: 'admin',
            subject: rows[i][4] || 'All'
          }
        };
      }
    }
    return { success: false, error: 'Invalid admin credentials.' };
  } else {
    const sheet = ss.getSheetByName('Students');
    if (!sheet) return { success: false, error: 'Students database not found.' };
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const studentIdx = rows[i][0] ? rows[i][0].toString().trim().toLowerCase() : '';
      const studentEmail = rows[i][2] ? rows[i][2].toString().trim().toLowerCase() : '';
      const studentPass = rows[i][3] ? rows[i][3].toString() : '';
      if ((studentIdx === identifier || studentEmail === identifier) && studentPass === password) {
        return {
          success: true,
          user: {
            index_no: rows[i][0],
            name: rows[i][1],
            email: rows[i][2],
            role: 'student',
            phone: rows[i][4],
            batch: rows[i][5]
          }
        };
      }
    }
    return { success: false, error: 'Invalid student Index Number / Email or password.' };
  }
}

// ------------------------------------------------------------------------
// 3. ANSWER PAPER UPLOAD (Google Drive Save & Telegram Notification)
// ------------------------------------------------------------------------
function handleAnswerPaperUpload(data) {
  const sub = data.submission;
  const fileName = data.fileName;
  const fileBase64 = data.fileBase64;

  let driveFileUrl = '';
  let fileBlob = null;

  // Save to Google Drive Folder
  if (fileBase64) {
    const folder = getOrCreateFolder(CONFIG.SUBMISSIONS_FOLDER_NAME);
    const decodedBytes = Utilities.base64Decode(fileBase64);
    fileBlob = Utilities.newBlob(decodedBytes, 'application/pdf', fileName);
    const driveFile = folder.createFile(fileBlob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    driveFileUrl = driveFile.getUrl();
  }

  // Record in Google Sheet
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Submissions') || initializeSheet(ss, 'Submissions', [
    'SubmissionID', 'IndexNo', 'StudentName', 'Subject', 'PaperID', 'PaperName', 'FileName', 'DriveUrl', 'SubmittedAt', 'Status'
  ]);

  const submissionId = 'SUB-' + new Date().getTime().toString().slice(-6);
  const timeNow = Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyy-MM-dd HH:mm');

  sheet.appendRow([
    submissionId,
    sub.index_no,
    sub.student_name,
    sub.subject,
    sub.paper_id,
    sub.paper_name,
    fileName,
    driveFileUrl || sub.drive_url,
    timeNow,
    'Pending Marking'
  ]);

  // Send Telegram Notification & Document
  if (CONFIG.TELEGRAM_BOT_TOKEN && CONFIG.TELEGRAM_CHAT_ID && CONFIG.TELEGRAM_BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
    try {
      const caption = '🐰 *Bunny Notes - New Paper Submission!* 📄\n\n' +
        '👤 *Student:* ' + sub.student_name + ' (`' + sub.index_no + '`)\n' +
        '📚 *Subject:* ' + sub.subject + '\n' +
        '📝 *Paper:* ' + sub.paper_name + '\n' +
        '📎 *File:* `' + fileName + '`\n' +
        '⏰ *Time:* ' + timeNow + '\n\n' +
        '🔗 [Download from Google Drive](' + (driveFileUrl || 'https://drive.google.com') + ')';

      sendTelegramMessage(caption);
    } catch (tgErr) {
      Logger.log('Telegram dispatch error: ' + tgErr);
    }
  }

  return {
    success: true,
    drive_url: driveFileUrl,
    submission_id: submissionId,
    formatted_file_name: fileName
  };
}

// ------------------------------------------------------------------------
// 4. SAVE MARKS & EVALUATION PDF LINK
// ------------------------------------------------------------------------
function handleSaveMark(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Marks') || initializeSheet(ss, 'Marks', [
    'MarkID', 'IndexNo', 'StudentName', 'Subject', 'PaperID', 'PaperName', 'Score', 'Grade', 'MarkedPaperUrl', 'Feedback', 'EvaluatedAt'
  ]);

  const markId = 'M-' + new Date().getTime().toString().slice(-6);
  const evaluatedAt = Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyy-MM-dd');
  const score = Number(data.score);
  let grade = 'F';
  if (score >= 75) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 35) grade = 'S';

  sheet.appendRow([
    markId,
    data.index_no,
    data.student_name,
    data.subject,
    data.paper_id,
    data.paper_name,
    score,
    grade,
    data.marked_paper_url || '',
    data.feedback || '',
    evaluatedAt
  ]);

  return {
    success: true,
    mark_id: markId,
    grade: grade
  };
}

// ------------------------------------------------------------------------
// 5. SAVE OR UPDATE QUESTION PAPER
// ------------------------------------------------------------------------
function handleSavePaper(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Papers') || initializeSheet(ss, 'Papers', [
    'PaperID', 'Subject', 'PaperName', 'Description', 'PdfUrl', 'Deadline', 'Status', 'CreatedAt'
  ]);

  const paperId = data.id || (data.subject.slice(0, 3).toUpperCase() + '-' + new Date().getTime().toString().slice(-4));
  const createdAt = Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyy-MM-dd');

  sheet.appendRow([
    paperId,
    data.subject,
    data.paper_name,
    data.description || '',
    data.pdf_url || '',
    data.deadline || '',
    data.status || 'active',
    createdAt
  ]);

  return { success: true, paper_id: paperId };
}

// ------------------------------------------------------------------------
// TELEGRAM BOT DISPATCHER
// ------------------------------------------------------------------------
function sendTelegramMessage(text) {
  const url = 'https://api.telegram.org/bot' + CONFIG.TELEGRAM_BOT_TOKEN + '/sendMessage';
  const payload = {
    chat_id: CONFIG.TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: 'Markdown'
  };
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

// ------------------------------------------------------------------------
// HELPER: CREATE DRIVE FOLDER
// ------------------------------------------------------------------------
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

// ------------------------------------------------------------------------
// HELPER: INITIALIZE SHEET HEADERS
// ------------------------------------------------------------------------
function initializeSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#dcfce7');
  }
  return sheet;
}

function initializeSheetsIfMissing() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  initializeSheet(ss, 'Students', ['IndexNo', 'Name', 'Email', 'Password', 'Phone', 'Batch', 'JoinedDate']);
  initializeSheet(ss, 'Admins', ['AdminID', 'Name', 'Email', 'Password', 'Subject']);
  initializeSheet(ss, 'Papers', ['PaperID', 'Subject', 'PaperName', 'Description', 'PdfUrl', 'Deadline', 'Status', 'CreatedAt']);
  initializeSheet(ss, 'Submissions', ['SubmissionID', 'IndexNo', 'StudentName', 'Subject', 'PaperID', 'PaperName', 'FileName', 'DriveUrl', 'SubmittedAt', 'Status']);
  initializeSheet(ss, 'Marks', ['MarkID', 'IndexNo', 'StudentName', 'Subject', 'PaperID', 'PaperName', 'Score', 'Grade', 'MarkedPaperUrl', 'Feedback', 'EvaluatedAt']);
}

function getAllData() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  return {
    students: getSheetDataAsJson(ss.getSheetByName('Students')),
    papers: getSheetDataAsJson(ss.getSheetByName('Papers')),
    marks: getSheetDataAsJson(ss.getSheetByName('Marks')),
    submissions: getSheetDataAsJson(ss.getSheetByName('Submissions'))
  };
}

function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const results = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    results.push(obj);
  }
  return results;
}
