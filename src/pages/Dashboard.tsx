import { useState, useEffect } from 'react';
import api from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ClipboardCheck, TrendingUp, Download, FileText, Check, X, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

interface Stats {
  students: number;
  staff: number;
  attendance: {
    present: number;
    absent: number;
  };
}

interface Admission {
  id: string;
  studentName: string;
  grade: string;
  parentEmail: string;
  phone: string;
  previousSchool: string | null;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, admissionsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/admissions')
        ]);
        setStats(statsRes.data);
        setAdmissions(admissionsRes.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateAdmissionStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admissions/${id}`, { status });
      setAdmissions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDownloadReport = async () => {
    if (!stats) return;
    setIsGenerating(true);
    
    try {
      // Fetch fresh data for the report
      const [studentsRes, staffRes] = await Promise.all([
        api.get('/students'),
        api.get('/staff')
      ]);

      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString();
      const timeStr = new Date().toLocaleTimeString();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text('Cardiff International School, Virar East', 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text('Monthly Operational Status Report', 14, 30);
      doc.text(`Generated on: ${dateStr} at ${timeStr}`, 14, 36);
      
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(14, 42, 196, 42);

      // Statistics Summary
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Executive Summary', 14, 55);

      const summaryData = [
        ['Metric', 'Current Value', 'Status'],
        ['Total Student Enrollment', stats.students.toString(), 'Operational'],
        ['Total Staff Members', stats.staff.toString(), 'Active'],
        ['Daily Attendance (Present)', stats.attendance.present.toString(), 'Recorded'],
        ['Daily Attendance (Absent)', stats.attendance.absent.toString(), 'Follow-up Req.'],
        ['Attendance Rate', `${((stats.attendance.present / (stats.students || 1)) * 100).toFixed(1)}%`, 'Normal']
      ];

      autoTable(doc, {
        startY: 60,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 41, 59], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 }
      });

      // Student Directory Section
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(16);
      doc.text('Student Enrollment List', 14, finalY + 15);

      const studentHeaders = [['Name', 'Roll Number', 'Class', 'Email Address']];
      const studentData = studentsRes.data.map((s: any) => [s.name, s.rollNumber, s.class, s.email]);

      autoTable(doc, {
        startY: finalY + 20,
        head: studentHeaders,
        body: studentData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }, // Blue 500
        styles: { fontSize: 9 }
      });

      // Staff Directory Section
      const nextY = (doc as any).lastAutoTable.finalY || finalY + 60;
      
      // Check for page break
      if (nextY > 240) doc.addPage();
      const staffStartY = nextY > 240 ? 20 : nextY + 15;

      doc.setFontSize(16);
      doc.text('Faculty & Staff Directory', 14, staffStartY);

      const staffHeaders = [['Name', 'Role', 'Department', 'Email Address']];
      const staffData = staffRes.data.map((s: any) => [s.name, s.role, s.department, s.email]);

      autoTable(doc, {
        startY: staffStartY + 5,
        head: staffHeaders,
        body: staffData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
        styles: { fontSize: 9 }
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text(`Cardiff Intl School, Virar East - Confidential Management Report - Page ${i} of ${pageCount}`, 14, 285);
      }

      doc.save(`School_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Report Generation Error:', err);
      alert('Critical system error during PDF generation. Please ensure you have stable connectivity.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500 font-medium">Synchronizing statistics...</div>;

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-700 flex flex-col items-center justify-center gap-4">
        <p className="font-bold">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-700 transition-all font-mono"
        >
          RETRY_SYNC
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: stats?.students.toLocaleString() || 0, change: '+12 this month', color: 'text-emerald-500' },
    { title: 'Total Staff', value: stats?.staff || 0, change: 'Active Faculty', color: 'text-slate-400' },
    { title: 'Attendance Rate', value: stats ? `${((stats.attendance.present / (stats.students || 1)) * 100).toFixed(1)}%` : '0%', change: 'Today', color: 'text-emerald-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('admissions')}
          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'admissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Admissions ({admissions.filter(a => a.status === 'Pending').length} New)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statCards.map((card, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
                  <div className="flex items-end gap-2">
                    <h3 className="text-3xl font-bold text-slate-900">{card.value}</h3>
                    <span className={`text-sm font-medium pb-1 ${card.color}`}>{card.change}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 tracking-tight">Management Shortcut</h2>
                <p className="text-blue-100 text-sm opacity-80">Quickly record attendance or manage the academic roster.</p>
              </div>
              <div className="flex gap-3 relative z-10 w-full md:w-auto">
                <button 
                  onClick={() => navigate('/attendance')}
                  className="flex-1 md:flex-none px-6 py-3 bg-white text-blue-600 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <ClipboardCheck size={18} />
                  Record Attendance
                </button>
                <button 
                  onClick={() => navigate('/students')}
                  className="flex-1 md:flex-none px-6 py-3 bg-blue-500 text-white border border-blue-400 rounded-xl text-sm font-bold hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
                >
                  <Users size={18} />
                  View Students
                </button>
              </div>
              <TrendingUp size={200} className="absolute -right-10 -bottom-10 text-white/10 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-800">Operational Overview</h2>
                  <button 
                    onClick={handleDownloadReport}
                    disabled={isGenerating}
                    className={`text-blue-600 text-xs font-bold hover:underline flex items-center gap-1.5 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Download size={12} className={isGenerating ? 'animate-bounce' : ''} />
                    {isGenerating ? 'Generating PDF...' : 'Download Report'}
                  </button>
                </div>
                <div className="p-8 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Users size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">Student Enrollment Trend</h3>
                      <p className="text-sm text-slate-500 italic">Consistency in registration over the academic year.</p>
                      <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[75%]"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      <ClipboardCheck size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">Staff Performance Score</h3>
                      <p className="text-sm text-slate-500 italic">Based on attendance consistency and schedule adherence.</p>
                      <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[92%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="font-bold text-slate-800 mb-4">Today's Attendance</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Present Students</span>
                      <span className="text-sm font-bold text-slate-900">{stats?.attendance.present}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(stats?.attendance.present || 0) / (stats?.students || 1) * 100}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Absent Students</span>
                      <span className="text-sm font-bold text-slate-900">{stats?.attendance.absent}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${(stats?.attendance.absent || 0) / (stats?.students || 1) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white">
                  <h2 className="font-bold mb-4 text-blue-400">System Activity</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase">SR</div>
                      <div>
                        <p className="text-sm font-medium">Student Records</p>
                        <p className="text-[10px] text-slate-400">Database in sync</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">AT</div>
                      <div>
                        <p className="text-sm font-medium">Attendance Tracker</p>
                        <p className="text-[10px] text-slate-400">Cloud backup active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="admissions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Pending Admission Applications</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4">Parent Details</th>
                    <th className="px-6 py-4">Applied</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {admissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">No applications found.</td>
                    </tr>
                  ) : (
                    admissions.map((admission) => (
                      <tr key={admission.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{admission.studentName}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{admission.previousSchool || 'No previous school'}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{admission.grade}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-700">{admission.parentEmail}</div>
                          <div className="text-xs text-slate-400">{admission.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(admission.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            admission.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                            admission.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {admission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {admission.status === 'Pending' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateAdmissionStatus(admission.id, 'Approved')}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                                <button 
                                  onClick={() => handleUpdateAdmissionStatus(admission.id, 'Rejected')}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-all"
                                  title="Reject"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            <button className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-all">
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
