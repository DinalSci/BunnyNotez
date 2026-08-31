import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Dna, 
  FlaskConical, 
  Atom, 
  ShieldCheck, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles,
  Award
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStudent = currentUser?.role === 'student';
  const isAdmin = currentUser?.role === 'admin';

  const studentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'biology', label: 'Biology', icon: Dna, color: 'text-emerald-600' },
    { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: 'text-cyan-600' },
    { id: 'physics', label: 'Physics', icon: Atom, color: 'text-sky-600' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-sky-400 p-0.5 shadow-md shadow-emerald-200/50 flex items-center justify-center transform hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white/90 backdrop-blur rounded-[14px] flex items-center justify-center text-2xl">
                🐰
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                  Bunny Notes
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100/80 text-emerald-800 rounded-full border border-emerald-200">
                  Study Group
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">A/L Science Excellence Portal</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          {isStudent && (
            <nav className="hidden md:flex items-center space-x-1.5 bg-white/60 p-1.5 rounded-2xl border border-emerald-100 shadow-sm backdrop-blur-md">
              {studentTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 font-semibold'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color || 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {isAdmin && (
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-sky-50 rounded-xl border border-teal-200/60 text-teal-800 text-sm font-semibold shadow-sm">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Admin Management Portal</span>
            </div>
          )}

          {/* User Profile & Badge */}
          <div className="hidden md:flex items-center space-x-4">
            {isStudent && (
              <div className="flex items-center space-x-3 bg-emerald-50/80 border border-emerald-200/80 py-1.5 px-3.5 rounded-2xl shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                  {currentUser?.name?.charAt(0) || 'S'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {currentUser?.name}
                    <span className="px-1.5 py-0.2 bg-emerald-200/80 text-emerald-900 font-mono text-[11px] rounded font-bold">
                      {currentUser?.index_no}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    {currentUser?.batch || '2026 A/L'} Batch
                  </div>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="flex items-center space-x-2 bg-sky-50 border border-sky-200 py-1.5 px-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">{currentUser?.name}</div>
                  <div className="text-[10px] text-sky-700 font-semibold uppercase">{currentUser?.subject || 'All Subjects'}</div>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              title="Logout"
              className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {isStudent && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-900 font-mono text-xs font-bold rounded-lg">
                {currentUser?.index_no}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-emerald-50 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-100 bg-white/95 backdrop-blur-xl rounded-b-3xl shadow-xl px-2 space-y-2 animate-fadeIn">
            {isStudent && (
              <div className="p-3 bg-emerald-50/70 rounded-2xl mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Logged in as</p>
                  <p className="font-bold text-slate-800 text-sm">{currentUser?.name}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg shadow-sm">
                  {currentUser?.index_no}
                </span>
              </div>
            )}

            {isStudent && studentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold'
                      : 'text-slate-700 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 font-medium text-sm transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
