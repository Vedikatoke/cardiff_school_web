import { useState, useEffect } from 'react';
import api from '../lib/api';
import { motion } from 'motion/react';
import { Calendar, Users, Save, CheckCircle2, XCircle, ShieldAlert, Download } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  attendance: { status: string }[];
}

export default function Attendance() {
  const isAdmin = useAdmin();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [className, setClassName] = useState('');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setAvailableClasses(res.data);
      if (res.data.length > 0 && !className) {
        setClassName(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch classes');
    }
  };

  const fetchAttendance = async () => {
    if (!className || !date) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/attendance?date=${date}&class=${className}`);
      setStudents(res.data);
      
      // Initialize map from existing data
      const newMap: Record<string, string> = {};
      res.data.forEach((s: Student) => {
        if (s.attendance[0]) {
          newMap[s.id] = s.attendance[0].status;
        } else {
          newMap[s.id] = 'Present'; // Default
        }
      });
      setAttendanceMap(newMap);
    } catch (err) {
      setError('Failed to load class roster. Ensure class name is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        status
      }));
      await api.post('/attendance/bulk', { records, date });
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = (studentId: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const markAllPresent = () => {
    const newMap = { ...attendanceMap };
    students.forEach(s => {
      newMap[s.id] = 'Present';
    });
    setAttendanceMap(newMap);
  };

  const downloadReport = async () => {
    if (students.length === 0) return;
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text('Attendance Report', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${timestamp}`, 14, 30);
      
      // Details Table
      autoTable(doc, {
        startY: 40,
        head: [['Class', 'Date', 'Total Students', 'Present', 'Absent']],
        body: [[
          className,
          date,
          students.length,
          Object.values(attendanceMap).filter(s => s === 'Present').length,
          Object.values(attendanceMap).filter(s => s === 'Absent').length
        ]],
        theme: 'plain',
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
      });

      // Attendance Table
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Roll No', 'Student Name', 'Status']],
        body: students.map(s => [
          s.rollNumber,
          s.name,
          attendanceMap[s.id] || 'Not Marked'
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const status = data.cell.raw;
            if (status === 'Present') {
              data.cell.styles.textColor = [5, 150, 105]; // emerald-600
            } else if (status === 'Absent') {
              data.cell.styles.textColor = [225, 29, 72]; // rose-600
            }
          }
        }
      });
      
      doc.save(`Attendance_${className}_${date}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class / Section</p>
          <div className="relative">
            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              <option value="" disabled>Select a class</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              {availableClasses.length === 0 && <option value="10A">Grade 10A (Example)</option>}
            </select>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Date</p>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={fetchAttendance}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          Load Roster
        </button>
      </div>

      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-4 text-blue-800 text-sm">
          <ShieldAlert size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Staff Access Only</p>
            <p className="text-blue-600/80">You can view attendance records, but only staff members with administrative privileges can modify them.</p>
          </div>
        </div>
      )}

      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50/30 gap-4">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-slate-800">Class Roster</h3>
              {isAdmin && (
                <button 
                  onClick={markAllPresent}
                  className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  Mark All Present
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={downloadReport}
                disabled={isGenerating}
                className="px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-50 shadow-sm"
              >
                <Download size={16} />
                {isGenerating ? 'Exporting...' : 'Download Report'}
              </button>
              {isAdmin && (
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm shadow-blue-200 disabled:opacity-50 transition-all"
                >
                  <Save size={16} />
                  {saving ? 'Syncing...' : 'Commit Changes'}
                </button>
              )}
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 px-8 hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Roll ID: {student.rollNumber}</p>
                </div>
                <button 
                  onClick={() => isAdmin && toggleStatus(student.id)}
                  disabled={!isAdmin}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    attendanceMap[student.id] === 'Present' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : 'bg-rose-50 border-rose-100 text-rose-600'
                  } ${!isAdmin ? 'cursor-default opacity-80' : ''}`}
                >
                  {attendanceMap[student.id] === 'Present' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {attendanceMap[student.id]}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="text-center py-20 text-slate-400">Loading student list...</div>}
      {!loading && students.length === 0 && className && (
        <div className="text-center py-20 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">No students found for this class.</p>
        </div>
      )}
    </motion.div>
  );
}
