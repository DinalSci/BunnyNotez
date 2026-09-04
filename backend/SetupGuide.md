# 🐰 Bunny Notes - සම්පූර්ණ Setup සහ Deployment උපදෙස් මාලාව (v2.1)

මෙම ලියවිල්ලෙන් ඔබට **Bunny Notes** web application එක Google Sheets, Google Apps Script, වෙනත් Google Account එකක Google Drive Folders, 3 Subject Telegram Groups (Biology, Chemistry, Physics) සහ Vercel හරහා deploy කරගන්නා ආකාරය පියවරෙන් පියවර විස්තර කර ඇත.

---

## 🔑 Login Accounts

1. **Owner (Super Admin) Account**:
   - **Email**: `owner@bunnynotes.com`
   - **Password**: `owner123`
   - *(Cloud Configuration, Custom Drive Folder IDs, 3 Telegram Groups, සහ සියලුම Admins/Students පාලනය කළ හැක්කේ Owner ට පමණි)*

2. **Subject Admins**:
   - **Biology Admin**: `bio.admin@bunnynotes.com` (Pass: `admin123`) -> Biology papers & marks පමණි.
   - **Chemistry Admin**: `chem.admin@bunnynotes.com` (Pass: `admin123`) -> Chemistry papers & marks පමණි.
   - **Physics Admin**: `phy.admin@bunnynotes.com` (Pass: `admin123`) -> Physics papers & marks පමණි.

---

## 📁 වෙනත් Google Account එකක Google Drive Folders සම්බන්ධ කිරීම (Step-by-Step)

ඔබගේ Apps Script එක තිබෙන්නේ Account A එකේ නම්, නමුත් Files Save විය යුත්තේ Account B හි Drive එකට නම්:

1. **Account B (Storage Account)** එකට Log in වී Google Drive එකේ Folders 2ක් සාදන්න:
   - `BunnyNotes_Submissions` (සිසුන්ගේ Answer Papers සඳහා)
   - `BunnyNotes_Question_Papers` (ප්‍රශ්න පත්‍ර සඳහා)
2. එම Folders 2ම **Share** click කර:
   - Account A (Apps Script deploy කළ Gmail ලිපිනය) add කර **Editor** permission ලබා දෙන්න.
3. Folder එක Open කළ විට Browser Address Bar එකේ ඇති URL එකෙන් Folder ID එක Copy කරගන්න:
   - උදා: `https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ`
   - Folder ID: **`1aBcDeFgHiJkLmNoPqRsTuVwXyZ`**
4. Bunny Notes Web App එකේ **Owner Login (`owner@bunnynotes.com`)** මඟින් Log in වී **Owner Cloud & Storage Config** වෙත ගොස් එම Folder IDs Paste කර **Save** කරන්න!

---

## 📑 පියවර 1: Google Sheets & Google Apps Script Backend එක සකසා ගැනීම

1. [Google Sheets](https://sheets.google.com) වෙත ගොස් නව හිස් Sheet එකක් සාදන්න (නම: `Bunny Notes Database` ලෙස දෙන්න).
2. ඉහළ මෙනුවේ ඇති **Extensions** -> **Apps Script** මත click කරන්න.
3. එහි දැනට ඇති සියලුම code මකා දමා, අපගේ project එකේ `backend/Code.gs` ගොනුවේ ඇති සම්පූර්ණ code එක copy කර paste කරන්න.
4. `Code.gs` හි ඉහළ ඇති configuration කොටසේ:
   - `TELEGRAM_BOT_TOKEN`: ඔබගේ Telegram Bot Token එක ලබා දෙන්න.
   - `TELEGRAM_BIO_CHAT_ID`: Biology Telegram Group ID එක.
   - `TELEGRAM_CHEM_CHAT_ID`: Chemistry Telegram Group ID එක.
   - `TELEGRAM_PHY_CHAT_ID`: Physics Telegram Group ID එක.
   - `SUBMISSIONS_FOLDER_ID`: (Optional) ඔබගේ External Drive Submissions Folder ID එක.
   - `QUESTION_PAPERS_FOLDER_ID`: (Optional) ඔබගේ External Drive Question Papers Folder ID එක.
5. ඉහළ දකුණු කෙලවරේ ඇති **Deploy** -> **New deployment** මත click කරන්න:
   - **Select type**: Web app
   - **Description**: `Bunny Notes API v2.1`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(ඉතා වැදගත් - Anyone ලෙස තෝරන්න)*
   - **Deploy** click කර Permissions Authorize කරන්න.
6. Deployment සාර්ථක වූ පසු ලැබෙන **Web App URL** එක copy කරගන්න.

---

## 🤖 පියවර 2: Telegram Bot සහ Subject Groups 3 සකසා ගැනීම

1. Telegram හි `@BotFather` වෙත ගොස් `/newbot` මඟින් Bot එකක් සාදා එහි **HTTP API Token** එක ලබාගන්න.
2. Telegram හි Groups 3ක් සාදන්න:
   - **Bunny Notes - Biology Submissions**
   - **Bunny Notes - Chemistry Submissions**
   - **Bunny Notes - Physics Submissions**
3. මෙම Groups 3ටම ඔබ සාදාගත් Bot ව Admin කෙනෙකු ලෙස Add කරන්න.
4. Group IDs ලබා ගැනීමට: Group එකට message එකක් යවා Telegram හි `@userinfobot` හෝ `@ShowJsonBot` මඟින් Chat ID එක (e.g. `-100123456789`) ලබාගන්න.
5. Owner Settings වෙත ගොස් මෙම Chat IDs 3 ඇතුළත් කර Test Alerts යවා පරීක්ෂා කරන්න.

---

## 🚀 පියවර 3: GitHub සහ Vercel වෙත Push කිරීම

```bash
git add .
git commit -m "Update Bunny Notes: External Google Drive folder IDs support"
git push -u origin main
```
