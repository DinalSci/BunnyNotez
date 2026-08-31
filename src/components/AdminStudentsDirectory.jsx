import React, { useState } from 'react';
import { calculateGrade, getGradeColor } from '../data/mockData';
import { 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Award,
  BookOpen,
  Download
} from 'lucide-react';

export const AdminStudentsDirectory = ({ students, marks, submissions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.index_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (index_no) => {
    setExpandedIndex(expandedIndex === index_no ? null : index_no);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Registered Students Directory</h2>
          <p className="text-xs text-slate-500">Total {students.length} students enrolled in Bunny Notes Study Group</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, index (BN001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl glass-input text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.map((student) => {
          const studentMarks = marks.filter(m => m.index_no === student.index_no);
          const studentSubs = submissions.filter(s => s.index_no === student.index_no);
          const isExpanded = expandedIndex === student.index_no;

          // calculate overall avg
          const scores = studentMarks.map(m => Number(m.score) || 0);
          const overallAvg = scores.length > 0 
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
            : null;
          const overallGrade = overallAvg !== null ? calculateGrade(overallAvg) : 'N/A';

          return (
            <div
              key={student.index_no}
              className="glass-panel rounded-3xl border border-white/80 overflow-hidden transition-all duration-200"
            >
              {/* Header Row */}
              <div 
                onClick={() => toggleExpand(student.index_no)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/60 transition"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-800 text-sm">{student.name}</h4>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-mono font-bold">
                        {student.index_no}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {student.email}</span>
                      {student.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {student.phone}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] text-slate-400 font-medium">Overall Avg</div>
                    <div className="font-extrabold text-sm text-slate-800">
                      {overallAvg !== null ? `${overallAvg}%` : 'No Marks'}
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getGradeColor(overallGrade)}`}>
                    Grade {overallGrade}
                  </div>

                  <button className="p-1.5 text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details: Subject Breakdown & Marks */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  <div>
                    <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
                      Subject Marks Breakdown
                    </h5>

                    {studentMarks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {studentMarks.map((m) => (
                          <div key={m.id} className="p-3 bg-white rounded-2xl border border-slate-200/70 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800">{m.subject}</span>
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getGradeColor(m.grade)}`}>
                                {m.score}% (Grade {m.grade})
                              </span>
                            </div>
                            <p className="text-slate-600 font-medium line-clamp-1">{m.paper_name}</p>
                            {m.feedback && <p className="text-slate-400 italic text-[11px] mt-1">"{m.feedback}"</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No marks recorded yet for this student.</p>
                    )}
                  </div>

                  {/* Submissions List */}
                  <div>
                    <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
                      Answer Paper Submissions ({studentSubs.length})
                    </h5>
                    <div className="space-y-1.5">
                      {studentSubs.map((s) => (
                        <div key={s.id} className="p-2.5 bg-white rounded-xl border border-slate-200/70 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">{s.file_name}</span>
                            <span className="text-slate-400 text-[11px] ml-2">({s.submitted_at})</span>
                          </div>
                          <a
                            href={s.drive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> View Answer PDF
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
