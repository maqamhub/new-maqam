import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Sparkles, Building, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';

const STAGGER = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.2, ease: [0.16, 1, 0.3, 1] } }
};

const ITEM = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function Hero() {
  return (
    <div className="relative bg-forest overflow-hidden py-28 md:py-40 islamic-pattern min-h-[90vh] flex items-center border-b border-gold/10">
      {/* Dramatic central illumination */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full bg-gold/5 blur-[150px] opacity-70"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <motion.div 
          variants={STAGGER}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center gap-10"
        >
          <motion.div variants={ITEM}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-pale/50 border border-gold/30 text-gold text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md">
              <Sparkles size={14} className="text-gold" />
              The Standard for Jumu'ah Scheduling
            </span>
          </motion.div>

          <motion.h1 variants={ITEM} className="text-5xl sm:text-6xl md:text-8xl font-black text-parchment tracking-tight leading-[1] max-w-5xl">
            A Dignified Meeting Place for <span className="text-gold italic font-medium">Masjids</span> and <span className="text-gold italic font-medium">Scholars</span>.
          </motion.h1>

          <motion.p variants={ITEM} className="text-lg sm:text-xl text-parchment-dark/70 max-w-2xl font-normal leading-relaxed">
            Every week, mosque administrators scramble through group chats and phone tag to find a khateeb. Simultaneously, scholars lack a professional space to signal availability. Maqam bridges the gap with honor and precision.
          </motion.p>
          
          <motion.div variants={ITEM} className="flex flex-col sm:flex-row gap-6 mt-4">
            <a
              href="#booking"
              className="group relative cursor-pointer overflow-hidden bg-gold hover:bg-gold-light text-forest font-bold px-10 py-5 rounded-none transition-all text-center tracking-widest uppercase text-xs"
            >
              <span className="relative z-10">See How It Works</span>
              <div className="absolute inset-0 h-full w-0 bg-parchment transition-all duration-300 ease-out group-hover:w-full z-0"></div>
            </a>
            <Link
              to="/signup"
              className="bg-transparent text-gold hover:text-gold-light font-bold px-10 py-5 transition-all text-center border border-gold tracking-widest uppercase text-xs hover:bg-gold/10"
            >
              Join Maqam
            </Link>
          </motion.div>

          <motion.div variants={ITEM} className="w-full mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="glass-card p-10 relative overflow-hidden group hover:border-gold/30 transition-colors duration-500">
              <div className="absolute -top-10 -right-10 text-forest-pale/20 group-hover:text-gold/5 transition-colors duration-500">
                <Building size={160} />
              </div>
              <div className="relative z-10">
                <h3 className="text-gold text-2xl font-bold mb-4 tracking-tight">For Masjid Admins</h3>
                <p className="text-parchment/70 text-base leading-relaxed mb-8 max-w-md">
                  Post open slots instantly, browse a verified directory of local scholars, and confirm bookings weeks in advance. No more Wednesday night scrambles.
                </p>
                <div className="flex items-center gap-3 text-sm text-parchment font-medium border-t border-forest-light pt-6">
                  <ShieldCheck size={18} className="text-gold" /> Verified Credentials Only
                </div>
              </div>
            </div>

            <div className="glass-card p-10 relative overflow-hidden group hover:border-gold/30 transition-colors duration-500">
              <div className="absolute -top-10 -right-10 text-forest-pale/20 group-hover:text-gold/5 transition-colors duration-500">
                <Award size={160} />
              </div>
              <div className="relative z-10">
                <h3 className="text-gold text-2xl font-bold mb-4 tracking-tight">For Scholars</h3>
                <p className="text-parchment/70 text-base leading-relaxed mb-8 max-w-md">
                  A professional profile to reflect your classical credentials, discover proximate masjids, and receive your requested hadiyah transparently.
                </p>
                <div className="flex items-center gap-3 text-sm text-parchment font-medium border-t border-forest-light pt-6">
                  <HeartHandshake size={18} className="text-gold" /> Dignified Planning
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
