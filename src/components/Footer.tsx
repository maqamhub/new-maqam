import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-forest text-parchment/60 py-20 border-t border-parchment/5 relative z-10 w-full overflow-hidden">
      <div className="absolute top-0 left-1/2 w-full max-w-7xl -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          
          <div className="text-center md:text-left">
            <h3 className="text-parchment font-black text-3xl uppercase tracking-tighter mb-3">
              Maqam
            </h3>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-gold">Connecting masjids with qualified scholars.</p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-parchment/40 mb-2">
              <a href="/admin" className="hover:text-gold transition-colors">Admin Portal</a>
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-parchment/40">
              &copy; {currentYear} Maqam. All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
