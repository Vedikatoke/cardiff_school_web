import { motion } from 'motion/react';
import { FlaskConical, Library, Trophy, Wifi } from 'lucide-react';
import indianModernLabImg from '../assets/images/indian_modern_lab_1779435809772.png';

const facilities = [
  { title: 'Library', icon: Library, desc: 'A vast collection of books and resources to support student learning and research.' },
  { title: 'Science Labs', icon: FlaskConical, desc: 'Advanced Physics, Chemistry, and Biology labs designed for practical exploration.' },
  { title: 'Sports Arena', icon: Trophy, desc: 'Multi-purpose courts for basketball, football, and other outdoor sports.' },
  { title: 'High-Speed Wi-Fi', icon: Wifi, desc: 'Secure, high-bandwidth connectivity throughout the campus for research.' },
];

export default function Facilities() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-24 flex flex-col lg:flex-row items-end gap-12">
            <div className="max-w-2xl">
                <h1 className="text-5xl lg:text-7xl font-black text-brand-navy mb-8 tracking-tighter">Facilities.</h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                    Our world-class infrastructure is designed to facilitate discovery, creativity, and physical well-being.
                </p>
            </div>
            <div className="flex-1" />
        </div>

        {/* Highlight Image Section */}
        <div className="mb-40">
             <div className="aspect-video rounded-[40px] overflow-hidden shadow-2xl relative group">
                <img 
                  src={indianModernLabImg} 
                  alt="Modern Computer and Science Lab" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
                <div className="absolute bottom-10 left-10 text-white">
                    <h3 className="text-3xl font-black mb-2">Computer & Science Labs</h3>
                    <p className="text-slate-200 font-medium tracking-tight">Our leading-edge science and technology block.</p>
                </div>
             </div>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {facilities.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-accent/5 text-brand-accent flex items-center justify-center mb-8 group-hover:bg-brand-accent group-hover:text-white transition-all shadow-sm">
                  <f.icon size={28} />
                </div>
                <h4 className="text-xl font-bold text-brand-navy mb-4 tracking-tight">{f.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{f.desc}</p>
                <div className="mt-6 w-8 h-1 bg-slate-100 group-hover:w-16 group-hover:bg-brand-accent transition-all duration-500" />
              </motion.div>
            ))}
        </div>

        {/* Campus Atmosphere Callout */}
        <div className="mt-40 bg-slate-50 rounded-[50px] p-12 lg:p-24 border border-slate-100 flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
                <h2 className="text-4xl lg:text-5xl font-black text-brand-navy mb-8 tracking-tighter">A Holistic Learning Environment.</h2>
                <div className="space-y-6">
                    <p className="text-slate-600 font-medium leading-relaxed">
                        Cardiff International School provides a balanced campus experience. From our extensive library to our sports facilities, every aspect of our infrastructure is designed to support student growth.
                    </p>
                    <p className="text-slate-600 font-medium leading-relaxed">
                        Our infrastructure doesn't just support learning; it inspires it. Every square foot is designed to encourage collaboration and independence.
                    </p>
                </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                 {[
                   'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop',
                   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
                   'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop',
                   'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop'
                 ].map((img, i) => (
                   <div key={i} className={`rounded-3xl overflow-hidden shadow-lg h-32 md:h-48 ${i % 2 === 1 ? 'translate-y-8' : ''}`}>
                      <img src={img} className="w-full h-full object-cover" />
                   </div>
                 ))}
            </div>
        </div>
      </div>
    </div>
  );
}
