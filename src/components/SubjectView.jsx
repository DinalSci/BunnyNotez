import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getGradeColor } from '../data/mockData';
import {
  Download,
  Upload,
  FileCheck,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Send,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import confetti from 'canvas-confetti';

export const SubjectView = ({ subject }) => {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    api.syncPortalData().then(res => {
      if (mounted && res) {
        setSyncVersion(v => v + 1);
      }
    });
    return () => { mounted = false; };
  }, [subject]);

  // Fetch student subject data
  const portalData = api.getStudentPortalData(currentUser?.index_no);
  const { subjectStats, papers, studentMarks, studentSubmissions } = portalData;

  const currentStat = subjectStats[subject] || {};
  const currentSubjectMarks = studentMarks.filter(m => m.subject.toLowerCase() === subject.toLowerCase());
  const activePaper = papers.find(p => 
    p.subject?.toLowerCase() === subject.toLowerCase() && 
    (p.status || '').toString().trim().toLowerCase() === 'active'
  );
  const pastPapers = papers.filter(p => 
    p.subject?.toLowerCase() === subject.toLowerCase() && 
    (p.status || '').toString().trim().toLowerCase() !== 'active'
  );

  const hasSubmittedActive = activePaper
    ? studentSubmissions.some(s => s.paper_id === activePaper.id)
    : false;

  const currentSubmission = activePaper
    ? studentSubmissions.find(s => s.paper_id === activePaper.id)
    : null;

  // Chart data for marks progression
  const chartData = currentSubjectMarks
    .slice()
    .reverse()
    .map((m, idx) => ({
      name: `P${idx + 1}`,
      paper: m.paper_name,
      mark: m.score,
      grade: m.grade
    }));

  // Subject theme styling
  const subjectThemes = {
    biology: {
      accent: '#10b981',
      bgGradient: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      heroBg: 'from-emerald-500/10 via-teal-500/5 to-transparent'
    },
    chemistry: {
      accent: '#06b6d4',
      bgGradient: 'from-cyan-500 to-sky-600',
      badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      heroBg: 'from-cyan-500/10 via-sky-500/5 to-transparent'
    },
    physics: {
      accent: '#0ea5e9',
      bgGradient: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
      heroBg: 'from-sky-500/10 via-blue-500/5 to-transparent'
    }
  };

  const theme = subjectThemes[subject.toLowerCase()] || subjectThemes.biology;

  // Handle Answer Paper Submission
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMessage('Please select a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handleSubmitPaper = async () => {
    if (!selectedFile || !activePaper) {
      setErrorMessage('Please select your answer paper PDF to submit.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setUploadSuccess(null);

    try {
      // Convert file to Base64 data URL for preview and GAS upload
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileDataUrl = event.target.result;
        
        const result = await api.submitAnswerPaper({
          index_no: currentUser.index_no,
          student_name: currentUser.name,
          subject: subject,
          paper_id: activePaper.id,
          paper_name: activePaper.paper_name,
          file: selectedFile,
          fileDataUrl
        });

        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });

        setUploadSuccess({
          fileName: result.formattedFileName,
          telegramSent: result.telegramSent
        });
        setSelectedFile(null);
        setUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit answer paper.');
      setUploading(false);
    }
  };

  // Preview formatted filename
  const previewFormattedName = activePaper
    ? `${subject}_${activePaper.paper_name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${currentUser?.index_no}.pdf`
    : '';

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Subject Header Banner */}
      <div className={`glass-panel p-6 sm:p-8 rounded-3xl border border-white/90 shadow-md relative overflow-hidden bg-gradient-to-r ${theme.heroBg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${theme.badgeBg}`}>
                {subject} Special Section
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentUser?.index_no}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
              {subject} Paper & Progress Portal
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Download latest model/speed papers, upload written answer scripts, and track your grade progression.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center space-x-3">
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Average Score</div>
              <div className="text-2xl font-black text-slate-800">
                {currentStat?.averageScore !== null ? `${currentStat.averageScore}%` : 'N/A'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm text-center min-w-[100px]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Current Grade</div>
              <div className="text-2xl font-black text-emerald-600">
                {currentStat?.currentGrade || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Ongoing Paper / Submission & Marks Trend Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Ongoing Paper Download & Submission (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Question Paper Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  📄
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Ongoing Question Paper</h3>
                  <p className="text-xs text-slate-500">Official study group examination paper</p>
                </div>
              </div>

              {activePaper && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold font-mono">
                  LIVE
                </span>
              )}
            </div>

            {activePaper ? (
              <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{activePaper.paper_name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{activePaper.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" /> Deadline: <strong className="text-slate-700">{activePaper.deadline}</strong>
                  </span>
                  <span>Max Marks: {activePaper.max_marks}</span>
                </div>

                <div className="pt-2">
                  <a
                    href={activePaper.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition transform active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Question Paper PDF</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium">No active ongoing paper for {subject} at this moment.</p>
              </div>
            )}
          </div>

          {/* Answer Paper Submission Section */}
          {activePaper && (
            <div className="glass-panel p-6 rounded-3xl border border-white/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-base">Submit Your Written Answer Paper</h3>
                </div>
                {hasSubmittedActive && (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paper Submitted
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500">
                Upload your scanned/written answer script in PDF format. The system automatically renames it to match your index number:
              </p>

              {/* Automatic Filename Preview Box */}
              <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs flex items-center justify-between font-mono">
                <span className="text-slate-500">Target Filename:</span>
                <span className="font-bold text-emerald-700 break-all">{previewFormattedName}</span>
              </div>

              {/* Upload Drop Zone / Input */}
              <div className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition bg-emerald-50/30 rounded-2xl p-6 text-center">
                <input
                  type="file"
                  id="paper-pdf-upload"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="paper-pdf-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
                    📁
                  </div>
                  <div>
                    <span className="text-sm font-bold text-emerald-700 hover:underline">
                      {selectedFile ? selectedFile.name : 'Click to select answer PDF'}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB PDF selected` : 'Maximum file size: 25MB'}
                    </p>
                  </div>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Answer Paper Uploaded Successfully!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Saved as: <code className="font-bold">{uploadSuccess.fileName}</code>
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    ✅ Dispatched to Admin Google Drive & Telegram group alert sent!
                  </p>
                </div>
              )}

              {/* Submit Action Button */}
              <button
                type="button"
                onClick={handleSubmitPaper}
                disabled={uploading || !selectedFile}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-sm text-white transition flex items-center justify-center space-x-2 ${
                  uploading || !selectedFile
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 shadow-lg shadow-emerald-500/25 active:scale-98'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Uploading & Renaming...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{hasSubmittedActive ? 'Update / Re-upload Answer Paper' : 'Submit Answer Paper'}</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Marks Progression Chart & Subject Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Progress Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-base">{subject} Marks Trend</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Score / 100</span>
            </div>

            {chartData.length > 0 ? (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${subject}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.accent} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={theme.accent} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white/95 backdrop-blur p-3 rounded-2xl shadow-xl border border-slate-200 text-xs">
                              <p className="font-bold text-slate-800">{data.paper}</p>
                              <p className="text-emerald-600 font-bold mt-0.5">
                                Score: {data.mark}% (Grade {data.grade})
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mark"
                      stroke={theme.accent}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill={`url(#grad-${subject})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic">
                No marks recorded yet for {subject}.
              </div>
            )}
          </div>

          {/* Quick Grading Scale Guide */}
          <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 text-xs space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">A/L Grade Scale</span>
            <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
              <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200 font-bold text-emerald-800">
                A (75+)
              </div>
              <div className="p-1.5 bg-sky-50 rounded-lg border border-sky-200 font-bold text-sky-800">
                B (65+)
              </div>
              <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 font-bold text-amber-800">
                C (50+)
              </div>
              <div className="p-1.5 bg-indigo-50 rounded-lg border border-indigo-200 font-bold text-indigo-800">
                S (35+)
              </div>
              <div className="p-1.5 bg-rose-50 rounded-lg border border-rose-200 font-bold text-rose-800">
                F (&lt;35)
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Paperwise Marks & Evaluated Papers History Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>{subject} Evaluated Papers & Marks History</span>
            </h3>
            <p className="text-xs text-slate-500">
              View marked results, ranks, evaluator feedback, and download marked PDF scripts.
            </p>
          </div>
        </div>

        {currentSubjectMarks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Paper Name</th>
                  <th className="py-3 px-4">Evaluated Date</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-center">Group Rank</th>
                  <th className="py-3 px-4">Tutor Feedback</th>
                  <th className="py-3 px-4 text-right">Marked PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentSubjectMarks.map((m) => (
                  <tr key={m.id} className="hover:bg-white/60 transition">
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {m.paper_name}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono">
                      {m.evaluated_at}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-extrabold text-sm text-slate-800 font-mono">
                        {m.score}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-xl font-bold font-mono border ${getGradeColor(m.grade)}`}>
                        {m.grade}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-lg font-mono">
                        #{m.rank || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 italic max-w-xs truncate">
                      "{m.feedback}"
                    </td>
                    <td className="py-4 px-4 text-right">
                      {m.marked_paper_url ? (
                        <a
                          href={m.marked_paper_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold transition shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Marked PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not Uploaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 italic">
            No evaluated papers found for {subject} yet.
          </div>
        )}
      </div>

    </div>
  );
};
