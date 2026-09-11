import {
  INITIAL_STUDENTS,
  INITIAL_ADMINS,
  INITIAL_PAPERS,
  INITIAL_MARKS,
  INITIAL_SUBMISSIONS,
  calculateGrade
} from '../data/mockData';

// ========================================================================
// 🔗 GOOGLE APPS SCRIPT WEB APP URL
// ========================================================================
// Paste your deployed Google Apps Script Web App URL below between the quotes.
// Example: 'https://script.google.com/macros/s/AKfycb.../exec'
// When this URL is set, the entire app connects directly to Google Sheets & Drive!
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-m6atKc8Y7gPXLh7iw5WVGIvhF_vwtxUwB7JVR64jTR9oXjawDTh16DXMgKqDfHHc6Q/exec';

const STORAGE_KEYS = {
  STUDENTS: 'bn_students',
  ADMINS: 'bn_admins',
  PAPERS: 'bn_papers',
  MARKS: 'bn_marks',
  SUBMISSIONS: 'bn_submissions',
  CONFIG: 'bn_config',
  CURRENT_USER: 'bn_current_user'
};

export const initializeStorage = () => {
  // Never initialize mock students with passwords into localStorage
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  }
  
  // Ensure default owner account entry exists for emergency login
  let currentAdmins = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMINS);
    currentAdmins = raw ? JSON.parse(raw) : [];
  } catch {
    currentAdmins = [];
  }

  // Remove old hardcoded demo accounts that should no longer exist
  const DEMO_ACCOUNTS_TO_REMOVE = [
    'bio.admin@bunnynotes.com',
    'chem.admin@bunnynotes.com',
    'phy.admin@bunnynotes.com'
  ];
  currentAdmins = currentAdmins.filter(a =>
    !DEMO_ACCOUNTS_TO_REMOVE.includes(a.email.toLowerCase())
  );

  // Keep owner account in local list (without password)
  const ownerEntry = {
    admin_id: 'OWN001',
    name: 'Bunny Notes Owner',
    email: 'owner@bunnynotes.com',
    role: 'owner',
    subject: 'All'
  };
  const exists = currentAdmins.some(a => 
    a.email.toLowerCase() === ownerEntry.email.toLowerCase() || 
    a.admin_id.toLowerCase() === ownerEntry.admin_id.toLowerCase()
  );
  if (!exists) {
    currentAdmins.unshift(ownerEntry);
  }
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(currentAdmins));

  if (!localStorage.getItem(STORAGE_KEYS.PAPERS)) {
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MARKS)) {
    localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({
      apiUrl: '',
      telegramBotToken: '',
      telegramBioChatId: '',
      telegramChemChatId: '',
      telegramPhyChatId: '',
      submissionsFolderId: '',
      questionPapersFolderId: '',
      markedPapersFolderId: '',
      isLiveMode: false,
      autoTelegramAlerts: true
    }));
  }
};

/**
 * Factory Reset — wipes ALL data from localStorage.
 * Config (API URL, Telegram, Drive Folder IDs) is preserved.
 * Only the Owner account is kept. All students, admins, papers, marks, submissions are cleared.
 */
export const factoryReset = () => {
  // Preserve existing cloud config
  const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);

  // Wipe all keys
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

  // Restore config
  if (savedConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, savedConfig);
  }

  // Re-init: empty everything, owner only
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify([
    {
      admin_id: 'OWN001',
      name: 'Bunny Notes Owner',
      email: 'owner@bunnynotes.com',
      role: 'owner',
      subject: 'All'
    }
  ]));
  localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
};

export const getConfig = () => {
  const envUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
  const hardcodedUrl = (APPS_SCRIPT_URL && APPS_SCRIPT_URL.trim() && !APPS_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID'))
    ? APPS_SCRIPT_URL.trim()
    : '';

  const envTgToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
  const envBioChat = import.meta.env.VITE_TELEGRAM_BIO_CHAT_ID || '';
  const envChemChat = import.meta.env.VITE_TELEGRAM_CHEM_CHAT_ID || '';
  const envPhyChat = import.meta.env.VITE_TELEGRAM_PHY_CHAT_ID || '';
  const envSubFolder = import.meta.env.VITE_DRIVE_SUBMISSIONS_FOLDER_ID || '';
  const envQuesFolder = import.meta.env.VITE_DRIVE_QUESTION_PAPERS_FOLDER_ID || '';

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const parsed = raw ? JSON.parse(raw) : {};

    // URL precedence: hardcoded URL in api.js > localStorage.apiUrl > envUrl
    const effectiveUrl = hardcodedUrl || (parsed.apiUrl ? parsed.apiUrl.trim() : '') || envUrl;

    return {
      apiUrl: effectiveUrl,
      telegramBotToken: parsed.telegramBotToken || envTgToken,
      telegramBioChatId: parsed.telegramBioChatId || envBioChat,
      telegramChemChatId: parsed.telegramChemChatId || envChemChat,
      telegramPhyChatId: parsed.telegramPhyChatId || envPhyChat,
      submissionsFolderId: parsed.submissionsFolderId || envSubFolder,
      questionPapersFolderId: parsed.questionPapersFolderId || envQuesFolder,
      markedPapersFolderId: parsed.markedPapersFolderId || '',
      isLiveMode: effectiveUrl ? true : (parsed.isLiveMode !== undefined ? parsed.isLiveMode : false),
      autoTelegramAlerts: parsed.autoTelegramAlerts !== undefined ? parsed.autoTelegramAlerts : true
    };
  } catch {
    const effectiveUrl = hardcodedUrl || envUrl;
    return {
      apiUrl: effectiveUrl,
      telegramBotToken: envTgToken,
      telegramBioChatId: envBioChat,
      telegramChemChatId: envChemChat,
      telegramPhyChatId: envPhyChat,
      submissionsFolderId: envSubFolder,
      questionPapersFolderId: envQuesFolder,
      markedPapersFolderId: '',
      isLiveMode: Boolean(effectiveUrl),
      autoTelegramAlerts: true
    };
  }
};

export const saveConfig = (newConfig) => {
  const current = getConfig();
  const merged = { ...current, ...newConfig };
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
  return merged;
};

export const getNextIndexNumber = () => {
  try {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    let maxNum = 0;
    students.forEach(s => {
      if (s.index_no && s.index_no.startsWith('BN')) {
        const num = parseInt(s.index_no.replace('BN', ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `BN${String(nextNum).padStart(3, '0')}`;
  } catch {
    return 'BN001';
  }
};

export const api = {
  async registerStudent({ name, email, password, phone, batch = '2027 A/L' }) {
    const config = getConfig();
    const isLive = Boolean(config.apiUrl) && config.isLiveMode !== false;

    if (!isLive) {
      throw new Error('Google Apps Script URL is not configured. Please paste your Web App URL into APPS_SCRIPT_URL in src/services/api.js to enable live registration.');
    }

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'register',
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: (phone || '').trim(),
          batch
        })
      });
      const result = await response.json();
      if (result.success) {
        // Safe: Do NOT store student password in localStorage!
        // Sync portal data so client has updated state
        await this.syncPortalData();
        return result;
      }
      throw new Error(result.error || 'Failed to register student in Google Sheet.');
    } catch (err) {
      throw new Error(err.message || 'Google Sheet registration failed. Please check network connection.');
    }
  },

  async login({ identifier, password, role }) {
    const config = getConfig();
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Built-in Owner emergency access (guaranteed to work for setup)
    if (
      (cleanId === 'owner@bunnynotes.com' || cleanId === 'owner' || cleanId === 'own001') && 
      cleanPass === 'owner123'
    ) {
      const ownerUser = {
        admin_id: 'OWN001',
        name: 'Bunny Notes Owner',
        email: 'owner@bunnynotes.com',
        role: 'owner',
        subject: 'All'
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(ownerUser));
      return { success: true, user: ownerUser };
    }

    // Live Mode: Strict Google Sheet Authentication
    const isLive = Boolean(config.apiUrl) && config.isLiveMode !== false;
    if (!isLive) {
      throw new Error('Google Apps Script Web App URL is not set. Please paste your URL into APPS_SCRIPT_URL in src/services/api.js.');
    }

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'login',
          identifier: cleanId,
          password: cleanPass,
          role
        })
      });
      const result = await response.json();
      if (result.success && result.user) {
        // Store ONLY active user session info (NEVER store password in localStorage)
        const sessionUser = {
          index_no: result.user.index_no,
          admin_id: result.user.admin_id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role || (role === 'admin' ? 'admin' : 'student'),
          subject: result.user.subject || 'All',
          phone: result.user.phone || '',
          batch: result.user.batch || '2027 A/L'
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      }
      throw new Error(result.error || 'Invalid credentials in Google Sheet.');
    } catch (err) {
      throw new Error(err.message || 'Failed to authenticate with Google Sheet.');
    }
  },

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getStudentPortalData(index_no) {
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '[]');
    const papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');

    const studentMarks = marks.filter(m => m.index_no === index_no);
    const studentSubmissions = submissions.filter(s => s.index_no === index_no);

    const subjects = ['Biology', 'Chemistry', 'Physics'];
    const subjectStats = {};

    subjects.forEach(sub => {
      const subMarks = studentMarks.filter(m => m.subject.toLowerCase() === sub.toLowerCase());
      const scores = subMarks.map(m => Number(m.score) || 0);
      const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : null;
      const currentGrade = avgScore !== null ? calculateGrade(avgScore) : 'N/A';
      
      const activePaper = papers.find(p => 
        p.subject?.toLowerCase() === sub.toLowerCase() && 
        (p.status || '').toString().trim().toLowerCase() === 'active'
      );
      const hasSubmittedActive = activePaper 
        ? studentSubmissions.some(s => s.paper_id === activePaper.id)
        : false;

      subjectStats[sub] = {
        subject: sub,
        marks: subMarks,
        averageScore: avgScore,
        currentGrade: currentGrade,
        totalPapers: subMarks.length,
        activePaper: activePaper || null,
        hasSubmittedActive
      };
    });

    return {
      studentMarks,
      studentSubmissions,
      papers,
      subjectStats
    };
  },

  // Submit Answer Paper -> Sends to dedicated subject Telegram group and custom folder ID
  async submitAnswerPaper({ index_no, student_name, subject, paper_id, paper_name, file, fileDataUrl }) {
    const config = getConfig();
    const isLive = Boolean(config.apiUrl) && config.isLiveMode !== false;

    const cleanPaperName = paper_name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const formattedFileName = `${subject}_${cleanPaperName}_${index_no}.pdf`;

    const submissionRecord = {
      id: `SUB-${Date.now().toString().slice(-5)}`,
      index_no,
      student_name,
      subject,
      paper_id,
      paper_name,
      file_name: formattedFileName,
      submitted_at: new Date().toLocaleString(),
      status: 'Pending Marking',
      file_size: file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '3.2 MB',
      drive_url: '' // Will be updated with real Drive URL from Google Apps Script
    };

    let liveUploadSuccess = false;
    let liveDriveUrl = '';

    if (isLive) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'uploadAnswerPaper',
            submission: submissionRecord,
            fileBase64: fileDataUrl ? (fileDataUrl.includes(',') ? fileDataUrl.split(',')[1] : fileDataUrl) : null,
            fileName: formattedFileName,
            subject: subject,
            submissionsFolderId: config.submissionsFolderId
          })
        });
        const resJson = await response.json();
        if (resJson.success) {
          liveUploadSuccess = true;
          liveDriveUrl = resJson.drive_url || '';
          submissionRecord.drive_url = liveDriveUrl;
        } else {
          throw new Error(resJson.error || 'Failed to upload answer paper to Google Drive');
        }
      } catch (err) {
        console.warn('Apps Script upload error:', err);
        throw err;
      }
    }

    // Save only lightweight metadata to localStorage (NEVER save base64 data URLs)
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
    const existingIndex = submissions.findIndex(s => s.index_no === index_no && s.paper_id === paper_id);
    if (existingIndex >= 0) {
      submissions[existingIndex] = submissionRecord;
    } else {
      submissions.unshift(submissionRecord);
    }
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));

    let targetChatId = '';
    const subLower = subject.toLowerCase();
    if (subLower === 'biology') {
      targetChatId = config.telegramBioChatId;
    } else if (subLower === 'chemistry') {
      targetChatId = config.telegramChemChatId;
    } else if (subLower === 'physics') {
      targetChatId = config.telegramPhyChatId;
    }

    let telegramSent = false;
    if (config.telegramBotToken && targetChatId && config.autoTelegramAlerts) {
      try {
        const emoji = subLower === 'biology' ? '🧬' : subLower === 'chemistry' ? '🧪' : '⚛️';
        const caption = `🐰 *Bunny Notes - New ${subject} Paper Submission!* ${emoji}\n\n` +
          `👤 *Student:* ${student_name} (\`${index_no}\`)\n` +
          `📚 *Subject:* ${subject}\n` +
          `📝 *Paper:* ${paper_name}\n` +
          `📎 *File Name:* \`${formattedFileName}\`\n` +
          `⏰ *Time:* ${submissionRecord.submitted_at}\n\n` +
          `🔗 [View File in Google Drive](${liveDriveUrl || 'https://drive.google.com'})`;

        const tgUrl = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
        await fetch(tgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: caption,
            parse_mode: 'Markdown'
          })
        });
        telegramSent = true;
      } catch (err) {
        console.warn('Telegram notification failed:', err);
      }
    }

    return {
      success: true,
      submission: submissionRecord,
      formattedFileName,
      telegramSent,
      liveUploadSuccess
    };
  },

  async syncPortalData() {
    const config = getConfig();
    const isLive = Boolean(config.apiUrl) && config.isLiveMode !== false;
    if (!isLive) return null;

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getPortalData' })
      });
      const result = await response.json();
      if (result.success) {
        // Cache data to localStorage WITHOUT ANY PASSWORDS
        const cleanStudents = (result.students || []).map(s => {
          const { password, ...rest } = s;
          return rest;
        });
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(cleanStudents));

        const cleanAdmins = (result.admins || []).map(a => {
          const { password, ...rest } = a;
          return rest;
        });
        // Ensure owner exists in admin list
        const ownerExists = cleanAdmins.some(a => a.role === 'owner');
        if (!ownerExists) {
          cleanAdmins.unshift({
            admin_id: 'OWN001',
            name: 'Bunny Notes Owner',
            email: 'owner@bunnynotes.com',
            role: 'owner',
            subject: 'All'
          });
        }
        localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(cleanAdmins));

        localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(result.papers || []));
        localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(result.marks || []));
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(result.submissions || []));
        return result;
      }
    } catch (err) {
      console.warn('Failed to sync from Sheet, using local cache:', err);
    }
    return null;
  },

  async getAdminPortalData(adminUser) {
    await this.syncPortalData();

    // Read from localStorage (freshly synced)
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
    let papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');
    let marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '[]');
    let submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');

    const isOwner = adminUser?.role === 'owner';
    const isSuperAdmin = adminUser?.subject === 'All' || adminUser?.role === 'super_admin';
    const adminSubject = adminUser?.subject;

    if (!isOwner && !isSuperAdmin && adminSubject) {
      papers = papers.filter(p => p.subject?.toLowerCase() === adminSubject.toLowerCase());
      marks = marks.filter(m => m.subject?.toLowerCase() === adminSubject.toLowerCase());
      submissions = submissions.filter(s => s.subject?.toLowerCase() === adminSubject.toLowerCase());
    }

    return { students, admins, papers, marks, submissions, isOwner };
  },

  async savePaper(paperData) {
    const config = getConfig();
    const isLive = Boolean(config.apiUrl) && config.isLiveMode !== false;
    const papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');

    let finalPdfUrl = paperData.pdf_url || '';
    let serverPaperId = paperData.id;

    if (isLive) {
      try {
        const { fileDataUrl, ...restPaperData } = paperData;
        const payload = {
          action: 'savePaper',
          ...restPaperData,
          questionPapersFolderId: config.questionPapersFolderId
        };
        if (fileDataUrl) {
          payload.fileBase64 = fileDataUrl.includes(',') ? fileDataUrl.split(',')[1] : fileDataUrl;
          payload.fileName = `${paperData.subject}_${paperData.paper_name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        }

        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const res = await response.json();
        if (res.success) {
          if (res.drive_url || res.pdf_url) finalPdfUrl = res.drive_url || res.pdf_url;
          if (res.paper_id) serverPaperId = res.paper_id;
        } else {
          throw new Error(res.error || 'Failed to save paper to Google Sheet.');
        }
      } catch (err) {
        console.error('Live paper upload error:', err);
        throw err;
      }
    }

    // Notice: NEVER save fileDataUrl to localStorage (prevents quota crash)
    const newPaperRecord = {
      ...paperData,
      pdf_url: finalPdfUrl,
      id: serverPaperId || paperData.id || `${paperData.subject.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      status: (paperData.status || 'active').toLowerCase(),
      created_at: paperData.created_at || new Date().toISOString().split('T')[0]
    };
    delete newPaperRecord.fileDataUrl;

    const targetId = newPaperRecord.id;
    const idx = papers.findIndex(p => p.id === targetId);
    if (idx >= 0) {
      papers[idx] = newPaperRecord;
    } else {
      papers.unshift(newPaperRecord);
    }

    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
    return { success: true, paper: newPaperRecord };
  },

  async deletePaper(paperId) {
    const config = getConfig();
    const isLive = Boolean(config.apiUrl) && config.isLiveMode !== false;

    if (isLive) {
      try {
        await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'deletePaper',
            id: paperId
          })
        });
      } catch (err) {
        console.warn('Live delete paper failed:', err);
      }
    }

    let papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');
    papers = papers.filter(p => p.id !== paperId);
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
    return { success: true, papers };
  },

  async saveMark({ index_no, student_name, subject, paper_id, paper_name, score, marked_paper_url, feedback }) {
    const config = getConfig();
    const isLive = Boolean(config.apiUrl) && config.isLiveMode !== false;
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '[]');
    const grade = calculateGrade(score);

    let finalMarkedUrl = (marked_paper_url && !marked_paper_url.startsWith('data:')) ? marked_paper_url : '';

    if (isLive) {
      try {
        const payload = {
          action: 'saveMark',
          index_no,
          student_name,
          subject,
          paper_id,
          paper_name,
          score: Number(score),
          feedback: feedback || '',
          markedPapersFolderId: config.markedPapersFolderId
        };
        if (marked_paper_url && marked_paper_url.startsWith('data:')) {
          payload.fileBase64 = marked_paper_url.split(',')[1];
          payload.fileName = `Marked_${subject}_${paper_id}_${index_no}.pdf`;
        } else if (marked_paper_url) {
          payload.marked_paper_url = marked_paper_url;
        }

        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const res = await response.json();
        if (res.success && res.marked_paper_url) {
          finalMarkedUrl = res.marked_paper_url;
        }
      } catch (err) {
        console.warn('Live mark save failed:', err);
      }
    }

    const markRecord = {
      id: `M-${Date.now().toString().slice(-5)}`,
      index_no,
      student_name,
      subject,
      paper_id,
      paper_name,
      score: Number(score),
      grade,
      marked_paper_url: finalMarkedUrl,
      feedback: feedback || '',
      evaluated_at: new Date().toISOString().split('T')[0]
    };

    const existingIdx = marks.findIndex(m => m.index_no === index_no && m.paper_id === paper_id);
    if (existingIdx >= 0) {
      marks[existingIdx] = { ...marks[existingIdx], ...markRecord };
    } else {
      marks.unshift(markRecord);
    }
    localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks));

    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
    const subIdx = submissions.findIndex(s => s.index_no === index_no && s.paper_id === paper_id);
    if (subIdx >= 0) {
      submissions[subIdx].status = 'Marked';
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    }

    return { success: true, mark: markRecord };
  },

  async createAdmin({ name, email, password, subject = 'Biology' }) {
    const config = getConfig();
    const isLive = Boolean(config.apiUrl) && config.isLiveMode !== false;

    if (isLive) {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'createAdmin',
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          subject
        })
      });
      const result = await response.json();
      if (result.success) {
        // Safe: Do NOT store admin password in localStorage!
        const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
        const cleanAdmin = { ...result.admin };
        delete cleanAdmin.password;
        admins.push(cleanAdmin);
        localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
        return result;
      }
      throw new Error(result.error || 'Failed to create admin in Google Sheet.');
    }

    throw new Error('Google Apps Script URL is required to create Admin accounts.');
  },

  async testTelegramGroup(botToken, chatId, subjectName = 'General') {
    if (!botToken || !chatId) {
      throw new Error('Please enter both Telegram Bot Token and Chat ID.');
    }
    const text = `🐰 *Bunny Notes ${subjectName} Group Connected!* 🚀\n\n` +
      `Submissions for *${subjectName}* will now arrive in this Telegram group in real-time.`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
    const result = await response.json();
    if (!result.ok) {
      throw new Error(result.description || 'Failed to send Telegram message. Check Token & Chat ID.');
    }
    return { success: true, result };
  }
};
