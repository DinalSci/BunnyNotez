import {
  INITIAL_STUDENTS,
  INITIAL_ADMINS,
  INITIAL_PAPERS,
  INITIAL_MARKS,
  INITIAL_SUBMISSIONS,
  calculateGrade
} from '../data/mockData';

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
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  
  // Ensure default admins (including owner) exist in storage
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

  // Ensure owner account always exists
  INITIAL_ADMINS.forEach(initAdm => {
    const exists = currentAdmins.some(a => 
      a.email.toLowerCase() === initAdm.email.toLowerCase() || 
      a.admin_id.toLowerCase() === initAdm.admin_id.toLowerCase()
    );
    if (!exists) {
      currentAdmins.push(initAdm);
    }
  });
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(currentAdmins));

  if (!localStorage.getItem(STORAGE_KEYS.PAPERS)) {
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(INITIAL_PAPERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MARKS)) {
    localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(INITIAL_MARKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
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
  // Preserve existing cloud config so owner doesn't have to re-enter it
  const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);

  // Wipe all keys
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

  // Restore config
  if (savedConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, savedConfig);
  }

  // Re-init: only owner account, empty everything else
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(INITIAL_ADMINS)); // owner only
  localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
};

export const getConfig = () => {
  const envUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
  const envTgToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
  const envBioChat = import.meta.env.VITE_TELEGRAM_BIO_CHAT_ID || '';
  const envChemChat = import.meta.env.VITE_TELEGRAM_CHEM_CHAT_ID || '';
  const envPhyChat = import.meta.env.VITE_TELEGRAM_PHY_CHAT_ID || '';
  const envSubFolder = import.meta.env.VITE_DRIVE_SUBMISSIONS_FOLDER_ID || '';
  const envQuesFolder = import.meta.env.VITE_DRIVE_QUESTION_PAPERS_FOLDER_ID || '';

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      apiUrl: parsed.apiUrl || envUrl,
      telegramBotToken: parsed.telegramBotToken || envTgToken,
      telegramBioChatId: parsed.telegramBioChatId || envBioChat,
      telegramChemChatId: parsed.telegramChemChatId || envChemChat,
      telegramPhyChatId: parsed.telegramPhyChatId || envPhyChat,
      submissionsFolderId: parsed.submissionsFolderId || envSubFolder,
      questionPapersFolderId: parsed.questionPapersFolderId || envQuesFolder,
      markedPapersFolderId: parsed.markedPapersFolderId || '',
      isLiveMode: parsed.isLiveMode !== undefined ? parsed.isLiveMode : Boolean(parsed.apiUrl || envUrl),
      autoTelegramAlerts: parsed.autoTelegramAlerts !== undefined ? parsed.autoTelegramAlerts : true
    };
  } catch {
    return {
      apiUrl: envUrl,
      telegramBotToken: envTgToken,
      telegramBioChatId: envBioChat,
      telegramChemChatId: envChemChat,
      telegramPhyChatId: envPhyChat,
      submissionsFolderId: envSubFolder,
      questionPapersFolderId: envQuesFolder,
      markedPapersFolderId: '',
      isLiveMode: Boolean(envUrl),
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

    if (config.isLiveMode && config.apiUrl) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'register',
            name,
            email,
            password,
            phone,
            batch
          })
        });
        const result = await response.json();
        if (result.success) {
          const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
          // Ensure password is saved locally for offline fallback
          students.push({ ...result.user, password });
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
          return result;
        }
        throw new Error(`SERVER_ERROR:${result.error || 'Failed to register with Google Apps Script'}`);
      } catch (err) {
        if (err.message.startsWith('SERVER_ERROR:')) throw new Error(err.message.replace('SERVER_ERROR:', ''));
        console.warn('Live API register failed, falling back to local:', err);
      }
    }

    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const existing = students.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const index_no = getNextIndexNumber();
    const newStudent = {
      index_no,
      name,
      email,
      password,
      role: 'student',
      phone: phone || '',
      batch,
      joined_date: new Date().toISOString().split('T')[0]
    };

    students.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    return {
      success: true,
      index_no,
      user: newStudent,
      message: `Account created successfully! Your Student Index is ${index_no}`
    };
  },

  async login({ identifier, password, role }) {
    const config = getConfig();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // Built-in Owner direct fallback check (always guaranteed to work)
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

    // Live Mode Check
    if (config.isLiveMode && config.apiUrl) {
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
        if (result.success) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(result.user));
          return result;
        }
        throw new Error(`SERVER_ERROR:${result.error || 'Invalid credentials'}`);
      } catch (err) {
        if (err.message.startsWith('SERVER_ERROR:')) throw new Error(err.message.replace('SERVER_ERROR:', ''));
        console.warn('Live API login failed, trying local store:', err);
      }
    }

    if (role === 'admin' || role === 'owner') {
      const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
      const admin = admins.find(a => 
        (a.email.toLowerCase() === cleanId || a.admin_id.toLowerCase() === cleanId) && 
        a.password === cleanPass
      );
      if (!admin) {
        throw new Error('Invalid Admin / Owner email or password. (Local)');
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(admin));
      return { success: true, user: admin };
    } else {
      const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
      const student = students.find(s => 
        (s.email.toLowerCase() === cleanId || s.index_no.toLowerCase() === cleanId) && 
        s.password === cleanPass
      );
      if (!student) {
        throw new Error('Invalid Student Index Number / Email or password. (Local)');
      }
      const user = { ...student, role: 'student' };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, user };
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
      
      const activePaper = papers.find(p => p.subject.toLowerCase() === sub.toLowerCase() && p.status === 'active');
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
      drive_url: fileDataUrl || 'https://drive.google.com/sample_submission.pdf'
    };

    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
    const existingIndex = submissions.findIndex(s => s.index_no === index_no && s.paper_id === paper_id);
    if (existingIndex >= 0) {
      submissions[existingIndex] = submissionRecord;
    } else {
      submissions.unshift(submissionRecord);
    }
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));

    let liveUploadSuccess = false;
    let liveDriveUrl = '';
    if (config.isLiveMode && config.apiUrl) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'uploadAnswerPaper',
            submission: submissionRecord,
            fileBase64: fileDataUrl ? fileDataUrl.split(',')[1] : null,
            fileName: formattedFileName,
            subject: subject,
            submissionsFolderId: config.submissionsFolderId
          })
        });
        const resJson = await response.json();
        if (resJson.success) {
          liveUploadSuccess = true;
          liveDriveUrl = resJson.drive_url;
        }
      } catch (err) {
        console.warn('Apps Script upload error:', err);
      }
    }

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

  getAdminPortalData(adminUser) {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
    let papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');
    let marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '[]');
    let submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');

    const isOwner = adminUser?.role === 'owner';
    const isSuperAdmin = adminUser?.subject === 'All' || adminUser?.role === 'super_admin';
    const adminSubject = adminUser?.subject;

    if (!isOwner && !isSuperAdmin && adminSubject) {
      papers = papers.filter(p => p.subject.toLowerCase() === adminSubject.toLowerCase());
      marks = marks.filter(m => m.subject.toLowerCase() === adminSubject.toLowerCase());
      submissions = submissions.filter(s => s.subject.toLowerCase() === adminSubject.toLowerCase());
    }

    return {
      students,
      admins,
      papers,
      marks,
      submissions,
      isOwner
    };
  },

  async savePaper(paperData) {
    const config = getConfig();
    const papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');

    let finalPdfUrl = paperData.pdf_url || '';

    if (paperData.fileDataUrl && config.isLiveMode && config.apiUrl) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'savePaper',
            ...paperData,
            fileBase64: paperData.fileDataUrl.split(',')[1],
            fileName: `${paperData.subject}_${paperData.paper_name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
            questionPapersFolderId: config.questionPapersFolderId
          })
        });
        const res = await response.json();
        if (res.success && res.drive_url) {
          finalPdfUrl = res.drive_url;
        }
      } catch (err) {
        console.warn('Live paper upload failed:', err);
      }
    }

    if (!finalPdfUrl && paperData.fileDataUrl) {
      finalPdfUrl = paperData.fileDataUrl;
    }

    const newPaperRecord = {
      ...paperData,
      pdf_url: finalPdfUrl,
      id: paperData.id || `${paperData.subject.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      created_at: paperData.created_at || new Date().toISOString().split('T')[0]
    };

    if (paperData.id) {
      const idx = papers.findIndex(p => p.id === paperData.id);
      if (idx >= 0) {
        papers[idx] = newPaperRecord;
      } else {
        papers.unshift(newPaperRecord);
      }
    } else {
      papers.unshift(newPaperRecord);
    }

    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
    return { success: true, paper: newPaperRecord };
  },

  deletePaper(paperId) {
    let papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');
    papers = papers.filter(p => p.id !== paperId);
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
    return { success: true, papers };
  },

  saveMark({ index_no, student_name, subject, paper_id, paper_name, score, marked_paper_url, feedback }) {
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '[]');
    const grade = calculateGrade(score);

    const markRecord = {
      id: `M-${Date.now().toString().slice(-5)}`,
      index_no,
      student_name,
      subject,
      paper_id,
      paper_name,
      score: Number(score),
      grade,
      marked_paper_url: marked_paper_url || '',
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
    if (config.isLiveMode && config.apiUrl) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'createAdmin',
            name,
            email,
            password,
            subject
          })
        });
        const result = await response.json();
        if (result.success) {
          // Sync with local storage
          const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
          admins.push({ ...result.admin, password });
          localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
          return result;
        }
        throw new Error(`SERVER_ERROR:${result.error || 'Failed to create admin'}`);
      } catch (err) {
        if (err.message.startsWith('SERVER_ERROR:')) throw new Error(err.message.replace('SERVER_ERROR:', ''));
        console.warn('Live API createAdmin failed, trying local store:', err);
        throw err; // In live mode, we want to know if sheet save fails
      }
    }

    // Local Storage Fallback
    const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
    const existing = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An admin with this email already exists.');
    }
    const newAdmin = {
      admin_id: `ADM${String(admins.length + 1).padStart(3, '0')}`,
      name,
      email,
      password,
      role: subject === 'All' ? 'super_admin' : 'admin',
      subject
    };
    admins.push(newAdmin);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    return { success: true, admin: newAdmin };
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
