import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useSettings } from '../contexts/SettingsContext';
import { Loader2, CheckCircle, CalendarIcon, User, Mail, Phone, Clock } from 'lucide-react';
import { addMinutes, addHours, format, set, isAfter, isBefore, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { cn } from '../lib/utils';
import { DatePicker } from './ui/date-picker';
import type { Database } from '../types';

type Service = Database['public']['Tables']['services']['Row'];
type BusinessHours = Database['public']['Tables']['business_hours']['Row'];

interface Slot {
  start: Date;
  end: Date;
  label: string;
}

const IMAMS = [
  {
    id: 'dr-ahmed',
    name: 'Dr. Ahmed Hassan',
    title: 'Ph.D. in Usul al-Din, Al-Azhar University',
    specialties: ['Theology', 'Classical Fiqh', 'Youth Counseling'],
    bio: 'An esteemed scholar of classical theology with over 15 years of experience delivering sermons and advising communities across North America.',
    avatar: 'A',
    color: 'bg-forest text-gold border border-gold/20'
  },
  {
    id: 'dr-yasir',
    name: 'Dr. Yasir Qadhi',
    title: 'M.A. & Ph.D. in Islamic Theology',
    specialties: ['Contemporary Epistemology', 'Modern Challenges', 'Theology'],
    bio: 'Dedicated to addressing modern intellectual realities and advising communities on contemporary theological challenges.',
    avatar: 'Y',
    color: 'bg-gold/10 text-gold border border-gold/40'
  },
  {
    id: 'sheikh-mustafa',
    name: 'Sheikh Mustafa Al-Saeed',
    title: 'B.A. in Shariah, Islamic University of Madinah',
    specialties: ['Prophetic Biography', 'Hadith Literature', 'Character Building'],
    bio: 'Classicist scholar loved for his humble character and devotion to prophetic traditions. Well-known for character development curricula.',
    avatar: 'M',
    color: 'bg-forest-light text-parchment border border-gold/10'
  },
  {
    id: 'khateeb-any',
    name: 'Any Verified Khateeb',
    title: 'First Available Scholar',
    specialties: ['Rapid Sync', 'Flexible Match', 'Verified Standard'],
    bio: 'Choose this option to match with the first qualified Alim or Khateeb approved within your local circuit.',
    avatar: '🕌',
    color: 'bg-forest-pale text-gold border border-gold/20'
  }
];

export default function BookingSection() {
  const { settings, loading: settingsLoading } = useSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedImam, setSelectedImam] = useState<string>('Any Verified Khateeb');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleServiceSelect = (e: Event) => {
      const customEvent = e as CustomEvent<Service>;
      setSelectedService(customEvent.detail);
      setStep(2);
    };
    
    window.addEventListener('select-service', handleServiceSelect);
    return () => window.removeEventListener('select-service', handleServiceSelect);
  }, []);

  useEffect(() => {
    async function loadServices() {
      try {
        const defaultServices: Service[] = [
          {
            id: 'jumuah-khutbah',
            name: 'Jumuah Khutbah',
            description: 'Book a qualified Khateeb for the Friday congregational sermon and prayer at your masjid or community center.',
            duration_minutes: 45,
            price: 0,
            is_active: true,
            created_at: new Date().toISOString()
          } as Service,
          {
            id: 'aqiqah-ceremony',
            name: 'Aqiqah Ceremony',
            description: 'Invite a scholar to officiate and speak at your newborn\'s Aqiqah ceremony.',
            duration_minutes: 60,
            price: 0,
            is_active: true,
            created_at: new Date().toISOString()
          } as Service
        ];

        setServices(defaultServices);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedService) {
      calculateSlots();
    }
  }, [selectedDate, selectedService, settings]);

  async function calculateSlots() {
    if (!selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setError('');

    try {
      const parts = selectedDate.split('-');
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const dayOfWeek = dateObj.getDay();

      if (selectedService.name.toLowerCase().includes('jumuah') && dayOfWeek !== 5) {
        setAvailableSlots([]);
        setError('Jumuah Khutbah can only be booked on Fridays.');
        setLoadingSlots(false);
        return;
      }

      // Firestore lookups
      const hoursQ = query(collection(db, 'business_hours'), where('weekday', '==', dayOfWeek));
      const blockedQ = query(collection(db, 'blocked_dates'), where('blocked_date', '==', selectedDate));
      const apptsQ = query(collection(db, 'appointments'), where('appointment_date', '==', selectedDate), where('service_id', '==', selectedService.id));

      const [hoursRes, blockedRes, apptsRes] = await Promise.all([
        getDocs(hoursQ),
        getDocs(blockedQ),
        getDocs(apptsQ)
      ]);

      if (!blockedRes.empty) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return; // Blocked manually
      }

      let hours = !hoursRes.empty ? (hoursRes.docs[0].data() as BusinessHours) : null;
      if (!hours) {
        hours = {
          id: '',
          weekday: dayOfWeek,
          is_open: dayOfWeek !== 0 && dayOfWeek !== 6,
          start_time: '09:00:00',
          end_time: '17:00:00'
        } as BusinessHours;
      }

      if (!hours.is_open) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return; // Closed on this weekday
      }

      const activeAppointments = apptsRes.docs.map(d => d.data()).filter(a => a.status !== 'cancelled' && a.status !== 'rejected') as any[];

      // Create Date objects for business start/end for the selected day
      const startTimeParts = hours.start_time.split(':').map(Number);
      const endTimeParts = hours.end_time.split(':').map(Number);

      const dayStart = set(dateObj, { hours: startTimeParts[0], minutes: startTimeParts[1], seconds: 0 });
      const dayEnd = set(dateObj, { hours: endTimeParts[0], minutes: endTimeParts[1], seconds: 0 });

      // Transform existing appointments to start/end Date objects for easy comparison
      const bookedRanges = activeAppointments.map(app => {
        const sParts = app.start_time.split(':').map(Number);
        const eParts = app.end_time.split(':').map(Number);
        return {
          start: set(dateObj, { hours: sParts[0], minutes: sParts[1], seconds: 0 }),
          end: set(dateObj, { hours: eParts[0], minutes: eParts[1], seconds: 0 })
        };
      });

      const slots: Slot[] = [];
      let currentMarker = new Date(dayStart);
      const now = new Date();
      const minNoticeHours = settings?.booking_notice_hours ?? 0;
      const minNoticeDate = addHours(now, minNoticeHours);

      while (isBefore(currentMarker, dayEnd)) {
        const slotStart = new Date(currentMarker);
        const slotEnd = addMinutes(slotStart, selectedService.duration_minutes);

        if (isAfter(slotEnd, dayEnd)) {
          break; // Slot goes beyond closing time
        }

        const isPastNotice = isAfter(slotStart, minNoticeDate);
        
        let hasOverlap = false;
        for (const booking of bookedRanges) {
          // overlap formula: slot_start < app_end && slot_end > app_start
          if (isBefore(slotStart, booking.end) && isAfter(slotEnd, booking.start)) {
            hasOverlap = true;
            break;
          }
        }

        if (isPastNotice && !hasOverlap) {
          slots.push({
            start: slotStart,
            end: slotEnd,
            label: format(slotStart, 'h:mm a')
          });
        }

        currentMarker = addMinutes(currentMarker, settings?.slot_interval_minutes || 30);
      }

      setAvailableSlots(slots);
    } catch (err) {
      console.error(err);
      setError('Failed to load availability. Please try again.');
    } finally {
      setLoadingSlots(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot || !selectedDate) return;
    
    setSubmitting(true);
    setError('');

    try {
      const formattedStartTime = format(selectedSlot.start, 'HH:mm:ss');
      const formattedEndTime = format(selectedSlot.end, 'HH:mm:ss');

      // Prepend selected Khateeb so it is stored inside the database
      const finalNotes = `Khateeb: ${selectedImam}${formData.notes ? `\n\nNotes: ${formData.notes}` : ''}`;

      await addDoc(collection(db, 'appointments'), {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        service_id: selectedService.id,
        appointment_date: selectedDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        status: 'pending',
        notes: finalNotes,
        created_at: new Date().toISOString()
      });
      
      setStep(5);
    } catch (err: any) {
      console.error(err);
      setError('Failed to submit booking. Please try again.');
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const isJumuah = selectedService?.name.toLowerCase().includes('jumuah');
    
    if (isJumuah) {
      const day = today.getDay();
      if (day !== 5) {
        today.setDate(today.getDate() + ((5 + 7 - day) % 7));
      }
    }
    
    return format(today, 'yyyy-MM-dd');
  };

  if (settingsLoading || loadingServices) {
    return <div className="py-24 flex justify-center bg-parchment"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>;
  }

  return (
    <section id="booking" className="py-32 bg-forest bg-pattern border-t border-gold/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gold/5 blur-[120px] pointer-events-none rounded-full w-[800px] h-[800px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <span className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">
            Reservation Platform
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-parchment mb-6 tracking-tighter">Post a Jumu'ah Slot</h2>
          <p className="text-parchment/60 text-lg max-w-xl mx-auto font-light leading-relaxed">
            Configure your Friday slot, choose your preferred Scholar, and secure structural details for Jumu'ah. This request will be instantly visible to Khateebs in your network.
          </p>
        </div>

        <div className="glass-card rounded-none shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Step Indicator */}
          {step < 5 && (
            <div className="flex bg-forest-light/50 border-b border-gold/15 overflow-x-auto">
              {(services.length > 1 ? [
                { id: 1, label: 'Service' },
                { id: 2, label: 'Khateeb' },
                { id: 3, label: 'Time & Date' },
                { id: 4, label: 'Mosque Details' }
              ] : [
                { id: 2, label: 'Khateeb' },
                { id: 3, label: 'Time & Date' },
                { id: 4, label: 'Mosque Details' }
              ]).map((s, idx) => (
                <div key={s.id} className={cn(
                  "flex-1 min-w-[100px] text-center py-5 text-[10px] font-black uppercase tracking-[0.2em] relative transition-colors",
                  step === s.id ? "text-gold bg-forest-pale" : step > s.id ? "text-parchment/80" : "text-parchment/30"
                )}>
                  <span className="hidden sm:inline mr-2 opacity-50">Step {idx + 1}:</span>{s.label}
                  {step === s.id && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gold shadow-[0_0_10px_rgba(167,68,75,0.5)]"></div>}
                </div>
              ))}
            </div>
          )}

          <div className="p-6 md:p-12 bg-forest/80 backdrop-blur-md">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-serif font-bold text-parchment mb-6">Select a Service</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(svc => (
                    <button
                      key={svc.id}
                      type="button"
                      disabled={svc.id === 'aqiqah-ceremony'}
                      onClick={() => { setSelectedService(svc); setTimeout(() => setStep(2), 300); }}
                      className={`text-left p-5 border rounded-xl transition-all duration-200 flex flex-col h-full bg-forest-light ${svc.id === 'aqiqah-ceremony' ? 'border-gold/10 opacity-70 cursor-not-allowed grayscale-[0.3]' : 'border-gold/20 hover:border-gold hover:shadow-md cursor-pointer focus:outline-none'}`}
                    >
                      <h4 className="font-bold text-parchment text-lg mb-2">{svc.name}</h4>
                      <p className="text-parchment/70 text-sm mb-4 line-clamp-2 pb-2 flex-grow">{svc.description}</p>
                      <div className="flex items-center gap-4 text-sm font-bold text-gold mt-auto pt-4 border-t border-gold/10 w-full">
                        {svc.id === 'aqiqah-ceremony' ? (
                          <span className="flex items-center gap-1.5"><Clock size={16} className="text-gold" /> Coming soon... and many more</span>
                        ) : (
                          <>
                            <span className="flex items-center gap-1.5"><Clock size={16} className="text-gold" /> {svc.duration_minutes} min duration</span>
                            {svc.price > 0 && <span>${svc.price} suggested hadiyah</span>}
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                {services.length > 1 && (
                  <button onClick={() => setStep(1)} className="text-sm font-medium text-parchment/60 hover:text-parchment mb-6 flex items-center gap-2 cursor-pointer bg-none border-none">
                    ← Back to Services
                  </button>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-serif font-bold text-parchment mb-1">Select a Scholar / Khateeb</h3>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-parchment/70 items-center">
                    <span>Selected Service: <strong className="text-parchment font-semibold">{selectedService?.name}</strong></span>
                    <span>•</span>
                    <span className="text-gold font-bold">{selectedService?.duration_minutes} min duration</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {IMAMS.map((imam) => (
                    <button
                      key={imam.id}
                      type="button"
                      onClick={() => {
                        setSelectedImam(imam.name);
                        setTimeout(() => setStep(3), 300);
                      }}
                      className={cn(
                        "text-left p-6 border-2 rounded-2xl transition-all duration-300 relative flex flex-col justify-between hover:shadow-md focus:outline-none cursor-pointer w-full",
                        selectedImam === imam.name
                          ? "border-gold bg-forest-pale shadow-md ring-1 ring-gold"
                          : "border-gold/10 hover:border-gold/30 bg-forest-light"
                      )}
                    >
                      <div>
                        <div className="flex items-start gap-4 mb-4">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0", imam.color)}>
                            {imam.avatar}
                          </div>
                          <div>
                            <h4 className="font-bold text-parchment text-base leading-tight flex items-center gap-2">
                              {imam.name}
                              {selectedImam === imam.name && (
                                <span className="inline-flex items-center justify-center bg-gold/10 text-gold-dark text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-gold/20">
                                  Selected
                                </span>
                              )}
                            </h4>
                            <p className="text-parchment/70 text-xs font-semibold mt-1">{imam.title}</p>
                          </div>
                        </div>
                        <p className="text-parchment/60 text-sm mb-4 leading-relaxed line-clamp-3">{imam.bio}</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gold/10 mt-auto">
                        {imam.specialties.map((spec, i) => (
                          <span key={i} className="bg-parchment text-forest-pale text-[10px] font-semibold px-2 py-0.5 rounded border border-gold/10 uppercase tracking-wider">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <button onClick={() => setStep(2)} className="text-sm font-medium text-parchment/60 hover:text-parchment mb-6 flex items-center gap-2 cursor-pointer bg-none border-none">
                  ← Back to Scholar Selection
                </button>
                <div className="mb-8 p-4 bg-parchment/60 border border-gold/15 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-forest text-sm sm:text-base">{selectedService?.name}</h4>
                    <span className="text-gold font-bold text-xs sm:text-sm">{selectedService?.duration_minutes} minutes duration</span>
                  </div>
                  <div className="text-xs sm:text-sm text-forest-pale">
                    Assigned Scholar: <strong className="text-forest font-bold">{selectedImam}</strong>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block font-bold text-parchment mb-3 text-sm">
                      {selectedService?.name.toLowerCase().includes('jumuah') ? 'Select Friday Date' : 'Select Date'}
                    </label>
                    <DatePicker 
                      date={selectedDate ? new Date(Number(selectedDate.split('-')[0]), Number(selectedDate.split('-')[1]) - 1, Number(selectedDate.split('-')[2])) : undefined}
                      onDateChange={(date) => {
                        if (date) {
                          setSelectedDate(format(date, 'yyyy-MM-dd'));
                          setSelectedSlot(null);
                        } else {
                          setSelectedDate('');
                          setSelectedSlot(null);
                        }
                      }}
                      className="w-full bg-parchment-light border-gold/20 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-parchment mb-3 text-sm">Available Sermon Start Times</label>
                    {!selectedDate ? (
                      <div className="p-4 border border-dashed border-gold/15 rounded-xl text-center text-forest-pale text-sm h-[60px] flex items-center justify-center bg-parchment-light">
                        Please select a Friday first
                      </div>
                    ) : loadingSlots ? (
                      <div className="flex justify-center p-4 border border-dashed border-gold/20 bg-gold/5 rounded-xl"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-4 border border-dashed border-gold/20 rounded-xl text-center text-forest-pale text-sm bg-parchment-light">
                        No available slots on this day.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableSlots.map((slot, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setTimeout(() => setStep(4), 300);
                            }}
                            className={cn(
                              "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer text-center",
                              selectedSlot?.label === slot.label 
                                ? "bg-gold border-gold text-forest shadow-md shadow-gold/20"
                                : "bg-forest-light border-gold/15 text-parchment hover:border-gold hover:text-gold-dark"
                            )}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {step === 4 && (
              <div className="animate-fade-in">
                <button onClick={() => setStep(3)} className="text-sm font-medium text-parchment/60 hover:text-parchment mb-6 flex items-center gap-2 cursor-pointer bg-none border-none">
                  ← Back to Time Selection
                </button>
                
                <form onSubmit={handleSubmit}>
                  <div className="bg-parchment/65 p-5 rounded-xl border border-gold/15 mb-8">
                    <h4 className="font-bold text-forest text-lg font-serif">{selectedService?.name}</h4>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-forest-pale mt-2">
                      <span className="flex items-center gap-1.5 font-bold"><User size={15} className="text-gold"/> {selectedImam}</span>
                      <span className="text-gold/20">|</span>
                      <span className="flex items-center gap-1.5 font-medium"><CalendarIcon size={15} className="text-gold"/> {selectedSlot && format(selectedSlot.start, 'EEEE, MMMM do, yyyy')}</span>
                      <span className="text-gold/20">|</span>
                      <span className="flex items-center gap-1.5 font-bold"><Clock size={15} className="text-gold"/> {selectedSlot?.label}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-parchment mb-1.5 flex items-center gap-2">
                          <User size={16} className="text-gold" /> Mosque Admin Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          className="w-full px-4 py-3 bg-forest-light border border-gold/20 rounded-lg focus:border-gold focus:ring-0 outline-none transition-colors font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-parchment mb-1.5 flex items-center gap-2">
                          <Mail size={16} className="text-gold" /> Official Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 bg-forest-light border border-gold/20 rounded-lg focus:border-gold focus:ring-0 outline-none transition-colors font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-parchment mb-1.5 flex items-center gap-2">
                          <Phone size={16} className="text-gold" /> Mosque Contact Phone
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-forest-light border border-gold/20 rounded-lg focus:border-gold focus:ring-0 outline-none transition-colors font-sans"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-parchment mb-1.5">Additional Sermon Details (Optional)</label>
                      <textarea
                        rows={6}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-4 py-3 bg-forest-light border border-gold/20 rounded-lg focus:border-gold focus:ring-0 outline-none transition-colors font-sans"
                        placeholder="Topics of emphasis, travel arrangements, specific dress code or community expectations..."
                      />
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-gold/15 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full md:w-auto bg-parchment hover:bg-parchment-light text-forest font-semibold px-10 py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-75 cursor-pointer border border-gold/15"
                    >
                      {submitting && <Loader2 className="w-5 h-5 animate-spin text-gold"/>}
                      {submitting ? 'Confirming...' : 'Request Slot Booking'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 5 && (
              <div className="animate-fade-in text-center py-12 flex flex-col items-center">
                <div className="w-20 h-20 bg-gold/10 text-gold-dark rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/20">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-3xl font-serif font-bold text-parchment mb-4">Request Submitted Successfully</h3>
                <p className="text-base text-parchment/80 mb-8 max-w-xl mx-auto leading-relaxed">
                  Your Jumu'ah dispatch invitation for <span className="font-bold text-parchment">{selectedService?.name}</span> with guest Khateeb <span className="font-bold text-parchment">{selectedImam}</span> on <span className="font-bold text-parchment">{selectedSlot && format(selectedSlot.start, 'MMM do, yyyy')} at {selectedSlot?.label}</span> has been processed. Our admin circle will review and confirm.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link
                    to="/admin/login"
                    className="bg-gold hover:bg-gold-light text-forest font-bold uppercase tracking-[0.2em] text-[10px] px-8 py-4 transition-all shadow-[0_0_15px_rgba(231,111,81,0.2)]"
                  >
                    Track Request & Create Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSelectedService(null);
                      setSelectedImam('Any Verified Khateeb');
                      setSelectedDate('');
                      setSelectedSlot(null);
                      setFormData({ full_name: '', email: '', phone: '', notes: '' });
                    }}
                    className="bg-transparent border border-parchment/20 text-parchment font-bold uppercase tracking-[0.2em] text-[10px] px-8 py-4 hover:bg-parchment/5 transition-colors cursor-pointer"
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
