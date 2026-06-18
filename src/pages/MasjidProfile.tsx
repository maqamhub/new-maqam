import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Building, Calendar, Phone, Mail, Share2, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useUsers } from '../hooks/useUsers';

export default function MasjidProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users } = useUsers('masjid');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const masjid = users.find(u => u.name === decodeURIComponent(id || '') || u.id === id);

  const masjidName = masjid?.name || decodeURIComponent(id || 'Masjid Profile');
  const address = masjid?.address || 'Location not provided';
  const description = masjid?.description || `${masjidName} is a verified organization on the Maqam network.`;
  const focusAreas = masjid?.focusAreas || '';
  const jumuahTime = masjid?.jumuahTime || '';
  const email = masjid?.email || 'N/A';
  const phone = masjid?.phone || 'N/A';
  const website = masjid?.website || 'N/A';

  return (
    <div className="min-h-screen bg-forest font-sans text-parchment selection:bg-gold/30 selection:text-gold-light flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 w-full">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors text-xs font-bold uppercase tracking-widest mb-8 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="glass-card p-0 overflow-hidden border border-gold/20 shadow-2xl relative rounded-none">
            {/* Header / Cover */}
            <div className="h-48 bg-forest-light relative border-b border-parchment/5 overflow-hidden">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(167,68,75,0.2) 25%, transparent 25%, transparent 75%, rgba(167,1,0,0.2) 75%, rgba(167,1,0,0.2)), linear-gradient(45deg, rgba(167,1,0,0.2) 25%, transparent 25%, transparent 75%, rgba(167,1,0,0.2) 75%, rgba(167,1,0,0.2))', backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px' }}></div>
            </div>
            
            <div className="px-8 pb-8 relative">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
                <div className="w-32 h-32 bg-forest border-4 border-forest flex items-center justify-center shadow-lg relative z-10 shrink-0">
                  {masjid?.logoUrl ? (
                    <img src={masjid.logoUrl} alt={masjid.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building size={48} className="text-gold" />
                  )}
                </div>
                
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-black text-parchment tracking-tight">{masjidName}</h1>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-gold/10 text-gold border border-gold/20">Verified</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-parchment/60 font-medium">
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gold/50" /> {address}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto shrink-0 pb-2">
                  <button className="flex-1 md:flex-none glass-card-light border border-gold/20 hover:border-gold/50 text-parchment text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors flex items-center justify-center gap-2">
                    <Share2 size={16} /> Share
                  </button>
                  <button className="flex-1 md:flex-none bg-gold hover:bg-gold-light text-forest text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors cursor-pointer flex items-center justify-center gap-2">
                    Follow
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
                <div className="md:col-span-2 space-y-8">
                  <section>
                    <h2 className="text-lg font-bold text-parchment uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                      About the Community
                    </h2>
                    <p className="text-parchment/70 font-light leading-relaxed whitespace-pre-line">
                      {description}
                    </p>
                  </section>
                  
                  {jumuahTime && (
                    <section>
                      <h2 className="text-lg font-bold text-parchment uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Calendar size={18} className="text-gold" /> Jumuah Logistics
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 border border-white/5 bg-parchment/5 rounded-none">
                          <h4 className="font-bold text-parchment mb-1 text-sm">Main Shift</h4>
                          <p className="text-xs text-parchment/50 font-light mb-3">{jumuahTime}</p>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="glass-card-light p-6 border border-white/5 rounded-none">
                    <h3 className="text-xs font-bold text-parchment uppercase tracking-widest mb-4">Contact</h3>
                    <ul className="space-y-4 text-sm text-parchment/70 font-light">
                      <li className="flex items-center gap-3">
                        <Phone size={14} className="text-gold shrink-0" /> <span className="truncate">{phone}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Mail size={14} className="text-gold shrink-0" /> <span className="truncate">{email}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Globe size={14} className="text-gold shrink-0" /> <span className="truncate">{website}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="glass-card-light p-6 border border-white/5 rounded-none">
                    <h3 className="text-xs font-bold text-parchment uppercase tracking-widest mb-4">Amenities</h3>
                    <ul className="space-y-3 text-sm text-parchment/70 font-light">
                      <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-gold/50"></div>
                        Dedicated Khateeb Parking
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-gold/50"></div>
                        Waiting Room / Office
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-gold/50"></div>
                        Lapel Microphone provided
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
