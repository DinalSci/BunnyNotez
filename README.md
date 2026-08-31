# 🐰 Bunny Notes - Study Group Web Application

Modern, glassmorphic web portal designed for A/L Science study groups (**Biology**, **Chemistry**, **Physics**).

---

## 🌟 Key Features

1. **Student Registration & Auto Indexing**:
   - Register with Name, Email, Password, WhatsApp Number, and Batch.
   - Automatically generates unique Index Numbers: `BN001`, `BN002`, `BN003`, etc.

2. **Student Dashboard & Grade Estimation**:
   - Live estimated grade level per subject (`A`, `B`, `C`, `S`, `F`) based on Sri Lankan A/L benchmark.
   - Interactive multi-subject progress line and bar charts.
   - Quick alert widget for ongoing papers.

3. **Subject Sections (Biology, Chemistry, Physics)**:
   - Dynamic Marks Trend graphs.
   - One-click Download for active question paper PDFs.
   - Written Answer Paper Upload with **Automatic File Renaming** (`[Subject]_[PaperName]_[Index].pdf`).
   - Dispatches answer PDFs to **Google Drive** & **Telegram Admin Chat**.
   - Evaluated / Marked Paper history table with instant **Download Marked PDF** buttons.

4. **Comprehensive Admin Portal**:
   - Multi-admin support for subject tutors.
   - Publish & manage active question papers.
   - Enter student marks with auto grade calculation and upload evaluated PDF links.
   - Student Directory with search, rank, and marks breakdown.
   - Cloud diagnostic tester for Google Apps Script & Telegram Bot.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti.
- **Backend / Database**: Google Sheets + Google Apps Script REST Web App.
- **File Storage**: Google Drive (Folder organization for Question Papers, Submissions, Marked PDFs).
- **Notifications**: Telegram Bot API integration.
- **Deployment**: GitHub + Vercel.

---

## 🚀 Quick Start

### Local Development:
```bash
npm install
npm run dev
```

### Build for Production:
```bash
npm run build
```

See [backend/SetupGuide.md](backend/SetupGuide.md) for full instructions on setting up Google Sheets, Google Apps Script, Telegram Bot, and Vercel!
