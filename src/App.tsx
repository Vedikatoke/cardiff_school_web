import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Academics from './pages/Academics';
import Faculty from './pages/Faculty';
import Facilities from './pages/Facilities';
import Events from './pages/Events';
import Fees from './pages/Fees';
import Admissions from './pages/Admissions';
import ContactUs from './pages/ContactUs';
import Layout from './components/Layout';
import AdminPage from './pages/AdminPage';
import { AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/events" element={<Events />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/contact" element={<ContactUs />} />
          </Route>

          {/* Secure Admin panel routes */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/admissions" element={<AdminPage />} />
          <Route path="/admin/staff" element={<AdminPage />} />
          <Route path="/admin/students" element={<AdminPage />} />
          <Route path="/admin/gallery" element={<AdminPage />} />
          <Route path="/admin/fees" element={<AdminPage />} />
          <Route path="/admin/attendance" element={<AdminPage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
