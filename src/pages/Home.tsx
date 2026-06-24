import { motion } from 'motion/react';
import { ArrowRight, Users, Trophy, BookOpen, Microscope, Music, Activity, Calendar, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { icon: Users, value: '400+', label: 'Students' },
  { icon: Calendar, value: '2000', label: 'Established' },
  { icon: BookOpen, value: '8 to 10', label: 'Standards' },
  { icon: Trophy, value: '24+', label: 'Years Excellence' },
  { icon: Building2, value: 'Urban', label: 'Campus Type' },
  { icon: Users, value: 'Co-ed', label: 'Education' },
];

const highlights = [
  {
    title: 'Experienced Faculty',
    description: 'Expert educators dedicated to student success with years of teaching excellence.',
    icon: BookOpen,
  },
  {
    title: 'Advanced Labs',
    description: 'State-of-the-art facilities for innovation and scientific exploration.',
    icon: Microscope,
  },
  {
    title: 'Holistic Development',
    description: 'Extensive focus on arts, music, and physical education.',
    icon: Music,
  },
  {
    title: 'Active Community',
    description: 'Collaborative environment involving parents, students, and staff.',
    icon: Activity,
  },
];

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-navy">
          <img 
            src="https://images.unsplash.com/photo-1523050853064-dbad350c7469?q=80&w=2070&auto=format&fit=crop" 
            alt="School Exterior" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay animate-fade-in"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tighter sm:whitespace-nowrap">
              Cardiff International School
            </h1>
            <h2 className="text-xl lg:text-2xl font-bold text-brand-accent mb-8 tracking-wide uppercase">
              Excellence in Education, Excellence in Life.
            </h2>
            <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-xl font-medium">
              Join a community where we blend traditional Indian values with modern educational excellence, preparing students for the challenges of tomorrow.
            </p>
          </motion.div>
        </div>

        {/* Animated Shapes */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl animate-pulse" />
      </section>

      {/* Key Stats */}
      <section className="relative z-10 -mt-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-8 rounded-3xl text-center group hover:scale-[1.02] transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mx-auto mb-6 group-hover:bg-brand-accent group-hover:text-white transition-all">
                <stat.icon size={32} />
              </div>
              <div className="text-4xl font-black text-brand-navy mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-black text-brand-navy mb-6 tracking-tighter">Why Choose Cardiff?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              We provide a nurturing environment that encourages academic achievement, personal growth, and global citizenship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {highlights.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-brand-navy/5 transition-all outline outline-transparent hover:outline-brand-accent/10"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-accent mb-8 group-hover:scale-110 transition-transform">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-4">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Highlight */}
      <section className="bg-brand-navy pt-24 pb-0 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          <div className="lg:w-1/2">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tighter">Academic Excellence</h2>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
              Our curriculum is designed to foster critical thinking, creativity, and a lifelong love for learning. We follow rigorous educational standards adapted for holistic student development.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {['Critical Thinking', 'Global Awareness', 'Communication', 'Collaborative Skills'].map(skill => (
                <div key={skill} className="flex items-center gap-4 text-white">
                  <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center">
                    <ArrowRight size={14} />
                  </div>
                  <span className="font-bold tracking-tight">{skill}</span>
                </div>
              ))}
            </div>
            <Link to="/academics" className="inline-block mt-12 text-brand-accent font-bold hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest text-xs">
              Learn about our academics <ArrowRight size={16} />
            </Link>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="rounded-[40px] overflow-hidden shadow-2xl skew-y-3 transform lg:rotate-3 bg-brand-navy/40">
              <img 
                src="https://images.unsplash.com/photo-1544717297-fa154ec09f5b?q=80&w=2070&auto=format&fit=crop" 
                alt="Student in Library" 
                className="w-full h-[500px] object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
