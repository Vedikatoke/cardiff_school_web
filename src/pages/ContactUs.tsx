import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-12 text-center lg:text-left">
            <div className="max-w-2xl">
                <h1 className="text-5xl lg:text-7xl font-black text-brand-navy mb-8 tracking-tighter">Get in Touch.</h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                    Have questions about our curriculum or facilities? We're here to help you make the best decision for your child's future.
                </p>
            </div>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-40">
             <div className="p-12 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-10">
                    <MapPin size={28} />
                </div>
                <h3 className="text-2xl font-black text-brand-navy mb-6 tracking-tight">Main Campus</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-10">
                   Nana-Nanipark Manvelpada road Virar east 401305, Maharashtra, India.
                </p>
                <a href="#" className="flex items-center gap-3 text-brand-navy font-black uppercase tracking-widest text-[10px] hover:text-brand-accent transition-all">
                    Show on Google Maps <ArrowRight size={14} />
                </a>
             </div>

             <div className="p-12 bg-brand-navy text-white rounded-[40px] shadow-2xl transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-accent mb-10">
                    <Phone size={28} />
                </div>
                <h3 className="text-2xl font-black mb-6 tracking-tight">Support Lines</h3>
                <div className="space-y-4 mb-10">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Admissions</span>
                      <a href="tel:+918446117595" className="text-xl font-bold hover:text-brand-accent transition-colors">+91 8446117595</a>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reception</span>
                      <a href="tel:+918446117595" className="text-xl font-bold hover:text-brand-accent transition-colors">+91 8446117595</a>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Office Contact</span>
                      <a href="tel:+918208663909" className="text-xl font-bold hover:text-brand-accent transition-colors">+91 8208663909</a>
                   </div>
                </div>
                <a href="mailto:admissions@cardiffschool.com" className="flex items-center gap-3 text-brand-accent font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">
                    Contact Admissions <ArrowRight size={14} />
                </a>
             </div>

             <div className="p-12 bg-slate-50 rounded-[40px] border border-slate-100 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-accent mb-10">
                    <Clock size={28} />
                </div>
                <h3 className="text-2xl font-black text-brand-navy mb-6 tracking-tight">Office Hours</h3>
                <ul className="space-y-3 text-slate-500 font-medium text-sm">
                   <li className="flex justify-between border-b border-slate-200 pb-2">
                      <span>Mon - Fri</span>
                      <span className="font-bold text-brand-navy">8:00 AM - 4:00 PM</span>
                   </li>
                   <li className="flex justify-between border-b border-slate-200 pb-2">
                      <span>Saturday</span>
                      <span className="font-bold text-brand-navy">9:00 AM - 1:00 PM</span>
                   </li>
                   <li className="flex justify-between">
                      <span>Sunday</span>
                      <span className="font-bold text-red-500">Closed</span>
                   </li>
                </ul>
             </div>
        </div>

        {/* Map Section */}
        <section className="mb-40">
            <div className="rounded-[50px] overflow-hidden shadow-2xl h-[500px] relative border-8 border-white">
                {/* Embedded Map Simulation - In a real app we'd use Google Maps Embed */}
                <img 
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop" 
                  alt="City Map Placeholder" 
                  className="w-full h-full object-cover grayscale opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-md p-10 rounded-[40px] shadow-2xl text-center max-w-sm border border-slate-100 border border-brand-accent/20">
                        <MapPin size={48} className="text-brand-accent mx-auto mb-6" />
                        <h4 className="text-2xl font-black text-brand-navy mb-4 tracking-tighter">Find us in Virar.</h4>
                        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                            Located in the heart of Virar East, our campus is easily accessible and provides a safe haven for students.
                        </p>
                        <button className="w-full py-4 bg-brand-navy text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-brand-accent shadow-xl shadow-brand-navy/20 transition-all">
                            Get Directions
                        </button>
                    </div>
                </div>
            </div>
        </section>


      </div>
    </div>
  );
}
