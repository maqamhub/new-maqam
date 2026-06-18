import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Bookmark, Library, Compass, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

const ITEM = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function AboutSection() {
  const { settings } = useSettings();

  return (
    <section id="about" className="py-32 bg-forest text-parchment relative overflow-hidden">
      {/* Decorative subtle header line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={ITEM}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gold/10 transform translate-x-3 translate-y-3 border border-gold/15"></div>
              <div className="relative glass-card border border-gold/20 p-10 sm:p-16 shadow-2xl overflow-hidden rounded-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px]"></div>
                
                <h3 className="text-3xl font-black text-gold mb-8 border-b border-gold/20 pb-6 tracking-tight">
                  The Metaphor of Maqam
                </h3>
                <blockquote className="text-parchment/90 italic font-sans font-medium text-xl leading-relaxed mb-10">
                  "The name means station or standing in Arabic. It reflects the spiritual station of the minbar and the idea of giving scholars and masjids a proper, dignified place to meet."
                </blockquote>
                <div className="flex items-center gap-5 mt-10">
                  <div className="w-12 h-12 flex items-center justify-center text-gold border border-gold/20">
                    <Library size={20} />
                  </div>
                  <div>
                    <h5 className="font-sans font-black text-sm text-gold tracking-wider uppercase">The Station of Scholars</h5>
                    <p className="text-xs text-parchment/50 uppercase tracking-[0.2em] mt-1.5">Restoring dignity</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={ITEM}
            className="w-full lg:w-1/2"
          >
            <span className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-5 block">
              The Heritage of the Minbar
            </span>
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-parchment leading-none tracking-tighter">
              An Institution Designed to Endure.
            </h2>
            <div className="space-y-6 text-parchment/70 font-sans font-normal text-lg leading-relaxed">
              <p>
                Visually and emotionally, Maqam is designed to occupy the space between a rare classical manuscript and a precise modern tool. It is warm without being busy, serious without feeling cold.
              </p>
              <p>
                Its color palette draws organically from the earth—obsidian shadow, aged parchment, and struck amber—the exact colors of an ancient library at sundown.
              </p>
              <p>
                We do not seek to be another modern startup or integrate unnecessary alerts and gamified noise. Maqam is designed to act as a quiet, respectful institution.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-gold/10">
              <div>
                <h4 className="text-gold font-sans font-black text-xs uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                  <Compass size={16} /> Respecting Time
                </h4>
                <p className="text-parchment/50 text-sm leading-relaxed">
                  Eliminating administrative scrambles and coordinating Friday schedules calmly.
                </p>
              </div>
              <div>
                <h4 className="text-gold font-sans font-black text-xs uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                  <Bookmark size={16} /> Elegant Hadidyah
                </h4>
                <p className="text-parchment/50 text-sm leading-relaxed">
                  Providing professional frameworks for recompense to establish honor and transparency.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
