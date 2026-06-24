import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import schoolLogo from '../assets/images/logo.jpeg';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Academics', path: '/academics' },
  { name: 'Faculty', path: '/faculty' },
  { name: 'Facilities', path: '/facilities' },
  { name: 'Events', path: '/events' },
  { name: 'Fees', path: '/fees' },
  { name: 'Admissions', path: '/admissions' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed w-full z-50 transition-all duration-300">
      {/* Top Bar */}
      <div className={`bg-brand-navy text-white text-[11px] py-2 px-6 transition-all duration-300 ${scrolled ? 'h-0 opacity-0 overflow-hidden py-0' : 'h-auto opacity-100'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+918446117595" className="flex items-center gap-2 hover:text-brand-accent transition-colors">
              <Phone size={12} /> Admissions: +91 8446117595
            </a>
            <a href="tel:+918208663909" className="flex items-center gap-2 hover:text-brand-accent transition-colors border-l border-white/25 pl-4 ml-2">
              <Phone size={12} /> Office: +91 8208663909
            </a>
            <a href="mailto:admissions@cardiffschool.com" className="flex items-center gap-2 hover:text-brand-accent transition-colors">
              <Mail size={12} /> admissions@cardiffschool.com
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`transition-all duration-500 ${scrolled ? 'bg-white shadow-xl py-3' : 'bg-white/90 backdrop-blur-md py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 relative flex items-center justify-center rounded-xl overflow-hidden border border-slate-100/10 shadow-sm transition-transform group-hover:scale-105">
              <img 
                src={schoolLogo} 
                alt="Cardiff International School Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-extrabold text-brand-navy leading-none tracking-tighter">CARDIFF</span>
              <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mt-1">International School</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-semibold tracking-tight transition-all relative ${
                  location.pathname === link.path ? 'text-brand-accent' : 'text-slate-600 hover:text-brand-navy'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-accent"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2 text-brand-navy hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-bold ${
                    location.pathname === link.path ? 'text-brand-accent pl-2 border-l-4 border-brand-accent' : 'text-slate-600 pl-0'
                  } transition-all duration-300 hover:text-brand-navy hover:pl-2`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
