import { useState, useEffect } from 'react';
import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Receipt, 
  Megaphone, 
  Images, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Moon, 
  Sun, 
  Briefcase, 
  ShieldAlert, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Menu,
  Clock,
  Eye,
  FileCheck
} from 'lucide-react';
import api from '../lib/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types Definitions
interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  class: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
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

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
}

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

interface Result {
  id: string;
  studentName: string;
  class: string;
  subject: string;
  marks: number;
  grade: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Route Synchronization Helper
  const getTabFromPath = (pathname: string) => {
    if (pathname.includes('/admin/admissions')) return 'admissions';
    if (pathname.includes('/admin/staff')) return 'staff';
    if (pathname.includes('/admin/students')) return 'students';
    if (pathname.includes('/admin/gallery')) return 'gallery';
    if (pathname.includes('/admin/fees')) return 'fees';
    if (pathname.includes('/admin/attendance')) return 'attendance';
    return 'dashboard';
  };

  const initialTab = getTabFromPath(location.pathname);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Sync state if navigation changes history
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  // Handle Tab Navigation safely updating state and browser URL route
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') navigate('/admin');
    else if (tab === 'admissions') navigate('/admin/admissions');
    else if (tab === 'staff') navigate('/admin/staff');
    else if (tab === 'students') navigate('/admin/students');
    else if (tab === 'gallery') navigate('/admin/gallery');
    else if (tab === 'fees') navigate('/admin/fees');
    else if (tab === 'attendance') navigate('/admin/attendance');
  };

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Core Data Lists
  const [stats, setStats] = useState<any>({ students: 0, staff: 0, pendingAdmissions: 0, attendanceRate: 94 });
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80', title: 'Science Lab Exhibition', category: 'Academic' },
    { id: '2', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80', title: 'Interschool Football Finals', category: 'Sports' }
  ]);

  // Attendance states
  const [attendanceClass, setAttendanceClass] = useState<string>('All');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceSyncLoading, setAttendanceSyncLoading] = useState<boolean>(false);

  // Loading, Errors, Search Counters
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'student' | 'staff' | 'gallery' | 'fees'>('student');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Pagination Pages
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Dark light mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Local storage auth validation
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setAdminUser(JSON.parse(storedUser));
      fetchData();
    }
    
    // Apply initial Dark Mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Global Data Fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      setGlobalError('');
      const [statsRes, admissionsRes, studentsRes, staffRes, feesRes] = await Promise.all([
        api.get('/dashboard/stats').catch(() => null),
        api.get('/admissions').catch(() => null),
        api.get('/students').catch(() => null),
        api.get('/staff').catch(() => null),
        api.get('/fees').catch(() => null),
      ]);

      if (admissionsRes) setAdmissions(admissionsRes.data);
      if (studentsRes) setStudents(studentsRes.data);
      if (staffRes) setStaff(staffRes.data);
      if (feesRes) setFees(feesRes.data);

      const sCount = studentsRes ? studentsRes.data.length : 0;
      const tCount = staffRes ? staffRes.data.length : 0;
      const pendingAdm = admissionsRes ? admissionsRes.data.filter((a: any) => a.status === 'Pending').length : 0;

      setStats({
        students: sCount || statsRes?.data?.students || 400,
        staff: tCount || statsRes?.data?.staff || 25,
        pendingAdmissions: pendingAdm,
        attendanceRate: statsRes?.data?.attendance?.present ? Math.round((statsRes.data.attendance.present / (sCount || 1)) * 100) : 95
      });

    } catch (err: any) {
      console.error(err);
      setGlobalError('Could not sync local workspace records with remote database.');
    } finally {
      setLoading(false);
    }
  };

  // Form Submission Models Data States
  const [studentForm, setStudentForm] = useState({ name: '', email: '', rollNumber: '', class: '' });
  const [staffForm, setStaffForm] = useState({ name: '', email: '', role: '', department: '' });
  const [feeForm, setFeeForm] = useState({ medium: 'semi-english', class: '', admission: '', regOther: '', monthly: '', term: '', total: '' });
  const [galleryForm, setGalleryForm] = useState({ url: '', title: '', category: 'General' });

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await api.post('/admin/login', {
        username: usernameInput,
        password: passwordInput
      });

      const { token, user } = response.data;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));

      setAdminUser(user);
      setIsAuthenticated(true);
      triggerToast(`Welcome back, ${user.name}!`, 'success');
      fetchData();
    } catch (error: any) {
      console.error('Authentication check failed:', error);
      setLoginError(error.response?.data?.error || 'Invalid administrator username or password. Please try again.');
      triggerToast('Authentication failed', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
    setAdminUser(null);
    setUsernameInput('');
    setPasswordInput('');
    triggerToast('Administrator logged out successfully.', 'info');
  };

  // Dark mode trigger
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    triggerToast(`${newMode ? 'Dark Theme' : 'Light Theme'} enabled`, 'info');
  };

  // Admissions state mutations
  const handleUpdateAdmissionStatus = async (id: string, status: string) => {
    try {
      setActionLoading(true);
      await api.put(`/admissions/${id}`, { status });
      setAdmissions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      triggerToast(`Application successfully marked as ${status}.`, 'success');
      fetchData();
    } catch (err) {
      triggerToast('Could not update application status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this admission record Permanently?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/admissions/${id}`);
      setAdmissions(prev => prev.filter(a => a.id !== id));
      triggerToast('Admission application deleted permanently.', 'success');
      fetchData();
    } catch (err) {
      triggerToast('Failed to delete application record.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Students & Staff Submit actions
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingItem) {
        await api.put(`/students/${editingItem.id}`, studentForm);
        triggerToast('Student profile successfully updated.', 'success');
      } else {
        await api.post('/students', studentForm);
        triggerToast('New student enrollment success.', 'success');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setStudentForm({ name: '', email: '', rollNumber: '', class: '' });
      fetchData();
    } catch (err: any) {
      triggerToast(err.response?.data?.error || 'Unable to store student entry.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingItem) {
        await api.put(`/staff/${editingItem.id}`, staffForm);
        triggerToast('Staff records updated.', 'success');
      } else {
        await api.post('/staff', staffForm);
        triggerToast('New staff registered.', 'success');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setStaffForm({ name: '', email: '', role: '', department: '' });
      fetchData();
    } catch (err: any) {
      triggerToast('Unable to store staff data records.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Student deletion
  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/students/${id}`);
      triggerToast('Record scrubbed successfully.', 'success');
      fetchData();
    } catch (err) {
      triggerToast('Record dependency block detected.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Staff deletion
  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Delete this faculty record?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/staff/${id}`);
      triggerToast('Faculty profile successfully removed.', 'success');
      fetchData();
    } catch (err) {
      triggerToast('Dependency constraint deletion failure.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Fees structure submission and deletion handlers
  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);

      // Parse and strip formatting for calculation
      const admVal = Number(feeForm.admission.replace(/[^0-9]/g, '')) || 0;
      const regVal = Number(feeForm.regOther.replace(/[^0-9]/g, '')) || 0;
      const monVal = Number(feeForm.monthly.replace(/[^0-9]/g, '')) || 0;
      const trmVal = Number(feeForm.term.replace(/[^0-9]/g, '')) || 0;

      const calculatedTotal = `₹${(admVal + regVal + (monVal * 12) + trmVal).toLocaleString('en-IN')}`;

      const submissionData = {
        ...feeForm,
        admission: feeForm.admission.startsWith('₹') ? feeForm.admission : `₹${feeForm.admission || '0'}`,
        regOther: feeForm.regOther.startsWith('₹') ? feeForm.regOther : `₹${feeForm.regOther || '0'}`,
        monthly: feeForm.monthly.startsWith('₹') ? feeForm.monthly : `₹${feeForm.monthly}`,
        term: feeForm.term.startsWith('₹') ? feeForm.term : `₹${feeForm.term}`,
        total: feeForm.total ? (feeForm.total.startsWith('₹') ? feeForm.total : `₹${feeForm.total}`) : calculatedTotal
      };

      if (editingItem) {
        await api.put(`/fees/${editingItem.id}`, submissionData);
        triggerToast('Fee standard updated successfully.', 'success');
      } else {
        await api.post('/fees', submissionData);
        triggerToast('New Fee standard registered.', 'success');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFeeForm({ medium: 'semi-english', class: '', admission: '', regOther: '', monthly: '', term: '', total: '' });
      fetchData();
    } catch (err: any) {
      triggerToast(err.response?.data?.error || 'Unable to store fee records.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!window.confirm('Delete this class fee standard permanently?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/fees/${id}`);
      triggerToast('Fee profile permanently removed.', 'success');
      fetchData();
    } catch {
      triggerToast('Failed to delete fee standard.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Attendance Sheet logic
  const fetchAttendanceSheet = async () => {
    try {
      setAttendanceSyncLoading(true);
      const res = await api.get(`/attendance?date=${attendanceDate}&class=${attendanceClass}`);
      const list = res.data.map((st: any) => ({
        id: st.id,
        name: st.name,
        rollNumber: st.rollNumber,
        status: st.attendance[0]?.status || 'Present' // Default to Present
      }));
      setAttendanceRecords(list);
      triggerToast(`Loaded attendance slate for ${attendanceClass}`, 'info');
    } catch (err) {
      triggerToast('Error synchronizing active attendance roster.', 'error');
    } finally {
      setAttendanceSyncLoading(false);
    }
  };

  const handleToggleAttendanceStatus = (studentId: string) => {
    setAttendanceRecords(prev => prev.map(st => {
      if (st.id === studentId) {
        return { ...st, status: st.status === 'Present' ? 'Absent' : 'Present' };
      }
      return st;
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setAttendanceSyncLoading(true);
      const records = attendanceRecords.map(r => ({
        studentId: r.id,
        status: r.status
      }));
      await api.post('/attendance/bulk', {
        date: attendanceDate,
        records
      });
      triggerToast('Bulk attendance records cataloged successfully.', 'success');
      fetchData();
    } catch (err) {
      triggerToast('Could not save rosters.', 'error');
    } finally {
      setAttendanceSyncLoading(false);
    }
  };

  const downloadAttendancePDF = () => {
    try {
      if (!attendanceRecords || attendanceRecords.length === 0) {
        triggerToast('No attendance records to download.', 'error');
        return;
      }
      const doc = new jsPDF();
      
      // Title & Header details with pure elegant styling
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900 color
      doc.text('Cardiff International School', 14, 22);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('Academic Attendance Slate Report', 14, 29);
      
      // Config line separating header
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(14, 34, 196, 34);
      
      // Metadata Details Section
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.text(`Class Cohort:`, 14, 43);
      doc.setFont('helvetica', 'normal');
      doc.text(`${attendanceClass}`, 42, 43);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Target Date:`, 14, 49);
      doc.setFont('helvetica', 'normal');
      doc.text(`${attendanceDate}`, 42, 49);

      const totalStudents = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
      const absentCount = totalStudents - presentCount;
      const percentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Headcount:`, 110, 43);
      doc.setFont('helvetica', 'normal');
      doc.text(`${totalStudents} Students`, 148, 43);

      doc.setFont('helvetica', 'bold');
      doc.text(`Presence Rate:`, 110, 49);
      doc.setFont('helvetica', 'normal');
      doc.text(`${presentCount} Present / ${absentCount} Absent (${percentage}%)`, 148, 49);
      
      // Another divider line
      doc.line(14, 55, 196, 55);
      
      // Draw grid with autoTable
      const tableData = attendanceRecords.map((r, idx) => [
        idx + 1,
        r.rollNumber || 'N/A',
        r.name,
        r.status
      ]);
      
      autoTable(doc, {
        startY: 60,
        head: [['#', 'Roll Number', 'Student Name', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 41, 59], // brand slate-800
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 65, 85] // slate-700
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 40 },
          2: { cellWidth: 90 },
          3: { cellWidth: 35 }
        },
        didParseCell: (data) => {
          // Color coding for Present versus Absent statuses
          if (data.column.index === 3 && data.cell.section === 'body') {
            if (data.cell.text[0] === 'Present') {
              data.cell.styles.textColor = [16, 185, 129]; // green-500
              data.cell.styles.fontStyle = 'bold';
            } else if (data.cell.text[0] === 'Absent') {
              data.cell.styles.textColor = [239, 68, 68]; // red-500
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });
      
      doc.save(`Attendance_${attendanceClass}_${attendanceDate}.pdf`);
      triggerToast('Attendance PDF downloaded successfully.', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to compile and download PDF document.', 'error');
    }
  };

  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newImg = { id: Date.now().toString(), ...galleryForm };
    setGallery([newImg, ...gallery]);
    triggerToast('Album asset added to layout.', 'success');
    setIsModalOpen(false);
  };

  // Prepopulate form when editing
  const openEditModal = (item: any, type: any) => {
    setEditingItem(item);
    setModalType(type);
    if (type === 'student') {
      setStudentForm({ name: item.name, email: item.email, rollNumber: item.rollNumber, class: item.class });
    } else if (type === 'staff') {
      setStaffForm({ name: item.name, email: item.email, role: item.role, department: item.department });
    } else if (type === 'fees') {
      setFeeForm({
        medium: item.medium,
        class: item.class,
        admission: item.admission,
        regOther: item.regOther,
        monthly: item.monthly,
        term: item.term,
        total: item.total
      });
    }
    setIsModalOpen(true);
  };

  const openAddModal = (type: any) => {
    setEditingItem(null);
    setModalType(type);
    if (type === 'student') setStudentForm({ name: '', email: '', rollNumber: '', class: '' });
    if (type === 'staff') setStaffForm({ name: '', email: '', role: '', department: '' });
    if (type === 'fees') setFeeForm({ medium: 'semi-english', class: '', admission: '', regOther: '', monthly: '', term: '', total: '' });
    if (type === 'gallery') setGalleryForm({ url: '', title: '', category: 'Academics' });
    setIsModalOpen(true);
  };

  // Filtering helpers
  const getFilteredData = (list: any[]) => {
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(item => 
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.studentName && item.studentName.toLowerCase().includes(term)) ||
      (item.email && item.email.toLowerCase().includes(term)) ||
      (item.title && item.title.toLowerCase().includes(term)) ||
      (item.department && item.department.toLowerCase().includes(term)) ||
      (item.class && item.class.toLowerCase().includes(term)) ||
      (item.rollNumber && item.rollNumber.toLowerCase().includes(term))
    );
  };

  const paginatedList = (list: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return list.slice(startIndex, startIndex + itemsPerPage);
  };

  // Render Login page if unauthorized
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen grid items-center justify-center p-6 bg-slate-50 transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'text-slate-900'}`}>
        <div className="absolute top-6 right-6">
          <button 
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200/50 dark:border-slate-800 transition-all hover:scale-105"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
        </div>

        <div className="absolute bottom-6 left-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-md border border-slate-200/50 dark:border-slate-800 transition-all hover:scale-105 font-bold text-xs uppercase cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-150 dark:border-slate-800 shadow-2xl space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-accent/10 dark:bg-blue-500/10 text-brand-accent mb-2">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Console.</h1>
            <p className="text-xs text-slate-400 font-medium">Cardiff International Academic Credentials</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Username Required</label>
              <input 
                type="text" 
                required
                placeholder="Username (e.g. admin)" 
                className="w-full px-5 py-3.5 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Password Credentials</label>
              <input 
                type="password" 
                required
                placeholder="Enter password" 
                className="w-full px-5 py-3.5 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
              />
            </div>

            {loginError && (
              <p className="text-xs bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-semibold p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                {loginError}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full py-4 bg-brand-navy dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? 'Authenticating securely...' : 'Secure Authorization'}
            </button>
          </form>

         
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50/70 text-slate-900'}`}>
      
      {/* Toast Alert Box */}
      {toast && (
        <div key="toast-box" className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-2.5 transition-all text-sm font-semibold border ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' :
          'bg-blue-50 text-blue-800 border-blue-100'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`} />
          {toast.message}
        </div>
      )}

      {/* Sidebars Panel */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col p-6 space-y-8 shrink-0">
        
        {/* Banner */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center text-white font-black text-lg shadow-md">
            CI
          </div>
          <div>
            <h2 className="font-extrabold tracking-tight text-slate-800 dark:text-white leading-none">Cardiff Intl</h2>
            <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">System Control</span>
          </div>
        </div>

        {/* Links lists section */}
        <nav className="flex-1 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'admissions', label: 'Admissions', icon: GraduationCap },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'staff', label: 'Staff Directory', icon: Briefcase },
            { id: 'gallery', label: 'Photo Gallery', icon: Images },
            { id: 'fees', label: 'Fees Updation', icon: Receipt },
            { id: 'attendance', label: 'Attendance Slate', icon: UserCheck },
          ].map(lnk => {
            const IconComponent = lnk.icon;
            const isSel = activeTab === lnk.id;
            return (
              <button
                key={lnk.id}
                onClick={() => handleTabChange(lnk.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                  isSel 
                    ? 'bg-brand-accent/10 text-brand-blue dark:text-blue-400 dark:bg-blue-500/10 font-extrabold scale-[1.01]' 
                     : 'text-slate-500 hover:text-brand-navy hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <IconComponent size={18} />
                {lnk.label}
              </button>
            );
          })}
        </nav>

        {/* Administrator Footer Badge */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-105 dark:bg-slate-800 flex items-center justify-center font-bold text-xs uppercase">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-xs font-bold leading-none">{adminUser?.name || 'Administrator'}</p>
              <span className="text-[10px] text-slate-400 font-medium">Cardiff Board</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500 bg-rose-50/50 text-xs font-bold rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            Secure Log Out
          </button>
        </div>
      </aside>

      {/* Main Administrative Workplace Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Workspace Top Headers */}
        <header className="px-10 py-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black capitalize tracking-tight dark:text-white">
              {activeTab === 'dashboard' ? 'Operational Command Overview' : `${activeTab} Control Hub`}
            </h1>

          </div>

          <div className="flex items-center gap-4">
            {/* Search Input Filter for sub-modules */}
            {(activeTab === 'students' || activeTab === 'staff' || activeTab === 'admissions' || activeTab === 'fees') && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder={`Search registry records...`}
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-full text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-brand-accent/40 w-60 text-slate-700"
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            )}

            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 text-slate-600 hover:scale-105 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-emerald-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Inner Content panels */}
        <div className="p-10 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
              <div className="relative flex justify-center items-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200/55 dark:border-slate-800 animate-pulse" />
                <div className="absolute top-0 w-12 h-12 rounded-full border-4 border-t-brand-accent animate-spin" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider">Synchronizing Cardiff Registry Indexes...</p>
            </div>
          ) : globalError ? (
            <div className="bg-rose-50 dark:bg-slate-950/20 border border-rose-100 dark:border-rose-900/60 p-8 rounded-3xl max-w-xl mx-auto text-center space-y-4 shadow-xl">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-xl font-black text-rose-800">Operational Database Disconnected</h3>
              <p className="text-slate-505 text-sm font-semibold">{globalError}</p>
              <button 
                onClick={fetchData}
                className="px-6 py-2 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-750 transition-all font-mono shadow-md"
              >
                Force Database Sync Attempt
              </button>
            </div>
          ) : (
            <>
              {/* PAGE 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-400">Total Student Enrollment</span>
                      <div className="flex justify-between items-end">
                        <h4 className="text-4xl font-extrabold tracking-tight dark:text-white">{stats.students}</h4>
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
                          <Users size={18} />
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-extrabold">Active Status Normal</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-400">Staff Faculty Members</span>
                      <div className="flex justify-between items-end">
                        <h4 className="text-4xl font-extrabold tracking-tight dark:text-white">{stats.staff}</h4>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
                          <Briefcase size={18} />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-extrabold">Faculty catalog updated</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-400">Pending Application Records</span>
                      <div className="flex justify-between items-end">
                        <h4 className="text-4xl font-extrabold tracking-tight dark:text-white">{stats.pendingAdmissions}</h4>
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
                          <GraduationCap size={18} />
                        </div>
                      </div>
                      <span className="text-[10px] text-orange-500 font-extrabold">{stats.pendingAdmissions} Pending Admission Reviews</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-400">Today Attendance rate</span>
                      <div className="flex justify-between items-end">
                        <h4 className="text-4xl font-extrabold tracking-tight dark:text-white">{stats.attendanceRate}%</h4>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
                          <UserCheck size={18} />
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-extrabold">Consistently above 93% standard</span>
                    </div>
                  </div>

                  {/* ADMISSIONS ANALYTICS SVG INTERACTIVE CHART */}
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black dark:text-white">Admission Application Analytics</h3>
                        <span className="text-[10px] font-extrabold text-slate-400">Total Catalog: {admissions.length} Registered</span>
                      </div>
                      
                      {/* Responsive Handcrafted Visual Analytics Column Chart */}
                      <div className="relative w-full h-[240px] flex items-end justify-around border-b border-l border-slate-100 dark:border-slate-800 pb-1.5 pl-4 bg-slate-50/50 dark:bg-slate-950 rounded-2xl pt-8">
                        {/* Bar 1: Total */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer w-[15%]">
                          <div className="text-[10px] font-bold text-slate-500 group-hover:-translate-y-1 transition-transform">{admissions.length}</div>
                          <div 
                            style={{ height: `${Math.max((admissions.length / (admissions.length || 10)) * 140, 20)}px` }} 
                            className="w-full rounded-t-xl bg-blue-500/80 group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20" 
                          />
                          <span className="text-[9px] font-bold text-slate-400">Total</span>
                        </div>

                        {/* Bar 2: Approved */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer w-[15%]">
                          <div className="text-[10px] font-bold text-slate-500 group-hover:-translate-y-1 transition-transform">
                            {admissions.filter(a => a.status === 'Approved').length}
                          </div>
                          <div 
                            style={{ height: `${Math.max((admissions.filter(a => a.status === 'Approved').length / (admissions.length || 10)) * 140, 20)}px` }} 
                            className="w-full rounded-t-xl bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20" 
                          />
                          <span className="text-[9px] font-bold text-slate-400">Approved</span>
                        </div>

                        {/* Bar 3: Pending */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer w-[15%]">
                          <div className="text-[10px] font-bold text-slate-500 group-hover:-translate-y-1 transition-transform">
                            {admissions.filter(a => a.status === 'Pending').length}
                          </div>
                          <div 
                            style={{ height: `${Math.max((admissions.filter(a => a.status === 'Pending').length / (admissions.length || 10)) * 140, 20)}px` }} 
                            className="w-full rounded-t-xl bg-amber-500/80 group-hover:bg-amber-500 transition-colors shadow-lg shadow-amber-500/20" 
                          />
                          <span className="text-[9px] font-bold text-slate-400">Pending</span>
                        </div>

                        {/* Bar 4: Rejected */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer w-[15%]">
                          <div className="text-[10px] font-bold text-slate-500 group-hover:-translate-y-1 transition-transform">
                            {admissions.filter(a => a.status === 'Rejected').length}
                          </div>
                          <div 
                            style={{ height: `${Math.max((admissions.filter(a => a.status === 'Rejected').length / (admissions.length || 10)) * 140, 20)}px` }} 
                            className="w-full rounded-t-xl bg-rose-500/80 group-hover:bg-rose-500 transition-colors shadow-lg shadow-rose-500/20" 
                          />
                          <span className="text-[9px] font-bold text-slate-400">Rejected</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-black dark:text-white">Quick Tasks Action</h3>
                        <p className="text-xs text-slate-400">Accelerate school registry administration actions on the fly.</p>
                      </div>
                      
                      <div className="space-y-3 pt-6">
                        <button 
                          onClick={() => handleTabChange('attendance')}
                          className="w-full py-4 text-xs font-black uppercase text-center text-white bg-brand-blue rounded-2xl hover:bg-brand-accent transition-all hover:scale-[1.01]"
                        >
                          Record Student Attendance
                        </button>
                        <button 
                          onClick={() => openAddModal('student')}
                          className="w-full py-4 text-xs font-black uppercase text-center text-brand-navy dark:text-slate-100 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all hover:scale-[1.01]"
                        >
                          Enroll New Student
                        </button>
                        <button 
                          onClick={() => openAddModal('staff')}
                          className="w-full py-4 text-xs font-black uppercase text-center text-brand-navy dark:text-slate-100 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all hover:scale-[1.01]"
                        >
                          Add Faculty Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2: ADMISSIONS TABLE MODULE */}
              {activeTab === 'admissions' && (
                <div className="space-y-6">
                  <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">Student Info</th>
                          <th className="px-6 py-4">Desired standard</th>
                          <th className="px-6 py-4">Parent details</th>
                          <th className="px-6 py-4">Previous Institution</th>
                          <th className="px-6 py-4">Date Sub</th>
                          <th className="px-6 py-4">Status Map</th>
                          <th className="px-6 py-4">Actions Core</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 font-semibold text-slate-600 dark:text-slate-300">
                        {getFilteredData(admissions).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold italic">No applicant matches directory criteria.</td>
                          </tr>
                        ) : (
                          paginatedList(getFilteredData(admissions)).map((adm: Admission) => (
                            <tr key={adm.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                              <td className="px-6 py-5 font-bold text-brand-navy dark:text-white leading-tight">
                                {adm.studentName}
                              </td>
                              <td className="px-6 py-5 font-bold font-mono text-xs">{adm.grade}</td>
                              <td className="px-6 py-5 font-medium leading-normal">
                                <p>{adm.parentEmail}</p>
                                <p className="text-[10px] text-slate-400 font-bold tracking-tight">{adm.phone}</p>
                              </td>
                              <td className="px-6 py-5 text-slate-400 italic font-medium">{adm.previousSchool || 'No prior school background'}</td>
                              <td className="px-6 py-5 text-slate-400 font-mono text-[10px]">{new Date(adm.createdAt).toISOString().split('T')[0]}</td>
                              <td className="px-6 py-5">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  adm.status === 'Approved' ? 'bg-emerald-55 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400' :
                                  adm.status === 'Rejected' ? 'bg-rose-55 text-rose-700 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-450' :
                                  'bg-amber-55 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400'
                                }`}>
                                  {adm.status}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex gap-2">
                                  {adm.status === 'Pending' && (
                                    <>
                                      <button 
                                        onClick={() => handleUpdateAdmissionStatus(adm.id, 'Approved')}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-all"
                                        title="Approve Applicant"
                                      >
                                        <Check size={16} />
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateAdmissionStatus(adm.id, 'Rejected')}
                                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                                        title="Reject applicant"
                                      >
                                        <X size={16} />
                                      </button>
                                    </>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteAdmission(adm.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Purge Application"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Section */}
                  <div className="flex justify-between items-center px-4 font-mono text-xs">
                    <span className="text-slate-400">Page {currentPage} of {Math.max(Math.ceil(getFilteredData(admissions).length / itemsPerPage), 1)}</span>
                    <div className="flex gap-1.5">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-40 transition-all hover:scale-105"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button 
                        disabled={currentPage >= Math.max(Math.ceil(getFilteredData(admissions).length / itemsPerPage), 1)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-40 transition-all hover:scale-105"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 3: STUDENTS MANAGEMENT */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button 
                      onClick={() => openAddModal('student')}
                      className="px-5 py-3.5 bg-brand-navy dark:bg-blue-600 text-white text-xs font-black uppercase rounded-2xl flex items-center gap-2 shadow-lg transition-all hover:scale-101 cursor-pointer"
                    >
                      <Plus size={16} />
                      Add New Student Entry
                    </button>
                  </div>

                  <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4">Roll ID ID</th>
                          <th className="px-6 py-4">Academic Class</th>
                          <th className="px-6 py-4">Digital Mail</th>
                          <th className="px-6 py-4">Action Options</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 font-semibold text-slate-650 dark:text-slate-300">
                        {getFilteredData(students).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">No enrolled student match credentials.</td>
                          </tr>
                        ) : (
                          paginatedList(getFilteredData(students)).map((st: Student) => (
                            <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                              <td className="px-6 py-5 font-bold text-brand-navy dark:text-white leading-tight">
                                {st.name}
                              </td>
                              <td className="px-6 py-5 font-bold font-mono text-slate-700 dark:text-slate-350">{st.rollNumber}</td>
                              <td className="px-6 py-5 font-bold text-sm text-brand-accent">{st.class}</td>
                              <td className="px-6 py-5 font-medium leading-normal">{st.email}</td>
                              <td className="px-6 py-5">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => openEditModal(st, 'student')}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all"
                                    title="Edit Profile"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteStudent(st.id)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                                    title="Delete Entry"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Navigation */}
                  <div className="flex justify-between items-center px-4 font-mono text-xs">
                    <span className="text-slate-400">Page {currentPage} of {Math.max(Math.ceil(getFilteredData(students).length / itemsPerPage), 1)}</span>
                    <div className="flex gap-1.5">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-40 transition-all hover:scale-105"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button 
                        disabled={currentPage >= Math.max(Math.ceil(getFilteredData(students).length / itemsPerPage), 1)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-40 transition-all hover:scale-105"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 4: STAFF DIRECTORY MANAGEMENT */}
              {activeTab === 'staff' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button 
                      onClick={() => openAddModal('staff')}
                      className="px-5 py-3.5 bg-brand-navy dark:bg-blue-600 text-white text-xs font-black uppercase rounded-2xl flex items-center gap-2 shadow-lg transition-all hover:scale-101 cursor-pointer"
                    >
                      <Plus size={16} />
                      Add Faculty Staff profile
                    </button>
                  </div>

                  <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">Faculty Name</th>
                          <th className="px-6 py-4">Professional Role</th>
                          <th className="px-6 py-4">Allocated Department</th>
                          <th className="px-6 py-4">Digital Mail</th>
                          <th className="px-6 py-4">Actions Options</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 font-semibold text-slate-650 dark:text-slate-300">
                        {getFilteredData(staff).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">No matching faculty profile in system archives.</td>
                          </tr>
                        ) : (
                          paginatedList(getFilteredData(staff)).map((sf: Staff) => (
                            <tr key={sf.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                              <td className="px-6 py-5 font-bold text-brand-navy dark:text-white leading-tight">
                                {sf.name}
                              </td>
                              <td className="px-6 py-5 font-bold font-mono text-xs">{sf.role}</td>
                              <td className="px-6 py-5">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] uppercase font-black tracking-wide text-brand-blue dark:text-blue-450">
                                  {sf.department}
                                </span>
                              </td>
                              <td className="px-6 py-5 font-medium leading-normal">{sf.email}</td>
                              <td className="px-6 py-5">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => openEditModal(sf, 'staff')}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all"
                                    title="Edit Faculty detail"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteStaff(sf.id)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                                    title="Revoke Faculty"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Section */}
                  <div className="flex justify-between items-center px-4 font-mono text-xs">
                    <span className="text-slate-400">Page {currentPage} of {Math.max(Math.ceil(getFilteredData(staff).length / itemsPerPage), 1)}</span>
                    <div className="flex gap-1.5">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-40 transition-all hover:scale-105"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button 
                        disabled={currentPage >= Math.max(Math.ceil(getFilteredData(staff).length / itemsPerPage), 1)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 disabled:opacity-40 transition-all hover:scale-105"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 5: DYNAMIC FEES UPDATION PANEL */}
              {activeTab === 'fees' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dynamic Invoicing & Fee Configurations</p>
                      <h3 className="text-lg font-black dark:text-white mt-1">Configure active school tuition fees structure</h3>
                    </div>
                    <button 
                      onClick={() => openAddModal('fees')}
                      className="px-5 py-3 bg-brand-navy dark:bg-blue-600 hover:bg-brand-accent text-white text-xs font-black uppercase rounded-2xl flex items-center gap-2 shadow-md transition-all hover:scale-101 cursor-pointer shrink-0"
                    >
                      <Plus size={16} />
                      Add Fee Standard
                    </button>
                  </div>

                  {/* Medium Filter tabs inside workspace */}
                  <div className="flex gap-4">
                    {['semi-english', 'english'].map(med => (
                      <button
                        key={med}
                        onClick={() => {
                          setFeeForm(f => ({ ...f, medium: med }));
                          setCurrentPage(1);
                        }}
                        className={`px-6 py-3 rounded-2xl text-xs font-extrabold capitalize transition-all border ${
                          feeForm.medium === med
                            ? 'bg-white dark:bg-slate-900 border-brand-accent/50 text-brand-navy dark:text-blue-400 shadow-md shadow-slate-100 dark:shadow-none'
                            : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {med === 'semi-english' ? 'Semi-English Track' : 'English Medium Track'}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-400 uppercase tracking-widest font-extrabold border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-5">Grade / Standard</th>
                            <th className="px-6 py-5 text-center">Admission Fee</th>
                            {feeForm.medium === 'semi-english' && (
                              <th className="px-6 py-5 text-center">Reg & Other</th>
                            )}
                            <th className="px-6 py-5 text-center">Monthly Tuition</th>
                            <th className="px-6 py-5 text-center">Term fee</th>
                            <th className="px-6 py-5 text-center">Total Annual</th>
                            <th className="px-6 py-5 text-right pr-8">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 font-semibold text-slate-650 dark:text-slate-300">
                          {fees.filter(f => f.medium === feeForm.medium).length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                No dynamic templates mapped for {feeForm.medium} track. Track is empty.
                              </td>
                            </tr>
                          ) : (
                            fees.filter(f => f.medium === feeForm.medium).map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                                <td className="px-6 py-5 font-bold text-brand-navy dark:text-white text-base">
                                  {item.class}
                                </td>
                                <td className="px-6 py-5 text-center text-slate-705 dark:text-slate-300">{item.admission}</td>
                                {feeForm.medium === 'semi-english' && (
                                  <td className="px-6 py-5 text-center text-slate-705 dark:text-slate-300">{item.regOther}</td>
                                )}
                                <td className="px-6 py-5 text-center text-slate-705 dark:text-slate-300">{item.monthly}/mo</td>
                                <td className="px-6 py-5 text-center text-slate-705 dark:text-slate-300">{item.term}</td>
                                <td className="px-6 py-5 text-center bg-brand-accent/5 dark:bg-slate-850 text-brand-navy dark:text-blue-400 font-extrabold text-sm">{item.total}</td>
                                <td className="px-6 py-5 text-right pr-8">
                                  <div className="flex justify-end items-center gap-1.5 font-bold">
                                    <button 
                                      onClick={() => openEditModal(item, 'fees')}
                                      className="p-2 text-slate-400 hover:text-brand-blue bg-slate-50 dark:bg-slate-950 rounded-xl transition-all hover:scale-105 cursor-pointer"
                                      title="Edit fee standard"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteFee(item.id)}
                                      className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-950 rounded-xl transition-all hover:scale-105 cursor-pointer"
                                      title="Delete fee standard"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 5.5: ROSTER ATTENDANCE PANEL */}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  {/* Top Bar Config Control */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm gap-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Attendance Register & Analytics</p>
                      <h3 className="text-lg font-black dark:text-white mt-1">Record, sync & export student attendance</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      {/* Class selector */}
                      <div className="flex flex-col min-w-44">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Class Cohort</label>
                        <select 
                          className="px-4 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-brand-accent/40 text-slate-700 dark:text-slate-300"
                          value={attendanceClass}
                          onChange={e => setAttendanceClass(e.target.value)}
                        >
                          <option value="All">All Classes (Show All)</option>
                          {Array.from(new Set([
                            ...students.map(s => s.class),
                            "10A", "10C", "11B", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "6th Std", "7th Std", "8th Std", "9th Std", "10th Std"
                          ])).filter(Boolean).sort().map(classNameStr => (
                            <option key={classNameStr} value={classNameStr}>{classNameStr}</option>
                          ))}
                        </select>
                      </div>

                      {/* Date selector */}
                      <div className="flex flex-col min-w-36">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Attendance Date</label>
                        <input 
                          type="date"
                          className="px-4 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-brand-accent/40 text-slate-700 dark:text-slate-300"
                          value={attendanceDate}
                          onChange={e => setAttendanceDate(e.target.value)}
                        />
                      </div>

                      {/* Main Sync Load button */}
                      <button 
                        onClick={fetchAttendanceSheet}
                        disabled={attendanceSyncLoading}
                        className="self-end px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-300 text-xs font-black uppercase rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-101 cursor-pointer shrink-0"
                      >
                        {attendanceSyncLoading ? 'Syncing...' : 'Load Roster'}
                      </button>
                    </div>
                  </div>

                  {/* Attendance Records Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
                      <div>
                        <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">
                          Roster Listing • {attendanceClass}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          Date: <span className="font-bold text-slate-600 dark:text-slate-300">{attendanceDate}</span>
                        </p>
                      </div>

                      {attendanceRecords.length > 0 && (
                        <div className="flex items-center gap-3">
                          {/* Save Button */}
                          <button 
                            onClick={handleSaveAttendance}
                            disabled={attendanceSyncLoading}
                            className="px-5 py-2.5 bg-brand-navy hover:bg-brand-accent dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-black uppercase rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-101 cursor-pointer"
                          >
                            <Check size={14} />
                            Save Attendance
                          </button>

                          {/* Download PDF Button */}
                          <button 
                            onClick={downloadAttendancePDF}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-101 cursor-pointer"
                          >
                            <FileCheck size={14} />
                            Download PDF
                          </button>
                        </div>
                      )}
                    </div>

                    {attendanceRecords.length === 0 ? (
                      <div className="py-24 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mx-auto text-slate-400 mb-4 animate-pulse">
                          <UserCheck size={28} />
                        </div>
                        <h5 className="font-bold text-slate-700 dark:text-slate-300 text-base">Roster is empty</h5>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-semibold">
                          Click <strong>"Load Roster"</strong> above to retrieve and begin recording student presence marks for {attendanceClass}.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              <th className="pb-4 pl-4 w-16">#</th>
                              <th className="pb-4 w-32">Roll Number</th>
                              <th className="pb-4">Student Pupil Name</th>
                              <th className="pb-4 text-center w-40">Presence Status</th>
                              <th className="pb-4 text-right pr-4 w-32">Quick Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-850/50 text-xs font-semibold text-slate-650 dark:text-slate-300">
                            {attendanceRecords.map((st, index) => {
                              const isPresent = st.status === 'Present';
                              return (
                                <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                                  <td className="py-4 pl-4 font-bold text-slate-400 font-mono">
                                    {String(index + 1).padStart(2, '0')}
                                  </td>
                                  <td className="py-4 font-mono font-bold text-brand-navy dark:text-blue-450">
                                    {st.rollNumber}
                                  </td>
                                  <td className="py-4 font-bold text-slate-800 dark:text-white text-sm">
                                    {st.name}
                                  </td>
                                  <td className="py-4 text-center animate-fade-in">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                      isPresent 
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40' 
                                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                      {st.status}
                                    </span>
                                  </td>
                                  <td className="py-4 text-right pr-4">
                                    <button
                                      onClick={() => handleToggleAttendanceStatus(st.id)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all hover:scale-102 ${
                                        isPresent 
                                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30' 
                                          : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                                      } cursor-pointer`}
                                    >
                                      Mark {isPresent ? 'Absent' : 'Present'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PAGE 6: PHOTO GALLERY MANAGER */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Public Photo Archive</p>
                      <h3 className="text-lg font-black dark:text-white mt-1">Manage public landing photo exhibit cards</h3>
                    </div>
                    <button 
                      onClick={() => openAddModal('gallery')}
                      className="px-5 py-3 bg-brand-navy dark:bg-blue-600 hover:bg-brand-accent text-white text-xs font-black uppercase rounded-2xl flex items-center gap-2 shadow-md transition-all hover:scale-101 cursor-pointer shrink-0"
                    >
                      <Plus size={16} />
                      Upload Album Image
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery.map(img => (
                      <div key={img.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between overflow-hidden">
                        <img 
                          src={img.url} 
                          alt={img.title} 
                          className="w-full h-44 object-cover rounded-2xl" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase text-slate-400">{img.category}</span>
                          <h4 className="text-sm font-black dark:text-white leading-tight">{img.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* COMPREHENSIVE MODALS FOR ADMIN CRUD ACTIONS */}
      {isModalOpen && (
        <div key="modal-overlay" className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl space-y-6 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-lg font-black uppercase tracking-tight dark:text-white text-brand-navy">
                {editingItem ? `Modify ${modalType}` : `Register New ${modalType}`}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 dark:bg-slate-950 rounded-full transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Student Forms */}
            {modalType === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">FullName</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. Alexander Pierce" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={studentForm.name}
                    onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Roll number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. S2404" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none font-mono"
                    value={studentForm.rollNumber}
                    onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Roster cohort Class</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. 10A" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={studentForm.class}
                    onChange={e => setStudentForm({ ...studentForm, class: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Authorized e-mail</label>
                  <input 
                    type="email" 
                    required
                    placeholder="E.g. student@sch.org" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={studentForm.email}
                    onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 bg-brand-navy dark:bg-blue-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer"
                >
                  {actionLoading ? 'Saving changes...' : 'Save Student records'}
                </button>
              </form>
            )}

            {/* Staff Forms */}
            {modalType === 'staff' && (
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Faculty Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. Dr. Robert Blake" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={staffForm.name}
                    onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Academic Role</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. Senior Lecturer" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={staffForm.role}
                    onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Department</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. Mathematics" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={staffForm.department}
                    onChange={e => setStaffForm({ ...staffForm, department: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="E.g. r.blake@school.org" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={staffForm.email}
                    onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 bg-brand-navy dark:bg-blue-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save staff profiling'}
                </button>
              </form>
            )}

            {/* Fees template form config */}
            {modalType === 'fees' && (
              <form onSubmit={handleFeeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Class Track Medium</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={feeForm.medium}
                    onChange={e => setFeeForm({ ...feeForm, medium: e.target.value })}
                  >
                    <option value="semi-english">Semi-English Track</option>
                    <option value="english">English Medium Track</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Class Name / Grade standard</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. Class 1 or 5th Std" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={feeForm.class}
                    onChange={e => setFeeForm({ ...feeForm, class: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Admission Fee</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.g. 5000" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                      value={feeForm.admission}
                      onChange={e => setFeeForm({ ...feeForm, admission: e.target.value })}
                    />
                  </div>

                  {feeForm.medium === 'semi-english' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">Reg & Other Fees</label>
                      <input 
                        type="text" 
                        required
                        placeholder="E.g. 1500" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                        value={feeForm.regOther}
                        onChange={e => setFeeForm({ ...feeForm, regOther: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5 opacity-40">
                      <label className="text-[10px] font-black uppercase text-slate-400">Reg & Other Fees</label>
                      <input 
                        type="text" 
                        disabled
                        placeholder="N/A for English Medium" 
                        className="w-full px-4 py-2 bg-slate-200 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Monthly Tuition Fee</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.g. 350" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                      value={feeForm.monthly}
                      onChange={e => setFeeForm({ ...feeForm, monthly: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Term Fee</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.g. 1000" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                      value={feeForm.term}
                      onChange={e => setFeeForm({ ...feeForm, term: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Override Total Annual Fee (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Auto-calculated if blank" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none font-sans"
                    value={feeForm.total}
                    onChange={e => setFeeForm({ ...feeForm, total: e.target.value })}
                  />
                  <p className="text-[9px] text-slate-400 font-medium leading-none">Leave empty to auto-sum: Admission + Reg + (Monthly × 12) + Term.</p>
                </div>

                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 bg-brand-navy dark:bg-blue-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Apply Fee Structure template'}
                </button>
              </form>
            )}

            {/* Gallery Upload Forms */}
            {modalType === 'gallery' && (
              <form onSubmit={handleGallerySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Album asset Image URL</label>
                  <input 
                    type="url" 
                    required
                    placeholder="Https://images.unsplash.com/your-image-url" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={galleryForm.url}
                    onChange={e => setGalleryForm({ ...galleryForm, url: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Image Caption Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. State Level Hockey Champions" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={galleryForm.title}
                    onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Album category Tag</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. Sports" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    value={galleryForm.category}
                    onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-brand-navy dark:bg-blue-600 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer"
                >
                  Add asset image card
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
