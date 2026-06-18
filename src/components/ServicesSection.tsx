import React, { useEffect, useState } from 'react';
import type { Database } from '../types';
import { Loader2, ArrowRight, CheckCircle2, ShieldAlert, Award, Feather, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

type Service = Database['public']['Tables']['services']['Row'];

const SCHOLAR_PREVIEWS = [
  {
    name: "Dr. Ahmed Hassan",
    credentials: "Ph.D. in Usul al-Din, Al-Azhar University",
    specialties: ["Spiritual Growth", "Theological Studies", "Youth Mentorship"],
    hadiyahRange: "$250 - $400",
    avatarBg: "bg-forest-light text-gold",
    initial: "A",
    bio: "Over 15 years lecturing in comparative theology and delivering sermons globally. Deeply focused on grounding classical principles within modern contexts."
  },
  {
    name: "Dr. Yasir Qadhi",
    credentials: "M.A. & Ph.D. in Islamic Theology",
    specialties: ["Contemporary Issues", "Epistemology", "Community Lectures"],
    hadiyahRange: "$350 - $500",
    avatarBg: "bg-gold/10 text-gold border border-gold/40",
    initial: "Y",
    bio: "Renowned academic, author, and senior theologian. Dedicated to addressing modern intellectual realities and counseling the rising generation."
  },
  {
    name: "Sheikh Mustafa Al-Saeed",
    credentials: "B.A. in Shariah, Islamic University of Madinah",
    specialties: ["Prophetic Biography (Sierah)", "Hadith Literature", "Family Counsel"],
    hadiyahRange: "$200 - $350",
    avatarBg: "bg-forest-pale text-parchment",
    initial: "M",
    bio: "Classicist scholar loved for his humble character and devotion to prophetic traditions. Teaches youth character-building classes across North America."
  }
];

const STAGGER = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2, ease: "easeOut" } }
};

const ITEM = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        let loadedServices = [];
        if (loadedServices.length === 0) {
          loadedServices = [{
            id: 'jumuah-khutbah',
            name: 'Jumuah Khutbah',
            description: 'Book our Imams for the Friday congregational sermon and prayer (Jumuah Khutbah) at your mosque, university, or organization.',
            duration_minutes: 45,
            price: 0,
            is_active: true,
            created_at: new Date().toISOString()
          } as Service];
        }
        
        setServices(loadedServices);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  return (
    <section id="services" className="py-32 bg-forest relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Overarching Single Service Frame */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={ITEM}
          className="glass-card rounded-none p-8 md:p-16 mb-28 relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row gap-16 items-center relative z-10">
            <div className="w-full lg:w-1/2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
                <Feather size={12} /> Core Platform Offering
              </span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 text-parchment leading-none">
                The Sacred Assignment:<br/><span className="text-gold">Jumu'ah Khutbah</span>
              </h2>
              <p className="text-parchment/70 font-sans font-light text-lg mb-10 leading-relaxed">
                The Friday congregational service holds unparalleled gravity in the Muslim community. Maqam provides an organized directory of qualified Khateebs, enabling masjids to host impactful sermons weekly while handling transit, topics, and stipends respectfully.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-gold shrink-0" />
                  <span className="text-sm text-parchment/90 font-bold tracking-wide uppercase">Standard 45-Min Slots</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-gold shrink-0" />
                  <span className="text-sm text-parchment/90 font-bold tracking-wide uppercase">Verified scholarly Ijazah</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-gold shrink-0" />
                  <span className="text-sm text-parchment/90 font-bold tracking-wide uppercase">Private Consultations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-gold shrink-0" />
                  <span className="text-sm text-parchment/90 font-bold tracking-wide uppercase">Dignified Digital Hadiyah</span>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <div className="glass-card-light rounded-none p-10 relative">
                <div className="absolute top-0 right-0 w-2 h-2 bg-gold mt-4 mr-4"></div>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/30 -ml-2 -mt-2"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/30 -mr-2 -mb-2"></div>

                <h4 className="text-gold text-2xl font-bold mb-4 tracking-tighter">Scheduling Without Chaos</h4>
                <p className="text-base text-parchment/70 leading-relaxed mb-10">
                  Select your Friday slot below. The platform confirms availability instantly, pre-calculates the sermon time according to local prayer times, and shares important mosque etiquette notes with the guest scholar ahead of travel.
                </p>
                <button 
                  onClick={() => {
                    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="w-full bg-transparent hover:bg-gold text-gold hover:text-forest font-bold px-8 py-4 border border-gold transition-all flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-xs cursor-pointer group"
                >
                  Book Friday Slot <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scholar Directory Title */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={ITEM}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <span className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">
            The Verified scholar Directory
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-parchment mb-8 tracking-tighter">
            Resident & Guest Khateebs
          </h2>
          <p className="text-xl text-parchment/60 font-light max-w-2xl mx-auto leading-relaxed">
            Browse scholars registered on Maqam. Each undergoes vetting for academic pedigree, community alignment, and classic scholarship values.
          </p>
        </motion.div>

        <motion.div 
          variants={STAGGER}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {SCHOLAR_PREVIEWS.map((scholar, idx) => (
            <motion.div key={idx} variants={ITEM} className="glass-card p-8 flex flex-col justify-between group hover:border-gold/40 transition-colors duration-500 rounded-none relative">
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-l-[30px] border-t-gold/10 border-l-transparent group-hover:border-t-gold/30 transition-colors"></div>
              
              <div>
                <div className="flex items-start gap-5 mb-8">
                  <div className={`w-14 h-14 flex items-center justify-center font-black text-2xl ${scholar.avatarBg}`}>
                    {scholar.initial}
                  </div>
                  <div>
                    <h4 className="text-parchment font-bold text-xl flex items-center gap-2 tracking-tight">
                      {scholar.name}
                      <span className="text-gold" title="Verified Scholarship">
                        <Award size={16} />
                      </span>
                    </h4>
                    <span className="text-xs text-gold/80 font-medium tracking-wide uppercase block mt-1">
                      {scholar.credentials}
                    </span>
                  </div>
                </div>
                
                <p className="text-base text-parchment/60 leading-relaxed mb-8">
                  {scholar.bio}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {scholar.specialties.map((spec, i) => (
                    <span key={i} className="text-[10px] uppercase tracking-widest font-bold bg-parchment/5 text-parchment/80 px-3 py-1.5 border border-parchment/10">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-4">
                  <span className="text-[10px] font-bold text-parchment/50 uppercase tracking-[0.2em]">Suggested Hadiyah</span>
                  <span className="text-lg font-black text-gold">{scholar.hadiyahRange}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
