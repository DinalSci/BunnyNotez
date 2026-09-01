import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AdminMarksManager } from './AdminMarksManager';
import { AdminPapersManager } from './AdminPapersManager';
import { AdminStudentsDirectory } from './AdminStudentsDirectory';
import { AdminSettings } from './AdminSettings';
import { 
  Award, 
  FileText, 
  Users, 
  Settings, 
  ShieldCheck,
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export const AdminPortal = () => {
  const { currentUser } = useAuth();
  const [adminSubTab, setAdminSubTab] = useState('marks');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const adminData = api.getAdminPortalData(currentUser);
  const { students, admins, papers, marks, submissions, isOwner } = adminData;

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Nav items: only include settings if user is the OWNER
  const navItems = [
    { id: 'marks', label: 'Marks & Evaluations', icon: Award, count: submissions.filter(s => s.status === 'Pending Marking').length },
    { id: 'papers', label: 'Paper Management', icon: FileText, count: papers.filter(p => p.status === 'active').length },
    { id: 'students', label: 'Student Directory', icon: Users, count: students.length },
    ...(isOwner ? [{ id: 'settings', label: 'Owner Cloud & Telegram Config', icon: Settings }] : [])
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Admin Top Dashboard Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/90 shadow-md relative overflow-hidden bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-sky-500/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 
                {isOwner ? '👑 Owner Portal' : currentUser?.role === 'super_admin' ? '🌟 Super Admin Portal (All Subjects)' : `📚 ${currentUser?.subject} Specialized Admin Portal`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
              Bunny Notes Administration Portal
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isOwner 
                ? 'Manage all subject papers, students, marks evaluations and cloud Telegram connections.'
                : `Manage ${currentUser?.subject} question papers, mark submissions and update student feedback.`
              }
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center space-x-3">
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 text-center min-w-[100px] shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Students</div>
              <div className="text-xl font-black text-slate-800">{students.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 text-center min-w-[100px] shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Submissions</div>
              <div className="text-xl font-black text-emerald-600">{submissions.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 text-center min-w-[100px] shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Active Papers</div>
              <div className="text-xl font-black text-sky-600">
                {papers.filter(p => p.status === 'active').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAdminSubTab(item.id)}
              className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Sub-Tab Views */}
      <div className="transition-all duration-300">
        {adminSubTab === 'marks' && (
          <AdminMarksManager
            students={students}
            papers={papers}
            marks={marks}
            submissions={submissions}
            currentAdmin={currentUser}
            onRefresh={handleRefresh}
          />
        )}

        {adminSubTab === 'papers' && (
          <AdminPapersManager
            papers={papers}
            currentAdmin={currentUser}
            onRefresh={handleRefresh}
          />
        )}

        {adminSubTab === 'students' && (
          <AdminStudentsDirectory
            students={students}
            marks={marks}
            submissions={submissions}
          />
        )}

        {adminSubTab === 'settings' && isOwner && (
          <AdminSettings
            admins={admins}
            onRefresh={handleRefresh}
          />
        )}
      </div>

    </div>
  );
};
