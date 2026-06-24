import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, GraduationCap, Clock, BookOpen } from 'lucide-react';

const faculty = [
  {
    name: 'Mrs.Vaishali L.Toke',
    role: 'Head of School',
    subject: 'Mathematics',
    qualification: 'Bsc B.ed',
    experience: '20+ Years',
    image: '/vaishalitoke.jpg',
  },
  {
    name: 'Mrs. Janhvi J.Thakur',
    role: 'Sr.Asst.Teacher',
    subject: 'Marathi',
    qualification: 'B.A.Bed',
    experience: '12 Years',
    image: '/Janhavithakur.jpg',
  },
  {
    name: 'Mrs.Jyoti K.Satardekar',
    role: 'Lead Educator',
    subject: 'English Literature',
    qualification: 'Bsc Bed',
    experience: '10 Years',
    image: '/jyotisatardekar.jpg',
  },
  {
    name: 'Mrs.Sunanda M.Chaudhari',
    role: 'Teacher',
    subject: 'Science & History',
    qualification: 'B.A.Bed',
    experience: '15 Years',
    image: '/sunandachaudhari.jpg',
  },
  {
    name: 'Mrs.Manisha D.Bhoir',
    role: 'Ass.HOD',
    subject: 'Physical Education',
    qualification: 'B.A. Art',
    experience: '8 Years',
    image: '/manishbhoir.jpg',
  },
  {
    name: 'Mr.Rupesh L.Mishra',
    role: 'Mathematics & Geography',
    subject: 'Social Studies',
    qualification: 'Bsc Bed',
    experience: '6 Years',
    image: '/rupeshmishra.jpg',
  },
 
];

export default function Faculty() {
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>({});

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-24 text-center">
            <h1 className="text-5xl lg:text-7xl font-black text-brand-navy mb-8 tracking-tighter">Our Faculty.</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Our experienced educators are passionate about inspiring the next generation of students.
            </p>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {faculty.map((member, idx) => (
              <motion.div
                key={`${member.name}-${idx}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] mb-8 shadow-xl bg-slate-100 flex items-center justify-center">
                    {!erroredImages[member.name] ? (
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                          onError={() => {
                            setErroredImages(prev => ({ ...prev, [member.name]: true }));
                          }}
                        />
                    ) : (
                        <div className="w-full h-full bg-brand-navy flex flex-col items-center justify-center p-8 text-center border border-brand-accent/15">
                            <GraduationCap size={48} className="text-brand-accent/50 mb-4 animate-pulse" />
                            <span className="text-white/60 font-mono text-xs uppercase tracking-widest">{member.subject}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Hover Info Overlay */}
                    <div className="absolute bottom-10 left-10 right-10 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex gap-4">
                           <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-brand-accent transition-colors">
                             <Mail size={18} className="text-white" />
                           </a>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="px-2">
                    <span className="text-xs font-black uppercase tracking-widest text-brand-accent mb-2 block">{member.role}</span>
                    <h3 className="text-2xl font-black text-brand-navy mb-4 tracking-tight">{member.name}</h3>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-500">
                            <BookOpen size={16} className="text-slate-400" />
                            <span className="text-sm font-bold tracking-tight">{member.subject}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                            <GraduationCap size={16} className="text-slate-400" />
                            <span className="text-xs font-medium leading-tight">{member.qualification}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                            <Clock size={16} className="text-slate-400" />
                            <span className="text-xs font-bold uppercase tracking-widest">{member.experience} Experience</span>
                        </div>
                    </div>
                </div>
              </motion.div>
            ))}
        </div>

      </div>
    </div>
  );
}
