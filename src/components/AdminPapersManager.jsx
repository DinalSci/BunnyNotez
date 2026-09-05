import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  FileText, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Clock,
  Upload,
  Calendar,
  Sparkles,
  FileCheck
} from 'lucide-react';

export const AdminPapersManager = ({ papers, currentAdmin, onRefresh }) => {
  const isOwner = currentAdmin?.role === 'owner' || currentAdmin?.subject === 'All';
  const adminSubject = currentAdmin?.subject || 'Biology';

  const [showAddModal, setShowAddModal] = useState(false);
  const [subject, setSubject] = useState(isOwner ? 'Biology' : adminSubject);
  const [paperName, setPaperName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setUploadError('Please select a valid PDF file.');
        return;
      }
      setSelectedPdfFile(file);
      setUploadError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paperName.trim()) return;

    setLoading(true);
    setUploadError('');

    try {
      let fileDataUrl = '';
      if (selectedPdfFile) {
        fileDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(selectedPdfFile);
        });
      }

      await api.savePaper({
        subject: isOwner ? subject : adminSubject,
        paper_name: paperName.trim(),
        description: description.trim(),
        pdf_url: pdfUrl.trim() || '',
        fileDataUrl: fileDataUrl || '',
        deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59',
        status,
        max_marks: 100
      });

      setPaperName('');
      setDescription('');
      setSelectedPdfFile(null);
      setPdfUrl('');
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      setUploadError(err.message || 'Failed to publish paper.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this paper?')) {
      await api.deletePaper(id);
      onRefresh();
    }
  };

  const handleToggleStatus = async (paper) => {
    const isCurrentlyActive = (paper.status || '').toString().trim().toLowerCase() === 'active';
    const newStatus = isCurrentlyActive ? 'closed' : 'active';
    await api.savePaper({
      ...paper,
      status: newStatus
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isOwner ? 'All Subjects Question Papers' : `${adminSubject} Question Papers`}
          </h2>
          <p className="text-xs text-slate-500">
            Publish ongoing question papers with direct PDF upload or cloud link
          </p>
        </div>

        <button
          onClick={() => {
            setSubject(isOwner ? 'Biology' : adminSubject);
            setShowAddModal(true);
          }}
          className="inline-flex items-center space-x-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Question Paper (PDF)</span>
        </button>
      </div>

      {/* Add Paper Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Upload Question Paper</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                {isOwner ? (
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Paper Title / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Model Paper 01 - Plant Physiology"
                  value={paperName}
                  onChange={(e) => setPaperName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Syllabus Scope</label>
                <textarea
                  placeholder="e.g. MCQ & Structured essays revision on Unit 01-03."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-2xl glass-input text-sm text-slate-800"
                />
              </div>

              {/* Direct PDF File Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Question Paper (PDF)
                </label>
                <div className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition bg-emerald-50/20 rounded-2xl p-4 text-center">
                  <input
                    type="file"
                    id="admin-paper-upload"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="admin-paper-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-7 h-7 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-emerald-700">
                      {selectedPdfFile ? selectedPdfFile.name : 'Click to select Paper PDF file'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {selectedPdfFile ? `${(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Directly attaches PDF to students portal'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Or Optional Direct Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or Google Drive Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full p-2.5 rounded-2xl glass-input text-xs text-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline</label>
                  <input
                    type="text"
                    placeholder="2027-09-15 23:59"
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
                  {loading ? 'Uploading...' : 'Publish Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Papers Table */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80 overflow-hidden">
        {papers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Paper Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-center">PDF</th>
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
                      <button
                        onClick={() => handleToggleStatus(p)}
                        title="Click to toggle Active / Closed"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer hover:opacity-80 transition ${
                          (p.status || '').toString().trim().toLowerCase() === 'active'
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {p.status || 'closed'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {p.deadline}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {p.created_at}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {p.pdf_url ? (
                        <a
                          href={p.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 font-bold"
                        >
                          <span>View PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No PDF</span>
                      )}
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
        ) : (
          <div className="p-8 text-center text-slate-400 italic">
            No question papers found. Click 'Upload New Question Paper' to create your first paper!
          </div>
        )}
      </div>

    </div>
  );
};
