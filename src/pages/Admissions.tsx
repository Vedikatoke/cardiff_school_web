import { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Calendar, ArrowRight, Mail, Clock, ShieldCheck, Sparkles, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export default function Admissions() {
  const [formData, setFormData] = useState({
    studentName: '',
    grade: '8th',
    parentEmail: '',
    phone: '',
    previousSchool: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'error') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admissions', {
        studentName: formData.studentName,
        grade: formData.grade,
        parentEmail: formData.parentEmail,
        phone: formData.phone,
        previousSchool: formData.previousSchool || null
      });
      triggerToast('Admission Interest Registered Successfully!', 'success');
      setSubmitSuccess(true);
      setFormData({
        studentName: '',
        grade: '8th',
        parentEmail: '',
        phone: '',
        previousSchool: ''
      });
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to submit interest. Please check details or try again.';
      triggerToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-24 text-center">
          <span className="inline-block px-4 py-2 bg-brand-accent/20 text-brand-accent text-xs font-bold uppercase tracking-widest rounded-full mb-6 backdrop-blur-sm border border-brand-accent/30 animate-pulse">
            Admissions Open (2026-2027)
          </span>
          <h1 className="text-5xl lg:text-7xl font-black text-brand-navy mb-8 tracking-tighter">Admissions.</h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
            Simplified, direct, and zero stress. Connect directly with our counselor desk to resolve queries, schedule campus tours, and guide you through enrollment.
          </p>
        </div>

        {/* Hero Section of admissions - Card */}
        <div className="mb-40 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-50 border border-slate-100 p-12 lg:p-20 rounded-[50px]">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight">Admissions Inquiry Desk</h2>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed text-lg">
              Our support representatives are here to assist you at every step. Connect over phone or email to clarify enrollment rules, schedule a detailed counseling discussion, or learn more about our modern syllabus.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 flex-wrap">
              <a 
                href="tel:+918446117595" 
                className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-brand-navy hover:bg-brand-accent text-white font-black uppercase tracking-widest text-xs rounded-full transition-all shadow-xl shadow-brand-navy/20 active:scale-95"
              >
                <Phone size={16} /> Admissions Desk
              </a>
              <a 
                href="tel:+918208663909" 
                className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-brand-navy/80 hover:bg-brand-accent text-white font-black uppercase tracking-widest text-xs rounded-full transition-all shadow-xl shadow-brand-navy/15 active:scale-95"
              >
                <Phone size={16} /> Office: 8208663909
              </a>
              <a 
                href="mailto:admissions@cardiffschool.com" 
                className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-white border-2 border-slate-200 hover:border-brand-accent hover:text-brand-accent text-brand-navy font-black uppercase tracking-widest text-xs rounded-full transition-all active:scale-95"
              >
                <Mail size={16} /> Email Admissions
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-5">
            <div className="bg-white p-8 lg:p-10 rounded-[36px] border border-slate-200/60 shadow-xl shadow-slate-100/50 space-y-6">
              <div className="text-center pb-4 border-b border-indigo-50/60">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Direct Application</span>
                <h3 className="text-xl font-extrabold text-brand-navy mt-1">Admission Interest Form</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">Submit interest to instantly register with our admin council</p>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-brand-navy">Registration Interest Sent!</h4>
                    <p className="text-xs text-slate-500 max-w-[280px] mx-auto mt-1 leading-relaxed">
                      Thank you. We have saved your contact details. Our representative will contact you on your registered email or phone coordinates shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Submit New Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5 ml-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Atharva Mishra"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-transparent transition-all"
                      value={formData.studentName}
                      onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5 ml-1">Grade Level *</label>
                      <select
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent/40 transition-all font-mono"
                        value={formData.grade}
                        onChange={e => setFormData({ ...formData, grade: e.target.value })}
                      >
                        <option value="8th">Grade 8th</option>
                        <option value="9th">Grade 9th</option>
                        <option value="10th">Grade 10th</option>
                        <option value="Class 1">Class 1</option>
                        <option value="Class 2">Class 2</option>
                        <option value="Class 3">Class 3</option>
                        <option value="Class 4">Class 4</option>
                        <option value="Class 5">Class 5</option>
                        <option value="6th Std">6th Std</option>
                        <option value="7th Std">7th Std</option>
                        <option value="8th Std">8th Std</option>
                        <option value="9th Std">9th Std</option>
                        <option value="10th Std">10th Std</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5 ml-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 9876543210"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-transparent transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5 ml-1">Parent Email Coordinate *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. parent@email.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-transparent transition-all"
                      value={formData.parentEmail}
                      onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5 ml-1">Previous School Attended (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Little Flower Convent School"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-transparent transition-all"
                      value={formData.previousSchool}
                      onChange={e => setFormData({ ...formData, previousSchool: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 bg-brand-navy hover:bg-brand-accent text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Register Interest
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 3 Steps Section */}
        <section className="mb-40">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-brand-navy mb-4 tracking-tighter">Simplified Admission Walkthrough</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              How our streamlined Call & Connect procedure operates in three straight-forward steps:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative group p-10 bg-white border border-slate-100 shadow-xl shadow-slate-50 rounded-[40px] hover:border-brand-accent/20 hover:shadow-2xl hover:shadow-brand-navy/5 transition-all">
              <span className="absolute -top-6 left-10 text-5xl font-black text-brand-accent/20 select-none">01</span>
              <div className="w-14 h-14 rounded-2xl bg-brand-navy text-white flex items-center justify-center mb-8 mt-4 group-hover:bg-brand-accent transition-colors shadow-lg">
                <Phone size={24} />
              </div>
              <h3 className="text-2xl font-black text-brand-navy mb-4 tracking-tight">Call & Consultation</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                Call our admissions line at <strong className="text-brand-navy">+91 8446117595</strong> or office line at <strong className="text-brand-navy">+91 8208663909</strong> to connect with our counseling representatives. We'll answer all curriculum and schedule queries.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative group p-10 bg-white border border-slate-100 shadow-xl shadow-slate-50 rounded-[40px] hover:border-brand-accent/20 hover:shadow-2xl hover:shadow-brand-navy/5 transition-all">
              <span className="absolute -top-6 left-10 text-5xl font-black text-brand-accent/20 select-none">02</span>
              <div className="w-14 h-14 rounded-2xl bg-brand-navy text-white flex items-center justify-center mb-8 mt-4 group-hover:bg-brand-accent transition-colors shadow-lg">
                <Calendar size={24} />
              </div>
              <h3 className="text-2xl font-black text-brand-navy mb-4 tracking-tight">Campus Tour Visit</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                Schedule a real or virtual walkthrough of our state-of-the-art campus, class spaces, and labs. Witness first-hand how our kids thrive.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative group p-10 bg-white border border-slate-100 shadow-xl shadow-slate-50 rounded-[40px] hover:border-brand-accent/20 hover:shadow-2xl hover:shadow-brand-navy/5 transition-all">
              <span className="absolute -top-6 left-10 text-5xl font-black text-brand-accent/20 select-none">03</span>
              <div className="w-14 h-14 rounded-2xl bg-brand-navy text-white flex items-center justify-center mb-8 mt-4 group-hover:bg-brand-accent transition-colors shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-black text-brand-navy mb-4 tracking-tight">Instant Verification</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                Submit age proofs, medical forms, and transcripts physically at the registration desk to instantly obtain security codes and secure seat allocation.
              </p>
            </div>
          </div>
        </section>

        {/* Dark Call-to-action Block */}
        <section className="bg-brand-navy p-12 lg:p-24 rounded-[60px] text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tighter leading-tight">
              Ready to enroll? Speak to our counselor.
            </h2>
            <p className="text-lg text-slate-400 font-medium mb-8">
              Call us directly today. Our support office is active between 8:00 AM and 4:00 PM (Monday-Friday) and 9:00 AM to 1:00 PM on Saturdays.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-brand-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Response time: Instant</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-brand-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Location: Virar (E), Maharashtra</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-6 shrink-0 text-center">
            <a 
              href="tel:+918446117595" 
              className="px-10 py-6 bg-brand-accent text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-white hover:text-brand-navy transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
            >
              <Phone size={16} /> Admissions: 8446117595
            </a>
            <a 
              href="tel:+918208663909" 
              className="px-10 py-6 bg-white text-brand-navy font-black uppercase tracking-widest text-xs rounded-full hover:bg-brand-accent hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 border border-slate-200"
            >
              <Phone size={16} /> Office: 8208663909
            </a>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </section>
      </div>

      {toastMessage && (
        <div key="toast-box" className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-2.5 transition-all text-sm font-semibold border ${
          toastType === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toastType === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
