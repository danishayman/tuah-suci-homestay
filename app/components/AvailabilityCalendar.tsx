"use client";

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import Link from 'next/link';

type CalendarEvent = {
  start: Date;
  end: Date;
  summary: string;
};

interface GoogleCalendarEvent {
  summary: string;
  start: { dateTime?: string; date?: string; };
  end: { dateTime?: string; date?: string; };
}

export default function AvailabilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const timeMin = monthStart.toISOString();
        const timeMax = monthEnd.toISOString();

        const response = await fetch(`/api/calendar-events?timeMin=${timeMin}&timeMax=${timeMax}`);
        if (!response.ok) throw new Error('Failed to fetch calendar events');

        const data = await response.json();
        const processedEvents = data.events
          .filter((event: GoogleCalendarEvent) => event.summary)
          .map((event: GoogleCalendarEvent) => ({
            start: new Date(event.start.dateTime || event.start.date || ''),
            end: new Date(event.end.dateTime || event.end.date || ''),
            summary: event.summary
          }));

        setEvents(processedEvents);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError('Unable to load availability calendar. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStartDate = new Date(monthStart);
  calendarStartDate.setDate(monthStart.getDate() - monthStart.getDay());
  const calendarEndDate = new Date(monthEnd);
  calendarEndDate.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));
  const calendarDays = eachDayOfInterval({ start: calendarStartDate, end: calendarEndDate });

  const isDateBooked = (date: Date) => {
    return events.some(event => {
      if (!event.summary) return false;
      const isRelevantEvent = event.summary.toUpperCase().includes('BOOKED') || event.summary.toUpperCase().includes('TEMPAHAN');
      if (isRelevantEvent) {
        const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const eventStartDate = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
        const eventEndDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
        return checkDate >= eventStartDate && checkDate < eventEndDate;
      }
      return false;
    });
  };

  const weekDays = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];

  return (
    <section id="availability" className="py-16 px-4 sm:px-8 md:px-16 lg:px-24 bg-[#F5EEDC]/90">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-[#183B4E] mb-4 animate-fadeIn">Kekosongan</h2>
          <p className="text-[#183B4E] font-montserrat max-w-2xl mx-auto font-bold">
            Semak tarikh kekosongan Tuah Suci Homestay untuk perancangan percutian anda.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-r from-[#183B4E] to-[#27548A] text-white p-5 flex justify-between items-center">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50" aria-label="Bulan sebelumnya">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="font-montserrat font-semibold text-lg tracking-wide">{format(currentDate, 'MMMM yyyy')}</h3>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50" aria-label="Bulan seterusnya">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#27548A]"></div>
                  <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {weekDays.map(day => (
                    <div key={day} className="text-center font-montserrat font-semibold text-[#183B4E]/80 py-2 text-sm">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map(day => {
                    const booked = isDateBooked(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const isPast = isBefore(startOfDay(day), startOfDay(new Date()));

                    return (
                      <div
                        key={day.toString()}
                        className={`
                          relative p-2 sm:p-3 text-center rounded-lg font-montserrat
                          transition-all duration-200 transform
                          ${!isCurrentMonth ? 'text-gray-300' : ''}
                          ${isPast && isCurrentMonth ? 'text-gray-300' : ''}
                          ${booked && isCurrentMonth ? 'bg-red-100 text-red-800' : ''}
                          ${!booked && isCurrentMonth && !isPast ? 'bg-green-100 text-green-800' : ''}
                          ${!booked && isCurrentMonth && isPast ? 'bg-gray-50' : ''}
                          ${isToday ? 'ring-2 ring-blue-400' : ''}
                        `}
                      >
                        <span className="inline-block w-full text-sm sm:text-base">{format(day, 'd')}</span>
                        {isToday && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded-md border border-green-300 mr-2"></div>
                <span className="text-sm text-[#183B4E] font-montserrat">Tersedia</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 rounded-md border border-red-300 mr-2"></div>
                <span className="text-sm text-[#183B4E] font-montserrat">Telah Ditempah</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-blue-400 rounded-md mr-2"></div>
                <span className="text-sm text-[#183B4E] font-montserrat">Hari Ini</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/booking"
            className="inline-block font-montserrat px-8 py-4 text-base font-bold uppercase tracking-widest text-white bg-[#27548A] rounded-lg shadow-lg hover:bg-[#183B4E] transition-all duration-300 hover:translate-y-[-2px] active:translate-y-0"
          >
            Tempah Sekarang
          </Link>
          <p className="text-[#183B4E]/60 font-montserrat text-sm mt-4">
            Atau hubungi kami melalui{' '}
            <a
              href="https://wa.me/60175240056?text=Tuah%20Suci%20Homestay%20-%20Saya%20berminat%20untuk%20tempah%20homestay."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#27548A] hover:text-[#183B4E] font-medium hover:underline transition-colors duration-200"
            >
              WhatsApp +60 17-524 0056
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}