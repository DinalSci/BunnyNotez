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
  Link2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminSettings = ({ admins, onRefresh }) => {
  const initialConfig = getConfig();
  
  const [apiUrl, setApiUrl] = useState(initialConfig.apiUrl || '');
  const [telegramBotToken, setTelegramBotToken] = useState(initialConfig.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(initialConfig.telegramChatId || '');
  const [isLiveMode, setIsLiveMode] = useState(initialConfig.isLiveMode || false);
  const [autoTelegramAlerts, setAutoTelegramAlerts] = useState(initialConfig.autoTelegramAlerts !== false);

  const [testStatus, setTestStatus] = useState({ loading: false, msg: '', error: false });
  const [saveStatus, setSaveStatus] = useState('');

  // New admin form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSubject, setAdminSubject] = useState('All');
  const [adminMsg, setAdminMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveConfig({
      apiUrl: apiUrl.trim(),
      telegramBotToken: telegramBotToken.trim(),
      telegramChatId: telegramChatId.trim(),
      isLiveMode,
      autoTelegramAlerts
    });

    setSaveStatus('Settings successfully saved to local environment!');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const handleTestTelegram = async () => {
    setTestStatus({ loading: true, msg: '', error: false });
    try {
      await api.testTelegram(telegramBotToken.trim(), telegramChatId.trim());
      confetti({ particleCount: 50, spread: 60 });
      setTestStatus({ loading: false, msg: '✅ Test message delivered to your Telegram chat successfully!', error: false });
    } catch (err) {
      setTestStatus({ loading: false, msg: `❌ ${err.message}`, error: true });
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
      setAdminMsg(`Admin account created for ${adminName}!`);
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
      
      {/* Google Apps Script & Telegram Bot Configuration */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Google Apps Script & Telegram Cloud Connection</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect your Google Sheet backend endpoint and Telegram Bot for automated student submissions & alerts.
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
            <p className="text-[11px] text-slate-400 mt-1">
              Deploy your <code>backend/Code.gs</code> as Web App (Access: Anyone) and paste URL here.
            </p>
          </div>

          {/* Telegram Bot Token & Chat ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-sky-600" />
                <span>Telegram Bot Token</span>
              </label>
              <input
                type="text"
                placeholder="7123456789:AAFx..."
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-600" />
                <span>Telegram Group / Chat ID</span>
              </label>
              <input
                type="text"
                placeholder="-100123456789 or @yourchannel"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus.msg && (
            <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              testStatus.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {testStatus.error ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
              <span>{testStatus.msg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testStatus.loading || !telegramBotToken || !telegramChatId}
              className="px-4 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testStatus.loading ? 'Sending Test...' : 'Send Test Telegram Alert'}</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Admin Management & Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Create New Admin Form (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Create New Admin Account</span>
            </h3>
            <p className="text-xs text-slate-500">Add subject teachers / moderators with admin permissions.</p>
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
                placeholder="e.g. Kasun Chamara (Sir)"
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
                placeholder="kasun.bio@bunnynotes.com"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Focus</label>
                <select
                  value={adminSubject}
                  onChange={(e) => setAdminSubject(e.target.value)}
                  className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800"
                >
                  <option value="All">All Subjects</option>
                  <option value="Biology">Biology</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition"
            >
              Add Admin Account
            </button>
          </form>
        </div>

        {/* Existing Admins List (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/80 space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Active Admin Accounts ({admins.length})</span>
          </h3>

          <div className="space-y-2.5">
            {admins.map((adm) => (
              <div key={adm.admin_id} className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{adm.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{adm.email}</div>
                </div>
                <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 font-bold rounded-lg text-[10px]">
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
