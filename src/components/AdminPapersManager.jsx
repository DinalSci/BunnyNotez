import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  FileText, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock,
  Upload,
  Calendar,
  Sparkles
} from 'lucide-react';

export const AdminPapersManager = ({ papers, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [subject, setSubject] = useState('Biology');
  const [paperName, setPaperName] = useState('');
  const [description, setDescription] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paperName.trim()) return;

    setLoading(true);
    api.savePaper({
      subject,
      paper_name: paperName.trim(),
      description: description.trim(),
      pdf_url: pdfUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59',
      status,
      max_marks: 100
    });

    setPaperName('');
    setDescription('');
    setPdfUrl('');
    setShowAddModal(false);
    setLoading(false);
    onRefresh();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this paper?')) {
      api.deletePaper(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ongoing & Model Papers Management</h2>
          <p className="text-xs text-slate-500">Publish new examination papers and manage download links for students</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Create New Paper</span>
        </button>
      </div>

      {/* Add Paper Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Publish New Question Paper</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
                >
                  <option value="Biology">Biology</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Paper Title / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Biology Full Model Paper 04 - Unit 05"
                  value={paperName}
                  onChange={(e) => setPaperName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Syllabus Scope</label>
                <textarea
                  placeholder="e.g. Structured essays on Respiration and MCQ revision."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Paper PDF Link (Google Drive / Direct URL)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline</label>
                  <input
                    type="text"
                    placeholder="2026-09-15 23:59"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
                  >
                    <option value="active">Active (Ongoing)</option>
                    <option value="closed">Closed / Archived</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Publish Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Papers Table */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Paper Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-center">PDF Link</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {papers.map((p) => (
                <tr key={p.id} className="hover:bg-white/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      p.subject === 'Biology' ? 'bg-emerald-100 text-emerald-800' :
                      p.subject === 'Chemistry' ? 'bg-cyan-100 text-cyan-800' :
                      'bg-sky-100 text-sky-800'
                    }`}>
                      {p.subject}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div>{p.paper_name}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{p.description}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {p.deadline}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {p.created_at}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <a
                      href={p.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 font-bold"
                    >
                      <span>View PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
