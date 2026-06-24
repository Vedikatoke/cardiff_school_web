import { motion } from 'motion/react';
import { Target, Heart, Eye, BookOpen, ShieldCheck, Star } from 'lucide-react';

const values = [
  { title: 'Excellence', desc: 'Striving for the highest standards in everything we do.', icon: Star },
  { title: 'Integrity', desc: 'Acting with honesty, fairness, and mutual respect.', icon: ShieldCheck },
  { title: 'Innovation', desc: 'Embracing change and fostering creative thinking.', icon: BookOpen },
  { title: 'Compassion', desc: 'Caring for one another and the wider community.', icon: Heart },
];

export default function AboutUs() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-24">
          <h1 className="text-5xl lg:text-7xl font-black text-brand-navy mb-8 tracking-tighter">About Our School.</h1>
          <p className="text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
            Founded in 2000, Cardiff International School has grown from a visionary idea into one of the region's most respected educational institutions.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-40 relative">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative bg-slate-50 border border-slate-100 p-12 lg:p-16 rounded-[40px] z-10 shadow-sm">
            <h2 className="text-3xl lg:text-4xl font-black text-brand-navy mb-8 tracking-tight text-center">Our Journey & Philosophy</h2>
            <div className="space-y-6 text-slate-600 font-medium leading-relaxed text-lg text-center max-w-2xl mx-auto">
              <p>
                At Cardiff, we believe that education is more than just academic grades. Excellence is a habit we cultivate daily. Our journey began with a simple mission: to provide a global education that respects local values.
              </p>
              <p>
                We have built a state-of-the-art campus that serves as a lab for learning, where every corridor and classroom is designed to spark curiosity. Our curriculum provides the structure, while our dedicated teachers provide the soul of the experience.
              </p>
              <p>
                Today, we take pride in our urban campus and co-educational environment, specializing in standards 8 to 10 and preparing our students for a borderless world.
              </p>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-40">
          <div className="bg-brand-navy p-12 rounded-[40px] text-white">
            <div className="w-16 h-16 rounded-2xl bg-brand-accent flex items-center justify-center mb-8">
              <Target size={32} />
            </div>
            <h3 className="text-3xl font-black mb-6">Our Mission</h3>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              To empower students with the knowledge, skills, and values they need to thrive in a globalized world, fostering a passion for lifelong learning and academic excellence.
            </p>
          </div>
          <div className="bg-brand-accent p-12 rounded-[40px] text-white">
            <div className="w-16 h-16 rounded-2xl bg-white text-brand-accent flex items-center justify-center mb-8">
              <Eye size={32} />
            </div>
            <h3 className="text-3xl font-black mb-6">Our Vision</h3>
            <p className="text-brand-navy/60 text-lg leading-relaxed font-medium">
              To be a leading center of educational excellence, recognized globally for producing innovative, compassionate leaders who positively impact their communities and the world.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="text-center mb-24">
          <h2 className="text-4xl font-black text-brand-navy mb-6 tracking-tighter">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {values.map((v, idx) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 rounded-[30px] border border-slate-100 hover:border-brand-accent/30 hover:shadow-2xl hover:shadow-brand-navy/5 transition-all text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-brand-accent mx-auto mb-8 group-hover:bg-brand-accent group-hover:text-white transition-all">
                  <v.icon size={28} />
                </div>
                <h4 className="text-xl font-bold text-brand-navy mb-4">{v.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
