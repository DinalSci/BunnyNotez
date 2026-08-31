import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { StudentDashboard } from './components/StudentDashboard';
import { SubjectView } from './components/SubjectView';
import { AdminPortal } from './components/AdminPortal';
import { Sparkles, Heart } from 'lucide-react';

const MainLayout = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Background Decorative Glow Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-teal-200/25 rounded-full blur-3xl" />
      </div>

      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentUser.role === 'admin' ? (
            <AdminPortal />
          ) : (
            <>
              {activeTab === 'dashboard' && <StudentDashboard setActiveTab={setActiveTab} />}
              {activeTab === 'biology' && <SubjectView subject="Biology" />}
              {activeTab === 'chemistry' && <SubjectView subject="Chemistry" />}
              {activeTab === 'physics' && <SubjectView subject="Physics" />}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-emerald-100/60 bg-white/40 backdrop-blur-md py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="text-base">🐰</span>
            <span className="font-bold text-slate-700">Bunny Notes Study Group</span>
            <span>• Biology, Chemistry & Physics Paper Portal</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Powered by Google Sheets & Apps Script</span>
            <span>•</span>
            <span className="font-semibold text-emerald-700">2026 A/L Batch</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
