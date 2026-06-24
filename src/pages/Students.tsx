import { useState, useEffect } from 'react';
import * as React from 'react';
import api from '../lib/api';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Search, X, ShieldAlert } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';

interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  class: string;
}

export default function Students() {
  const isAdmin = useAdmin();
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', rollNumber: '', class: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      setStudents(res.data);
      setError(null);
    } catch (err) {
      setError('Could not fetch student records. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', rollNumber: '', class: '' });
      fetchStudents();
    } catch (err) {
      alert('Error saving student');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete student.';
      alert(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rollNumber.includes(search)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Filter records..." 
            className="pl-10 pr-4 py-2 bg-slate-200/50 border-none rounded-full text-sm w-full md:w-80 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setIsModalOpen(true); setEditingStudent(null); setFormData({ name: '', email: '', rollNumber: '', class: '' }); }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 flex items-center gap-2"
          >
            <Plus size={18} />
            New Enrollment
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-3 text-amber-700 text-sm">
          <ShieldAlert size={18} className="text-amber-500" />
          <p>You are in <strong>Read-Only Mode</strong>. Only administrators can add, edit, or delete records.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 text-center">Roll ID</th>
                <th className="px-6 py-4 text-center">Class</th>
                <th className="px-6 py-4">Email Address</th>
                {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono text-xs text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">#{student.rollNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-slate-600 font-medium">Grade {student.class}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{student.email}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 transition-opacity">
                        <button 
                          onClick={() => { setEditingStudent(student); setFormData(student); setIsModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Student"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          disabled={deletingId === student.id}
                          className={`p-2 rounded-lg transition-all ${deletingId === student.id ? 'text-slate-300 animate-pulse' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                          title="Delete Student"
                        >
                          {deletingId === student.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Roll Number</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Class</label>
                  <input 
                    required
                    placeholder="e.g. 10A"
                    type="text" 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold mt-6 shadow-lg shadow-indigo-600/20 transition-all"
              >
                {editingStudent ? 'Update Profile' : 'Register Student'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
