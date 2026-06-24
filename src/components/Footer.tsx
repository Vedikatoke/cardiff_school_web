import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import schoolLogo from '../assets/images/logo.jpeg';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* School Info */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 flex items-center justify-center rounded-xl overflow-hidden border border-white/5">
              <img 
                src={schoolLogo} 
                alt="Cardiff International School Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black leading-none tracking-tighter text-white">CARDIFF</span>
              <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mt-1">International School</span>
            </div>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">
            Empowering students to become global leaders through a world-class academic curriculum and a culture of excellence since 2000.
          </p>
          <div className="flex gap-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
              <a key={idx} href="#" className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-brand-accent hover:border-brand-accent transition-all text-slate-400 hover:text-white">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-8 relative inline-block">
            Quick Links
            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-brand-accent"></span>
          </h3>
          <ul className="space-y-4 text-slate-400 text-sm">
            {['Home', 'About Us', 'Academics', 'Faculty', 'Facilities', 'Admissions', 'Contact'].map((link) => (
              <li key={link}>
                <Link to={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`} className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all">
                  <ArrowRight size={14} className="text-brand-accent" /> {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>


        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold mb-8 relative inline-block">
            Contact
            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-brand-accent"></span>
          </h3>
          <ul className="space-y-6 text-slate-400 text-sm">
            <li className="flex gap-4">
              <MapPin size={28} className="text-brand-accent shrink-0" />
              <span>
                Nana-Nanipark Manvelpada road Virar east 401305<br />
                Maharashtra, India
              </span>
            </li>
            <li className="flex gap-4">
              <Phone size={20} className="text-brand-accent shrink-0" />
              <div className="flex flex-col gap-1 text-slate-400">
                <a href="tel:+918446117595" className="hover:text-white transition-colors">Admissions: +91 8446117595</a>
                <a href="tel:+918208663909" className="hover:text-white transition-colors">Office: +91 8208663909</a>
              </div>
            </li>
            <li className="flex gap-4">
              <Mail size={20} className="text-brand-accent shrink-0" />
              <span>admissions@cardiffschool.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Cardiff International School. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Student Portal</a>
            <Link to="/admin" className="hover:text-white text-brand-accent/90 hover:text-white font-semibold flex items-center gap-1">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
