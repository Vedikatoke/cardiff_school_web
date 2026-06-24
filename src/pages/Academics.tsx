import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import secondaryEducationImg from '../assets/images/indian_students_1779435460596.png';

const sections = [
  {
    title: 'Secondary Education',
    age: '8 to 10',
    focus: 'Rigorous academic preparation focusing on core excellence and competitive standards.',
    features: ['Science Labs', 'Computer Labs', 'Cultural Activities', 'Analytical Mathematics', 'Library'],
    image: secondaryEducationImg,
  },
];

export default function Academics() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-black text-brand-navy mb-8 tracking-tighter">Academics.</h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              We provide a rigorous academic environment focused on excellence, specialized for students in Standards 8 to 10.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-brand-accent/10 rounded-2xl text-brand-accent font-black text-sm uppercase tracking-widest whitespace-nowrap">
               Academic Excellence
             </div>
          </div>
        </div>

        {/* Teaching Methodology */}
        <section className="mb-40 bg-brand-navy p-12 lg:p-20 rounded-[50px] text-white relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-5 col-span-1">
              <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tighter leading-tight">Our Teaching Methodology</h2>
              <p className="text-slate-400 font-medium leading-relaxed text-lg">
                We move beyond traditional rote learning to focus on inquiry, critical thinking, and collaborative problem-solving.
              </p>
            </div>
            <div className="lg:col-span-7 col-span-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
               {[
                 { title: 'Student-Centered', desc: 'Focusing on individual learning styles.' },
                 { title: 'Inquiry-Based', desc: 'Encouraging students to ask "Why?".' },
                 { title: 'Well-Rounded', desc: 'Ensuring balanced growth in all areas.' }
               ].map(item => (
                 <div key={item.title} className="bg-white/5 border border-white/5 p-8 rounded-[30px] hover:bg-white/10 transition-all">
                    <h4 className="text-brand-accent font-black uppercase tracking-widest text-[11px] mb-3">{item.title}</h4>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </section>

        {/* Academic Levels */}
        <div className="space-y-40">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col lg:flex-row items-center gap-20 ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="lg:w-1/2">
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-4 py-1.5 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full">{section.age}</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <h2 className="text-4xl font-black text-brand-navy mb-8 tracking-tight">{section.title}</h2>
                <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12 italic border-l-4 border-brand-accent pl-8">
                  "{section.focus}"
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {section.features.map(feature => (
                    <div key={feature} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle2 size={22} className="text-brand-accent" />
                      <span className="font-bold tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="rounded-[40px] overflow-hidden shadow-2xl h-[450px] relative group">
                  <img 
                    src={section.image} 
                    alt={section.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-navy/20 group-hover:bg-transparent transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
