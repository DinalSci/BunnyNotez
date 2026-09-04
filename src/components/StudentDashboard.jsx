import React from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getGradeColor } from '../data/mockData';
import {
  Dna,
  FlaskConical,
  Atom,
  TrendingUp,
  Award,
  FileText,
  Download,
  Upload,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

export const StudentDashboard = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const portalData = api.getStudentPortalData(currentUser?.index_no);

  const { subjectStats, papers, studentMarks, studentSubmissions } = portalData;

  const subjectsConfig = [
    {
      id: 'biology',
      name: 'Biology',
      icon: Dna,
      color: 'emerald',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-500 text-white',
      accentColor: '#10b981',
      stat: subjectStats['Biology']
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      icon: FlaskConical,
      color: 'cyan',
      bgGradient: 'from-cyan-500/10 to-sky-500/10',
      borderColor: 'border-cyan-200',
      iconBg: 'bg-cyan-500 text-white',
      accentColor: '#06b6d4',
      stat: subjectStats['Chemistry']
    },
    {
      id: 'physics',
      name: 'Physics',
      icon: Atom,
      color: 'sky',
      bgGradient: 'from-sky-500/10 to-blue-500/10',
      borderColor: 'border-sky-200',
      iconBg: 'bg-sky-500 text-white',
      accentColor: '#0ea5e9',
      stat: subjectStats['Physics']
    }
  ];

  // Prepare comparison chart data across 3 subjects dynamically
  const comparisonData = [];
  const bioMarks = studentMarks.filter(m => m.subject.toLowerCase() === 'biology').sort((a, b) => a.id.localeCompare(b.id));
  const chemMarks = studentMarks.filter(m => m.subject.toLowerCase() === 'chemistry').sort((a, b) => a.id.localeCompare(b.id));
  const phyMarks = studentMarks.filter(m => m.subject.toLowerCase() === 'physics').sort((a, b) => a.id.localeCompare(b.id));

  const maxLen = Math.max(bioMarks.length, chemMarks.length, phyMarks.length);

  for (let i = 0; i < maxLen; i++) {
    comparisonData.push({
      name: `Paper ${String(i + 1).padStart(2, '0')}`,
      Biology: bioMarks[i] ? Number(bioMarks[i].score) : null,
      Chemistry: chemMarks[i] ? Number(chemMarks[i].score) : null,
      Physics: phyMarks[i] ? Number(phyMarks[i].score) : null
    });
  }

  // Active ongoing papers across all subjects
  const activePapers = papers.filter(p => p.status === 'active');

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/90 shadow-lg shadow-emerald-500/5">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-gradient-to-tr from-emerald-400/20 to-sky-400/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100/90 text-emerald-800 text-xs font-bold rounded-full mb-3 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bunny Notes Student Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Ayubowan, <span className="gradient-text-mint">{currentUser?.name}</span>! 🐰
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Track your A/L marks progression in Biology, Chemistry, and Physics. Download ongoing papers, submit written answers, and view evaluated feedback.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-white/80 border border-emerald-100 shadow-sm text-center min-w-[130px]">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Index</div>
              <div className="text-xl font-extrabold font-mono text-emerald-600 mt-0.5">
                {currentUser?.index_no}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-sm text-center min-w-[130px]">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">A/L Target</div>
              <div className="text-xl font-extrabold font-mono text-sky-600 mt-0.5">
                3A Target
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Main Subject Performance Cards (Biology, Chemistry, Physics) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Subject Performance & Predicted Grades</span>
          </h2>
          <span className="text-xs text-slate-500">Click any card to open subject tab</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjectsConfig.map((sub) => {
            const Icon = sub.icon;
            const stat = sub.stat;
            const avg = stat?.averageScore;
            const grade = stat?.currentGrade || 'N/A';
            const gradeBadgeClass = getGradeColor(grade);

            return (
              <div
                key={sub.id}
                onClick={() => setActiveTab(sub.id)}
                className="glass-panel glass-panel-hover p-6 rounded-3xl cursor-pointer border border-white/80 relative overflow-hidden group"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl ${sub.iconBg} flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {stat?.totalPapers || 0} Papers Evaluated
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-xl text-sm font-black border ${gradeBadgeClass} shadow-sm inline-block`}>
                      Grade {grade}
                    </div>
                  </div>
                </div>

                {/* Score Stats */}
                <div className="mt-4 pt-4 border-t border-slate-100/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Average Mark</span>
                    <div className="text-2xl font-extrabold text-slate-800">
                      {avg !== null ? `${avg}%` : 'No Marks'}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium">Active Paper</span>
                    <div className="text-xs font-bold text-slate-700 mt-1">
                      {stat?.activePaper ? (
                        stat.hasSubmittedActive ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Ready
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ongoing Papers Quick Action Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" />
              <span>Ongoing Active Question Papers</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Download latest papers, write answers on paper/digital format, and submit PDF with auto-renaming.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activePapers.map((paper) => {
            const hasSubmitted = studentSubmissions.some(s => s.paper_id === paper.id);
            return (
              <div
                key={paper.id}
                className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md font-mono">
                      {paper.subject}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Deadline: {paper.deadline}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-2">
                    {paper.paper_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {paper.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={paper.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>

                  <button
                    onClick={() => setActiveTab(paper.subject.toLowerCase())}
                    className={`flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                      hasSubmitted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{hasSubmitted ? 'Submitted' : 'Submit Answer'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics & Comparative Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Comparison Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Multi-Subject Marks Progression</span>
              </h3>
              <p className="text-xs text-slate-500">Comparative marks across recent papers</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {comparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="Biology" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Chemistry" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Physics" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
                <TrendingUp className="w-8 h-8 opacity-20" />
                <span>No marks recorded yet. Complete a paper to see your progression!</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Teacher Evaluation & Feedback */}
        <div className="glass-panel p-6 rounded-3xl border border-white/80 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Latest Evaluator Feedback</span>
            </h3>

            {studentMarks.length > 0 ? (
              <div className="space-y-3">
                {studentMarks.slice(0, 3).map((m) => (
                  <div key={m.id} className="p-3.5 bg-white/70 rounded-2xl border border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{m.subject}</span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${getGradeColor(m.grade)}`}>
                        {m.score}% (Grade {m.grade})
                      </span>
                    </div>
                    <p className="text-slate-600 italic">"{m.feedback}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No feedback available yet.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              💡 Tip: Regularly download your evaluated PDF answer sheets to review tutor corrections!
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
