import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type CalendarSlot = {
  date: Date;
  status: 'booked' | 'open' | 'pending' | 'busy';
  label?: string;
  onClick?: () => void;
};

interface AvailabilityCalendarProps {
  slots: CalendarSlot[];
  onDateClick?: (date: Date) => void;
}

export default function AvailabilityCalendar({ slots, onDateClick }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = startOfDay(new Date());

  return (
    <div className="glass-card p-6 border border-parchment/5 rounded-none animate-fade-in text-parchment">
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <h3 className="font-bold text-xl uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 border border-parchment/20 hover:border-gold hover:text-gold transition-colors text-parchment cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 border border-parchment/20 hover:border-gold hover:text-gold transition-colors text-parchment cursor-pointer">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-[10px] uppercase tracking-widest font-bold text-gold/60">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const slotForDay = slots.find(s => isSameDay(s.date, day));
          const isPastDate = isBefore(day, today);
          
          let statusColor = '';
          let statusBg = '';
          if (slotForDay) {
            if (slotForDay.status === 'booked') {
              statusColor = 'text-forest';
              statusBg = 'bg-gold border-gold/50';
            } else if (slotForDay.status === 'open') {
              statusColor = 'text-gold';
              statusBg = 'bg-transparent border-gold border-dashed';
            } else if (slotForDay.status === 'pending') {
              statusColor = 'text-parchment';
              statusBg = 'bg-parchment/10 border-white/20';
            } else if (slotForDay.status === 'busy') {
              statusColor = 'text-red-400';
              statusBg = 'bg-red-500/10 border-red-500/30';
            }
          }

          return (
            <div 
              key={i} 
              onClick={() => {
                if (isPastDate) return;
                if (slotForDay?.onClick) slotForDay.onClick();
                else if (onDateClick) onDateClick(day);
              }}
              className={`aspect-square border flex flex-col p-2 relative transition-all 
                ${!isCurrentMonth ? 'opacity-30' : ''} 
                ${isPastDate ? 'opacity-40 cursor-not-allowed bg-black/10' : slotForDay ? 'cursor-pointer hover:scale-105 z-10 shadow-lg' : 'border-white/5 hover:border-white/20 cursor-pointer'}
                ${statusBg}
              `}
            >
              <span className={`text-sm font-bold ${slotForDay && slotForDay.status === 'booked' ? 'text-forest' : ''}`}>{format(day, 'd')}</span>
              
              {slotForDay && (
                <div className={`absolute bottom-2 left-1 right-1 text-[8px] uppercase font-bold tracking-widest px-1 py-0.5 text-center truncate ${statusColor}`}>
                  {slotForDay.label || slotForDay.status}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
