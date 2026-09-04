import React, { useState } from 'react';
import { api } from '../services/api';
import { calculateGrade, getGradeColor } from '../data/mockData';
import { 
  Award, 
  CheckCircle2, 
  Upload, 
  User, 
  FileText, 
  ExternalLink, 
  Search,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminMarksManager = ({ students, papers, marks, submissions, currentAdmin, onRefresh }) => {
  const isOwner = currentAdmin?.role === 'owner' || currentAdmin?.subject === 'All';
  const adminSubject = currentAdmin?.subject || 'Biology';

  const [selectedIndex, setSelectedIndex] = useState(students[0]?.index_no || '');
  const [selectedSubject, setSelectedSubject] = useState(isOwner ? 'Biology' : adminSubject);
  const [selectedPaperId, setSelectedPaperId] = useState(papers[0]?.id || '');
  const [score, setScore] = useState('');
  const [markedPaperUrl, setMarkedPaperUrl] = useState('');
  const [markedPdfFile, setMarkedPdfFile] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const currentStudent = students.find(s => s.index_no === selectedIndex);
  const currentPaper = papers.find(p => p.id === selectedPaperId);
  const filteredPapers = papers.filter(p => p.subject.toLowerCase() === selectedSubject.toLowerCase());

  // Submissions pending marking for this admin's subject
  const pendingSubmissions = submissions.filter(s => {
    const isPending = s.status === 'Pending Marking';
    if (isOwner) return isPending;
    return isPending && s.subject.toLowerCase() === adminSubject.toLowerCase();
  });

  const handleQuickEvaluateSubmission = (sub) => {
    setSelectedIndex(sub.index_no);
    setSelectedSubject(sub.subject);
    setSelectedPaperId(sub.paper_id);
    setScore('');
    setFeedback(`Evaluation for ${sub.paper_name}.`);
    setMarkedPaperUrl('');
    setMarkedPdfFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkedPdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMarkedPdfFile(e.target.files[0]);
    }
  };

  const handleSaveMark = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!score || isNaN(score) || Number(score) < 0 || Number(score) > 100) {
      setErrorMsg('Please enter a valid score between 0 and 100.');
      return;
    }

    if (!currentStudent || !currentPaper) {
      setErrorMsg('Please select a valid student and paper.');
      return;
    }

    setLoading(true);

    try {
      let finalMarkedUrl = markedPaperUrl.trim();

      if (markedPdfFile) {
        const fileDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(markedPdfFile);
        });
        finalMarkedUrl = fileDataUrl;
      }

      await api.saveMark({
        index_no: selectedIndex,
        student_name: currentStudent.name,
        subject: isOwner ? selectedSubject : adminSubject,
        paper_id: selectedPaperId,
        paper_name: currentPaper.paper_name,
        score: Number(score),
        marked_paper_url: finalMarkedUrl,
        feedback: feedback.trim()
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSuccessMsg(`Marks & Marked PDF successfully saved for ${currentStudent.name} (${selectedIndex})!`);
      setScore('');
      setFeedback('');
      setMarkedPaperUrl('');
      setMarkedPdfFile(null);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save marks.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Pending Submissions Queue */}
      {pendingSubmissions.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-slate-800 text-base">
                Pending Submissions Queue ({pendingSubmissions.length} waiting for evaluation)
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-semibold">Click 'Evaluate' to populate form</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingSubmissions.map((sub) => (
              <div key={sub.id} className="p-3.5 bg-white/90 rounded-2xl border border-amber-200/60 shadow-sm flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-slate-800">{sub.student_name} ({sub.index_no})</span>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">{sub.subject}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">{sub.file_name}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <a
                    href={sub.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> View Submitted PDF
                  </a>
                  <button
                    onClick={() => handleQuickEvaluateSubmission(sub)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Evaluate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marks & Marked Paper Upload Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Evaluation Form (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Enter Student Marks & Upload Marked PDF</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Grade (A: 75+, B: 65+, C: 50+, S: 35+) is calculated automatically.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveMark} className="space-y-4">
            
            {/* Student Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Student</label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
              >
                {students.length > 0 ? (
                  students.map((s) => (
                    <option key={s.index_no} value={s.index_no}>
                      {s.name} ({s.index_no}) - {s.batch || '2027 A/L'}
                    </option>
                  ))
                ) : (
                  <option value="">No registered students found</option>
                )}
              </select>
            </div>

            {/* Subject & Paper Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                {isOwner ? (
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      const subPapers = papers.filter(p => p.subject.toLowerCase() === e.target.value.toLowerCase());
                      if (subPapers.length > 0) setSelectedPaperId(subPapers[0].id);
                    }}
                    className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={adminSubject}
                    className="w-full p-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-sm text-slate-700 font-bold"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Paper</label>
                <select
                  value={selectedPaperId}
                  onChange={(e) => setSelectedPaperId(e.target.value)}
                  className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
                >
                  {filteredPapers.length > 0 ? (
                    filteredPapers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.paper_name}
                      </option>
                    ))
                  ) : (
                    <option value="">No papers available for this subject</option>
                  )}
                </select>
              </div>
            </div>

            {/* Score & Calculated Grade */}
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Score (out of 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 85"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800 font-bold"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between h-[42px] px-4">
                <span className="text-xs text-slate-500 font-medium">Grade (50+ is C):</span>
                <span className={`px-2.5 py-0.5 rounded-xl text-xs font-black border ${getGradeColor(calculateGrade(score))}`}>
                  Grade {calculateGrade(score)}
                </span>
              </div>
            </div>

            {/* Direct Upload Evaluated PDF File */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload Marked / Evaluated PDF
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-2xl p-3 text-center bg-slate-50/50">
                <input
                  type="file"
                  id="marked-pdf-file"
                  accept="application/pdf"
                  onChange={handleMarkedPdfChange}
                  className="hidden"
                />
                <label htmlFor="marked-pdf-file" className="cursor-pointer text-xs font-semibold text-emerald-700">
                  {markedPdfFile ? `Selected: ${markedPdfFile.name}` : 'Click to select evaluated marked PDF'}
                </label>
              </div>
            </div>

            {/* Or Shareable Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Or Marked PDF Google Drive Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/.../view"
                value={markedPaperUrl}
                onChange={(e) => setMarkedPaperUrl(e.target.value)}
                className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800 font-mono"
              />
            </div>

            {/* Tutor Feedback Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Feedback & Correction Notes</label>
              <textarea
                placeholder="e.g. Good structured answers! Focus more on Unit 02 definitions."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition active:scale-98 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Marks & Publish Evaluated PDF'}</span>
            </button>
          </form>
        </div>

        {/* Recently Recorded Marks List (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/80">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Recently Recorded Marks ({marks.length})</span>
            </h4>

            {marks.length > 0 ? (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {marks.slice(0, 8).map((m) => (
                  <div key={m.id} className="p-3 bg-white/80 rounded-2xl border border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{m.student_name} <span className="font-mono text-slate-400">({m.index_no})</span></div>
                      <div className="text-[11px] text-slate-500">{m.subject} • {m.paper_name.slice(0, 20)}...</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-800">{m.score}%</div>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${getGradeColor(m.grade)}`}>
                        Grade {m.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs italic">
                No marks recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
