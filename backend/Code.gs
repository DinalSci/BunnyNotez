/**
 * ========================================================================
 * 🐰 BUNNY NOTES - GOOGLE APPS SCRIPT BACKEND API (v2.1)
 * ========================================================================
 * Serverless REST API for Bunny Notes Study Group.
 * Supports Custom External Google Drive Folder IDs & 3 Subject Telegram Groups.
 */

// ⚙️ CONFIGURATION: Set your Telegram details and Custom Google Drive Folder IDs here
const CONFIG = {
  SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  
  // Telegram Configuration
  TELEGRAM_BOT_TOKEN: '8654001124:AAEVdydobOmblXW1NAr6Nbwd6Ymu8HahTew',       // e.g. 7123456789:AAFx...
  TELEGRAM_BIO_CHAT_ID: '-5179423932',   // Biology Group ID
  TELEGRAM_CHEM_CHAT_ID: '-5522470394', // Chemistry Group ID
  TELEGRAM_PHY_CHAT_ID: '-5286339827',   // Physics Group ID

  // Custom Google Drive Folder IDs (from any Google Account shared with Editor access)
  // Leave empty or as placeholder to automatically create folders in current account
  SUBMISSIONS_FOLDER_ID: '1R3WZYD9Vu6eqho8ynYPN5EP-MMB7Hk8j',      // e.g. '1AbCdEfGhIjKlMnOpQrStUvWxYz'
  QUESTION_PAPERS_FOLDER_ID: '1x3i362Pxo1sj63mUB4AptfsKD0SrGrNw',  // e.g. '1ZyXwVuTsRqPoNmLkJiHgFeDcBa'
  MARKED_PAPERS_FOLDER_ID: '192hyMvpHmbb7A7J2DPsoqqZAC97M1FoW',

  // Fallback folder names if Folder ID is not provided
  DEFAULT_SUBMISSIONS_FOLDER: 'BunnyNotes_Answer_Submissions',
  DEFAULT_QUESTION_PAPERS_FOLDER: 'BunnyNotes_Question_Papers',
  DEFAULT_MARKED_PAPERS_FOLDER: 'BunnyNotes_Marked_Papers'
};
// ------------------------------------------------------------------------
// HTTP POST HANDLER (API Actions)
// ------------------------------------------------------------------------
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (pErr) {
        body = {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

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

      case 'savePaper':
        responseData = handleSavePaper(body);
        break;

      case 'saveMark':
        responseData = handleSaveMark(body);
        break;

      case 'getPortalData':
        responseData = handleGetPortalData(body);
        break;

      case 'createAdmin':
        responseData = handleCreateAdmin(body);
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
// HTTP GET HANDLER (Diagnostics)
// ------------------------------------------------------------------------
function doGet(e) {
  try {
    initializeSheetsIfMissing();
    const data = getAllData();
    return ContentService.createTextOutput(JSON.stringify({
      status: 'online',
      message: 'Bunny Notes Google Apps Script API v2.1 with External Drive Support is active 🐰',
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

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] && rows[i][2].toString().trim().toLowerCase() === email) {
      return { success: false, error: 'An account with this email already exists.' };
    }
  }

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
    data.batch || '2027 A/L',
    joinedDate
  ]);

  const newUser = {
    index_no: newIndex,
    name: data.name,
    email: data.email,
    role: 'student',
    phone: data.phone || '',
    batch: data.batch || '2027 A/L',
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
// 2. LOGIN (Student, Admin, or Owner)
// ------------------------------------------------------------------------
function handleLogin(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const identifier = (data.identifier || '').toString().trim().toLowerCase();
  const password = (data.password || '').toString().trim();

  // 1. Check Admins Sheet First
  const adminSheet = ss.getSheetByName('Admins');
  if (adminSheet) {
    const rows = adminSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const adminId = rows[i][0] ? rows[i][0].toString().trim().toLowerCase() : '';
      const adminName = rows[i][1] ? rows[i][1].toString().trim() : '';
      const adminEmail = rows[i][2] ? rows[i][2].toString().trim().toLowerCase() : '';
      const adminPass = rows[i][3] ? rows[i][3].toString().trim() : '';
      const adminSubject = rows[i][4] ? rows[i][4].toString().trim() : 'All';
      let adminRole = rows[i][5] ? rows[i][5].toString().trim().toLowerCase() : '';

      if (!adminRole) {
        adminRole = (adminId === 'own001' || adminSubject === 'All') ? 'owner' : 'admin';
      }

      if ((adminEmail === identifier || adminId === identifier) && adminPass === password) {
        return {
          success: true,
          user: {
            admin_id: rows[i][0].toString(),
            name: adminName,
            email: rows[i][2].toString(),
            role: adminRole,
            subject: adminSubject
          }
        };
      }
    }
  }

  // 2. Check Students Sheet
  const studentSheet = ss.getSheetByName('Students');
  if (studentSheet) {
    const rows = studentSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const studentIdx = rows[i][0] ? rows[i][0].toString().trim().toLowerCase() : '';
      const studentEmail = rows[i][2] ? rows[i][2].toString().trim().toLowerCase() : '';
      const studentPass = rows[i][3] ? rows[i][3].toString().trim() : '';

      if ((studentIdx === identifier || studentEmail === identifier) && studentPass === password) {
        return {
          success: true,
          user: {
            index_no: rows[i][0].toString(),
            name: rows[i][1] ? rows[i][1].toString() : '',
            email: rows[i][2] ? rows[i][2].toString() : '',
            role: 'student',
            phone: rows[i][4] ? rows[i][4].toString() : '',
            batch: rows[i][5] ? rows[i][5].toString() : '2027 A/L'
          }
        };
      }
    }
  }

  return { success: false, error: 'Invalid Index Number / Email or password in Google Sheet.' };
}

// ------------------------------------------------------------------------
// 2.5 CREATE ADMIN
// ------------------------------------------------------------------------
function handleCreateAdmin(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Admins') || initializeSheet(ss, 'Admins', ['AdminID', 'Name', 'Email', 'Password', 'Subject', 'Role']);
  
  const rows = sheet.getDataRange().getValues();
  const email = (data.email || '').trim().toLowerCase();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] && rows[i][2].toString().trim().toLowerCase() === email) {
      return { success: false, error: 'An admin with this email already exists.' };
    }
  }

  // Count existing admins to generate ADM00x
  let maxIndex = 0;
  for (let i = 1; i < rows.length; i++) {
    const idxStr = rows[i][0] ? rows[i][0].toString() : '';
    if (idxStr.startsWith('ADM')) {
      const num = parseInt(idxStr.replace('ADM', ''), 10);
      if (!isNaN(num) && num > maxIndex) {
        maxIndex = num;
      }
    }
  }

  const nextNum = maxIndex + 1;
  const newAdminId = 'ADM' + ('000' + nextNum).slice(-3);
  const role = data.subject === 'All' ? 'super_admin' : 'admin';

  sheet.appendRow([
    newAdminId,
    data.name,
    data.email,
    data.password,
    data.subject,
    role
  ]);

  return {
    success: true,
    admin: {
      admin_id: newAdminId,
      name: data.name,
      email: data.email,
      role: role,
      subject: data.subject
    }
  };
}

// ------------------------------------------------------------------------
// 3. ANSWER PAPER UPLOAD (Uploads to Target Drive Folder ID & Telegram)
// ------------------------------------------------------------------------
function handleAnswerPaperUpload(data) {
  const sub = data.submission;
  const fileName = data.fileName;
  const fileBase64 = data.fileBase64;
  const subject = (data.subject || sub.subject || 'Biology').trim();
  const customFolderId = data.submissionsFolderId || CONFIG.SUBMISSIONS_FOLDER_ID;

  let driveFileUrl = '';

  // 1. Save to Target Google Drive Folder (ID or Fallback Name)
  if (fileBase64) {
    const folder = resolveDriveFolder(customFolderId, CONFIG.DEFAULT_SUBMISSIONS_FOLDER);
    const decodedBytes = Utilities.base64Decode(fileBase64);
    const fileBlob = Utilities.newBlob(decodedBytes, 'application/pdf', fileName);
    const driveFile = folder.createFile(fileBlob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    driveFileUrl = driveFile.getUrl();
  }

  // 2. Append to Submissions Sheet
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
    subject,
    sub.paper_id,
    sub.paper_name,
    fileName,
    driveFileUrl || sub.drive_url,
    timeNow,
    'Pending Marking'
  ]);

  // 3. Send Telegram Notification to the matching Subject Group
  let targetChatId = '';
  const subLower = subject.toLowerCase();
  if (subLower === 'biology') {
    targetChatId = CONFIG.TELEGRAM_BIO_CHAT_ID;
  } else if (subLower === 'chemistry') {
    targetChatId = CONFIG.TELEGRAM_CHEM_CHAT_ID;
  } else if (subLower === 'physics') {
    targetChatId = CONFIG.TELEGRAM_PHY_CHAT_ID;
  }

  if (CONFIG.TELEGRAM_BOT_TOKEN && targetChatId && targetChatId.indexOf('YOUR_') === -1) {
    try {
      const emoji = subLower === 'biology' ? '🧬' : subLower === 'chemistry' ? '🧪' : '⚛️';
      const caption = '🐰 *Bunny Notes - New ' + subject + ' Paper Submission!* ' + emoji + '\n\n' +
        '👤 *Student:* ' + sub.student_name + ' (`' + sub.index_no + '`)\n' +
        '📚 *Subject:* ' + subject + '\n' +
        '📝 *Paper:* ' + sub.paper_name + '\n' +
        '📎 *File:* `' + fileName + '`\n' +
        '⏰ *Time:* ' + timeNow + '\n\n' +
        '🔗 [Download from Google Drive](' + (driveFileUrl || 'https://drive.google.com') + ')';

      sendTelegramMessage(CONFIG.TELEGRAM_BOT_TOKEN, targetChatId, caption);
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
// 4. SAVE QUESTION PAPER (Uploads to Target Question Papers Folder ID)
// ------------------------------------------------------------------------
function handleSavePaper(data) {
  let pdfUrl = data.pdf_url || '';
  const customFolderId = data.questionPapersFolderId || CONFIG.QUESTION_PAPERS_FOLDER_ID;

  // Direct file upload to Question Papers folder in Google Drive
  if (data.fileBase64 && data.fileName) {
    const folder = resolveDriveFolder(customFolderId, CONFIG.DEFAULT_QUESTION_PAPERS_FOLDER);
    const decodedBytes = Utilities.base64Decode(data.fileBase64);
    const fileBlob = Utilities.newBlob(decodedBytes, 'application/pdf', data.fileName);
    const driveFile = folder.createFile(fileBlob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    pdfUrl = driveFile.getUrl();
  }

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
    pdfUrl,
    data.deadline || '',
    data.status || 'active',
    createdAt
  ]);

  return { success: true, paper_id: paperId, drive_url: pdfUrl };
}

// ------------------------------------------------------------------------
// 5. SAVE MARKS & EVALUATION PDF
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
  else if (score >= 50) grade = 'C';
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
// 6. GET PORTAL DATA (Full Sheet Sync for Admin Portal)
// ------------------------------------------------------------------------
function handleGetPortalData(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  const studentsSheet = ss.getSheetByName('Students');
  const adminsSheet = ss.getSheetByName('Admins');
  const papersSheet = ss.getSheetByName('Papers');
  const marksSheet = ss.getSheetByName('Marks');
  const submissionsSheet = ss.getSheetByName('Submissions');

  const rawStudents = studentsSheet ? getSheetDataAsJson(studentsSheet) : [];
  const rawAdmins = adminsSheet ? getSheetDataAsJson(adminsSheet) : [];
  const rawPapers = papersSheet ? getSheetDataAsJson(papersSheet) : [];
  const rawMarks = marksSheet ? getSheetDataAsJson(marksSheet) : [];
  const rawSubmissions = submissionsSheet ? getSheetDataAsJson(submissionsSheet) : [];

  const students = rawStudents.map(function(r) {
    return {
      index_no: r['IndexNo'],
      name: r['Name'],
      email: r['Email'],
      password: r['Password'],
      phone: r['Phone'],
      batch: r['Batch'],
      joined_date: r['JoinedDate'],
      role: 'student'
    };
  });

  const admins = rawAdmins.map(function(r) {
    return {
      admin_id: r['AdminID'],
      name: r['Name'],
      email: r['Email'],
      password: r['Password'],
      subject: r['Subject'],
      role: r['Role'] || (r['Subject'] === 'All' ? 'owner' : 'admin')
    };
  });

  const papers = rawPapers.map(function(r) {
    return {
      id: r['PaperID'],
      subject: r['Subject'],
      paper_name: r['PaperName'],
      description: r['Description'],
      pdf_url: r['PdfUrl'],
      deadline: r['Deadline'],
      status: r['Status'],
      created_at: r['CreatedAt']
    };
  });

  const marks = rawMarks.map(function(r) {
    return {
      id: r['MarkID'],
      index_no: r['IndexNo'],
      student_name: r['StudentName'],
      subject: r['Subject'],
      paper_id: r['PaperID'],
      paper_name: r['PaperName'],
      score: r['Score'],
      grade: r['Grade'],
      marked_paper_url: r['MarkedPaperUrl'],
      feedback: r['Feedback'],
      evaluated_at: r['EvaluatedAt']
    };
  });

  const submissions = rawSubmissions.map(function(r) {
    return {
      id: r['SubmissionID'],
      index_no: r['IndexNo'],
      student_name: r['StudentName'],
      subject: r['Subject'],
      paper_id: r['PaperID'],
      paper_name: r['PaperName'],
      file_name: r['FileName'],
      drive_url: r['DriveUrl'],
      submitted_at: r['SubmittedAt'],
      status: r['Status']
    };
  });

  return {
    success: true,
    students: students,
    admins: admins,
    papers: papers,
    marks: marks,
    submissions: submissions
  };
}

// ------------------------------------------------------------------------
// TELEGRAM DISPATCHER
// ------------------------------------------------------------------------
function sendTelegramMessage(botToken, chatId, text) {
  const url = 'https://api.telegram.org/bot' + botToken + '/sendMessage';
  const payload = {
    chat_id: chatId,
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
// RESOLVE DRIVE FOLDER (BY ID OR FALLBACK NAME)
// ------------------------------------------------------------------------
function resolveDriveFolder(folderId, fallbackFolderName) {
  if (folderId && folderId.toString().trim() && folderId.indexOf('YOUR_') === -1) {
    try {
      const cleanId = folderId.toString().trim();
      const folder = DriveApp.getFolderById(cleanId);
      if (folder) return folder;
    } catch (e) {
      Logger.log('Could not access folder by ID: ' + folderId + '. Falling back to name. Error: ' + e);
    }
  }
  return getOrCreateFolder(fallbackFolderName);
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

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
  initializeSheet(ss, 'Admins', ['AdminID', 'Name', 'Email', 'Password', 'Subject', 'Role']);
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
