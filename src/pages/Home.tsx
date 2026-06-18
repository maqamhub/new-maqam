import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import AboutSection from '../components/AboutSection';
import BookingSection from '../components/BookingSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-forest font-sans text-parchment selection:bg-gold/30 selection:text-gold-light">
      <Navbar />
      <Hero />
      <ServicesSection />
      <AboutSection />
      <BookingSection />
      <Footer />
    </div>
  );
}
