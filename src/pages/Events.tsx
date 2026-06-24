import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin } from 'lucide-react';

import republicDayImg from '../assets/images/republicday.jpg';
import independenceDayImg from '../assets/images/independenceday.jpg';
import dahiHandiImg from '../assets/images/Dahihandi.jpg';
import rakshaBandhanImg from '../assets/images/Rakshabandhancraft.jpg';
import yogaDayImg from '../assets/images/YogaDay.jpg';

const events = [
  {
    title: 'Republic Day Parade',
    date: 'Jan 26, 2026',
    time: '7:30 AM - 10:30 AM',
    location: 'School Parade Ground',
    image: republicDayImg,
    category: 'Cultural',
  },
  {
    title: 'Independence Day Ceremony',
    date: 'Aug 15, 2025',
    time: '8:00 AM - 11:30 AM',
    location: 'School Assembly Grounds',
    image: independenceDayImg,
    category: 'Cultural',
  },
  {
    title: 'Dahi Handi Celebration',
    date: 'Aug 14, 2025',
    time: '10:00 AM - 1:00 PM',
    location: 'Central Courtyard',
    image: dahiHandiImg,
    category: 'Cultural',
  },
  {
    title: 'Raksha Bandhan Craft Exhibition',
    date: 'Aug 06, 2025',
    time: '9:00 AM - 12:30 PM',
    location: 'Assembly Hall',
    image: rakshaBandhanImg,
    category: 'Cultural',
  },
  {
    title: 'International Yoga Day',
    date: 'Jun 20, 2025',
    time: '8:00 AM - 9:35 AM',
    location: 'Open Assembly Hall',
    image: yogaDayImg,
    category: 'Sports',
  },
];

export default function Events() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredEvents = selectedCategory === 'All'
    ? events
    : events.filter(event => event.category === selectedCategory);

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-2xl">
                <h1 className="text-5xl lg:text-7xl font-black text-brand-navy mb-8 tracking-tighter">Events & News.</h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                    Stay updated with the latest happenings, celebrations, and academic highlights at Cardiff.
                </p>
            </div>
            <div className="flex gap-4 flex-wrap">
                 {['All', 'Academic', 'Sports', 'Cultural'].map(cat => (
                   <button 
                     key={cat} 
                     onClick={() => setSelectedCategory(cat)}
                     className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                   >
                     {cat}
                   </button>
                 ))}
            </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[30px] mb-8 shadow-xl">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-brand-navy shadow-lg">
                        {event.category}
                    </div>
                </div>

                <div className="px-2">
                    <div className="flex items-center gap-4 text-brand-accent font-bold text-xs uppercase tracking-widest mb-4">
                        <Calendar size={14} /> {event.date}
                    </div>
                    <h3 className="text-2xl font-black text-brand-navy mb-6 tracking-tight group-hover:text-brand-accent transition-colors leading-tight">
                        {event.title}
                    </h3>

                    <div className="space-y-3 mb-10">
                        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                            <Clock size={16} className="text-slate-400" />
                            <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                            <MapPin size={16} className="text-slate-400" />
                            <span>{event.location}</span>
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
