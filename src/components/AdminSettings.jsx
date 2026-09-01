import React, { useState } from 'react';
import { api, getConfig, saveConfig } from '../services/api';
import { 
  Settings, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  Database, 
  UserPlus, 
  ShieldCheck,
  Sparkles,
  Link2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminSettings = ({ admins, onRefresh }) => {
  const initialConfig = getConfig();
  
  const [apiUrl, setApiUrl] = useState(initialConfig.apiUrl || '');
  const [telegramBotToken, setTelegramBotToken] = useState(initialConfig.telegramBotToken || '');
  const [telegramBioChatId, setTelegramBioChatId] = useState(initialConfig.telegramBioChatId || '');
  const [telegramChemChatId, setTelegramChemChatId] = useState(initialConfig.telegramChemChatId || '');
  const [telegramPhyChatId, setTelegramPhyChatId] = useState(initialConfig.telegramPhyChatId || '');
  const [isLiveMode, setIsLiveMode] = useState(initialConfig.isLiveMode || false);
  const [autoTelegramAlerts, setAutoTelegramAlerts] = useState(initialConfig.autoTelegramAlerts !== false);

  const [testBioStatus, setTestBioStatus] = useState({ loading: false, msg: '', error: false });
  const [testChemStatus, setTestChemStatus] = useState({ loading: false, msg: '', error: false });
  const [testPhyStatus, setTestPhyStatus] = useState({ loading: false, msg: '', error: false });
  const [saveStatus, setSaveStatus] = useState('');

  // New admin form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSubject, setAdminSubject] = useState('Biology');
  const [adminMsg, setAdminMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveConfig({
      apiUrl: apiUrl.trim(),
      telegramBotToken: telegramBotToken.trim(),
      telegramBioChatId: telegramBioChatId.trim(),
      telegramChemChatId: telegramChemChatId.trim(),
      telegramPhyChatId: telegramPhyChatId.trim(),
      isLiveMode,
      autoTelegramAlerts
    });

    setSaveStatus('Owner settings successfully saved!');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const handleTestGroup = async (subject, chatId, setStatus) => {
    setStatus({ loading: true, msg: '', error: false });
    try {
      await api.testTelegramGroup(telegramBotToken.trim(), chatId.trim(), subject);
      confetti({ particleCount: 40, spread: 50 });
      setStatus({ loading: false, msg: `✅ ${subject} group alert delivered successfully!`, error: false });
    } catch (err) {
      setStatus({ loading: false, msg: `❌ ${err.message}`, error: true });
    }
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    setAdminMsg('');
    try {
      if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
        throw new Error('Please fill in all admin fields.');
      }
      api.createAdmin({
        name: adminName.trim(),
        email: adminEmail.trim(),
        password: adminPassword.trim(),
        subject: adminSubject
      });
      setAdminMsg(`Admin account created for ${adminName} (${adminSubject})!`);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      onRefresh();
    } catch (err) {
      setAdminMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Owner Only Notice Banner */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-3xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            👑
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-900">Owner Exclusive Control Center</div>
            <div className="text-[11px] text-emerald-700">Only the study group owner can configure cloud backend & Telegram groups.</div>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-emerald-200 text-emerald-900 text-xs font-bold rounded-xl font-mono">
          OWNER ACCESS
        </span>
      </div>

      {/* Google Apps Script & 3 Telegram Groups Configuration */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Google Apps Script & 3 Subject Telegram Groups</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Student submissions will be automatically routed to their corresponding subject group (Biology, Chemistry, Physics).
          </p>
        </div>

        {saveStatus && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-5">
          
          {/* Mode Switcher */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">Connection Mode</div>
              <div className="text-[11px] text-slate-500">
                {isLiveMode ? 'Active: Live Google Apps Script API' : 'Active: High-speed Local / Offline Mock Mode'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isLiveMode}
                onChange={(e) => setIsLiveMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Apps Script Endpoint URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Google Apps Script Web App URL</span>
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800 font-mono"
            />
          </div>

          {/* Shared Telegram Bot Token */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-sky-600" />
              <span>Telegram Bot Token (from @BotFather)</span>
            </label>
            <input
              type="text"
              placeholder="7123456789:AAFx..."
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
              className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800 font-mono"
            />
          </div>

          {/* 3 Subject Telegram Groups Grid */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Subject Telegram Groups Configuration
            </h4>

            {/* Biology Group */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  🧬 Biology Telegram Group ID
                </span>
                <button
                  type="button"
                  onClick={() => handleTestGroup('Biology', telegramBioChatId, setTestBioStatus)}
                  disabled={!telegramBotToken || !telegramBioChatId || testBioStatus.loading}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition disabled:opacity-40"
                >
                  {testBioStatus.loading ? 'Testing...' : 'Test Bio Alert'}
                </button>
              </div>
              <input
                type="text"
                placeholder="-100123456789 (Biology Chat ID)"
                value={telegramBioChatId}
                onChange={(e) => setTelegramBioChatId(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs font-mono"
              />
              {testBioStatus.msg && (
                <div className={`text-[11px] font-semibold ${testBioStatus.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {testBioStatus.msg}
                </div>
              )}
            </div>

            {/* Chemistry Group */}
            <div className="p-4 bg-cyan-50/50 rounded-2xl border border-cyan-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-800 flex items-center gap-1.5">
                  🧪 Chemistry Telegram Group ID
                </span>
                <button
                  type="button"
                  onClick={() => handleTestGroup('Chemistry', telegramChemChatId, setTestChemStatus)}
                  disabled={!telegramBotToken || !telegramChemChatId || testChemStatus.loading}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-[11px] font-bold transition disabled:opacity-40"
                >
                  {testChemStatus.loading ? 'Testing...' : 'Test Chem Alert'}
                </button>
              </div>
              <input
                type="text"
                placeholder="-100987654321 (Chemistry Chat ID)"
                value={telegramChemChatId}
                onChange={(e) => setTelegramChemChatId(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs font-mono"
              />
              {testChemStatus.msg && (
                <div className={`text-[11px] font-semibold ${testChemStatus.error ? 'text-rose-600' : 'text-cyan-700'}`}>
                  {testChemStatus.msg}
                </div>
              )}
            </div>

            {/* Physics Group */}
            <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                  ⚛️ Physics Telegram Group ID
                </span>
                <button
                  type="button"
                  onClick={() => handleTestGroup('Physics', telegramPhyChatId, setTestPhyStatus)}
                  disabled={!telegramBotToken || !telegramPhyChatId || testPhyStatus.loading}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[11px] font-bold transition disabled:opacity-40"
                >
                  {testPhyStatus.loading ? 'Testing...' : 'Test Physics Alert'}
                </button>
              </div>
              <input
                type="text"
                placeholder="-100554433221 (Physics Chat ID)"
                value={telegramPhyChatId}
                onChange={(e) => setTelegramPhyChatId(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs font-mono"
              />
              {testPhyStatus.msg && (
                <div className={`text-[11px] font-semibold ${testPhyStatus.error ? 'text-rose-600' : 'text-sky-700'}`}>
                  {testPhyStatus.msg}
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
            >
              Save Cloud Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Admin Management & Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Create Subject Admin (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Create Subject Admin Account</span>
            </h3>
            <p className="text-xs text-slate-500">Each admin will only see papers & marks for their assigned subject.</p>
          </div>

          {adminMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
              {adminMsg}
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Full Name</label>
              <input
                type="text"
                placeholder="e.g. Danushka Sir"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
                className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="danushka.bio@bunnynotes.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Subject</label>
                <select
                  value={adminSubject}
                  onChange={(e) => setAdminSubject(e.target.value)}
                  className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800 font-bold"
                >
                  <option value="Biology">Biology Admin</option>
                  <option value="Chemistry">Chemistry Admin</option>
                  <option value="Physics">Physics Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition"
            >
              Add Subject Admin Account
            </button>
          </form>
        </div>

        {/* Existing Admins List (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/80 space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Active Administrators ({admins.length})</span>
          </h3>

          <div className="space-y-2.5">
            {admins.map((adm) => (
              <div key={adm.admin_id} className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    {adm.name}
                    {adm.role === 'owner' && <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">OWNER</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{adm.email}</div>
                </div>
                <span className={`px-2.5 py-0.5 font-bold rounded-lg text-[10px] ${
                  adm.subject === 'Biology' ? 'bg-emerald-100 text-emerald-800' :
                  adm.subject === 'Chemistry' ? 'bg-cyan-100 text-cyan-800' :
                  adm.subject === 'Physics' ? 'bg-sky-100 text-sky-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {adm.subject || 'All Subjects'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
