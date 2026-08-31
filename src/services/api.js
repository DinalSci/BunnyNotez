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

// Initialize localStorage with default mock data if not already present
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(INITIAL_ADMINS));
  }
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
      telegramChatId: '',
      isLiveMode: false,
      autoTelegramAlerts: true
    }));
  }
};

// Helper to get configuration
export const getConfig = () => {
  const envUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
  const envTgToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
  const envTgChatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      apiUrl: parsed.apiUrl || envUrl,
      telegramBotToken: parsed.telegramBotToken || envTgToken,
      telegramChatId: parsed.telegramChatId || envTgChatId,
      isLiveMode: parsed.isLiveMode !== undefined ? parsed.isLiveMode : Boolean(parsed.apiUrl || envUrl),
      autoTelegramAlerts: parsed.autoTelegramAlerts !== undefined ? parsed.autoTelegramAlerts : true
    };
  } catch {
    return {
      apiUrl: envUrl,
      telegramBotToken: envTgToken,
      telegramChatId: envTgChatId,
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

// Generate next index number (e.g. BN001, BN002, ...)
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

// API Service Class
export const api = {
  // Authentication: Register Student
  async registerStudent({ name, email, password, phone, batch = '2026 A/L' }) {
    const config = getConfig();

    // If Live Apps Script mode is configured
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
          // sync locally
          const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
          students.push(result.user);
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
          return result;
        }
        throw new Error(result.error || 'Failed to register with Google Apps Script');
      } catch (err) {
        console.warn('Live API register failed, falling back to local:', err);
      }
    }

    // Local / Mock Mode
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

  // Authentication: Login (Student or Admin)
  async login({ identifier, password, role }) {
    const config = getConfig();
    const cleanId = identifier.trim().toLowerCase();

    // Live Mode Check
    if (config.isLiveMode && config.apiUrl) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'login',
            identifier: cleanId,
            password,
            role
          })
        });
        const result = await response.json();
        if (result.success) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(result.user));
          return result;
        }
        throw new Error(result.error || 'Invalid credentials');
      } catch (err) {
        console.warn('Live API login failed, trying local store:', err);
      }
    }

    // Local / Mock Mode
    if (role === 'admin') {
      const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
      const admin = admins.find(a => 
        (a.email.toLowerCase() === cleanId || a.admin_id.toLowerCase() === cleanId) && 
        a.password === password
      );
      if (!admin) {
        throw new Error('Invalid Admin email/ID or password.');
      }
      const user = { ...admin, role: 'admin' };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, user };
    } else {
      // Student login (can login with email or BN index)
      const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
      const student = students.find(s => 
        (s.email.toLowerCase() === cleanId || s.index_no.toLowerCase() === cleanId) && 
        s.password === password
      );
      if (!student) {
        throw new Error('Invalid Student Index Number/Email or password.');
      }
      const user = { ...student, role: 'student' };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, user };
    }
  },

  // Get current logged-in user from storage
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

  // Get all data for a specific student
  getStudentPortalData(index_no) {
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '[]');
    const papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');

    const studentMarks = marks.filter(m => m.index_no === index_no);
    const studentSubmissions = submissions.filter(s => s.index_no === index_no);

    // Group marks by subject & calculate averages
    const subjects = ['Biology', 'Chemistry', 'Physics'];
    const subjectStats = {};

    subjects.forEach(sub => {
      const subMarks = studentMarks.filter(m => m.subject === sub);
      const scores = subMarks.map(m => Number(m.score) || 0);
      const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : null;
      const currentGrade = avgScore !== null ? calculateGrade(avgScore) : 'N/A';
      
      const activePaper = papers.find(p => p.subject === sub && p.status === 'active');
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

  // Submit Answer Paper (Student)
  async submitAnswerPaper({ index_no, student_name, subject, paper_id, paper_name, file, fileDataUrl }) {
    const config = getConfig();

    // Format clean filename: [Subject]_[PaperName]_[Index].pdf
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

    // Save locally
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
    // replace if already exists or push
    const existingIndex = submissions.findIndex(s => s.index_no === index_no && s.paper_id === paper_id);
    if (existingIndex >= 0) {
      submissions[existingIndex] = submissionRecord;
    } else {
      submissions.unshift(submissionRecord);
    }
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));

    // Dispatch to Live Google Apps Script (if live)
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
            fileName: formattedFileName
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

    // Send Telegram Notification to Admin Group / Chat
    let telegramSent = false;
    if (config.telegramBotToken && config.telegramChatId && config.autoTelegramAlerts) {
      try {
        const caption = `🐰 *Bunny Notes - New Paper Submission!* 📄\n\n` +
          `👤 *Student:* ${student_name} (\`${index_no}\`)\n` +
          `📚 *Subject:* ${subject}\n` +
          `📝 *Paper:* ${paper_name}\n` +
          `📎 *File:* \`${formattedFileName}\`\n` +
          `⏰ *Time:* ${submissionRecord.submitted_at}\n\n` +
          `🔗 [View in Drive](${liveDriveUrl || 'https://drive.google.com'})`;

        const tgUrl = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
        await fetch(tgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.telegramChatId,
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

  // Admin: Get all portal data
  getAdminPortalData() {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const admins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
    const papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '[]');
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');

    return {
      students,
      admins,
      papers,
      marks,
      submissions
    };
  },

  // Admin: Add or Update Question Paper
  savePaper(paperData) {
    const papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');
    if (paperData.id) {
      const idx = papers.findIndex(p => p.id === paperData.id);
      if (idx >= 0) {
        papers[idx] = { ...papers[idx], ...paperData };
      } else {
        papers.unshift(paperData);
      }
    } else {
      const newPaper = {
        ...paperData,
        id: `${paperData.subject.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        created_at: new Date().toISOString().split('T')[0]
      };
      papers.unshift(newPaper);
    }
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
    return { success: true, papers };
  },

  // Admin: Delete Paper
  deletePaper(paperId) {
    let papers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAPERS) || '[]');
    papers = papers.filter(p => p.id !== paperId);
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
    return { success: true, papers };
  },

  // Admin: Add or Update Marks & Upload Marked PDF
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
      marked_paper_url: marked_paper_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
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

    // Also update submission status to 'Marked'
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
    const subIdx = submissions.findIndex(s => s.index_no === index_no && s.paper_id === paper_id);
    if (subIdx >= 0) {
      submissions[subIdx].status = 'Marked';
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    }

    return { success: true, mark: markRecord };
  },

  // Admin: Add new admin account
  createAdmin({ name, email, password, subject = 'All' }) {
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
      role: 'admin',
      subject
    };
    admins.push(newAdmin);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    return { success: true, admin: newAdmin };
  },

  // Send Test Telegram Alert
  async testTelegram(botToken, chatId) {
    if (!botToken || !chatId) {
      throw new Error('Please enter both Telegram Bot Token and Chat ID.');
    }
    const text = `🐰 *Bunny Notes Connected Successfully!* 🚀\n\n` +
      `Your Telegram bot is now ready to receive student paper submissions and automated alerts in real-time.`;
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
      throw new Error(result.description || 'Failed to send Telegram message. Please check token & chat ID.');
    }
    return { success: true, result };
  }
};
