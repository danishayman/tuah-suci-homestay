"use client";

import { useState, useEffect, useCallback } from 'react';
import { format, differenceInCalendarDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, isAfter, startOfDay } from 'date-fns';
import Link from 'next/link';

const PRICE_PER_NIGHT = 350;

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

type BookedRange = {
    checkIn: string;
    checkOut: string;
};

// Steps for the booking wizard
const STEPS = [
    { number: 1, label: 'Pilih Tarikh' },
    { number: 2, label: 'Maklumat Tetamu' },
    { number: 3, label: 'Pengesahan' },
];

export default function BookingPage() {
    const [currentStep, setCurrentStep] = useState(1);

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [calendarLoading, setCalendarLoading] = useState(true);
    const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);

    // Date selection
    const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
    const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);

    // Guest details
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestIc, setGuestIc] = useState('');
    const [guestCount, setGuestCount] = useState(1);

    // State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Calculated values
    const totalNights = selectedCheckIn && selectedCheckOut
        ? differenceInCalendarDays(selectedCheckOut, selectedCheckIn)
        : 0;
    const totalAmount = totalNights * PRICE_PER_NIGHT;

    // Month navigation
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    // Fetch booked ranges from Supabase
    const fetchBookedRanges = useCallback(async () => {
        try {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(currentDate);
            const response = await fetch(
                `/api/check-availability?checkIn=${format(monthStart, 'yyyy-MM-dd')}&checkOut=${format(monthEnd, 'yyyy-MM-dd')}`
            );
            const data = await response.json();
            if (!data.available && data.conflictingBookings) {
                setBookedRanges(data.conflictingBookings);
            } else {
                setBookedRanges([]);
            }
        } catch (err) {
            console.error('Error fetching booked ranges:', err);
        }
    }, [currentDate]);

    // Fetch Google Calendar events
    useEffect(() => {
        async function fetchEvents() {
            try {
                setCalendarLoading(true);
                const monthStart = startOfMonth(currentDate);
                const monthEnd = endOfMonth(currentDate);
                const timeMin = monthStart.toISOString();
                const timeMax = monthEnd.toISOString();
                const response = await fetch(`/api/calendar-events?timeMin=${timeMin}&timeMax=${timeMax}`);
                if (!response.ok) throw new Error('Failed to fetch');
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
            } finally {
                setCalendarLoading(false);
            }
        }
        fetchEvents();
        fetchBookedRanges();
    }, [currentDate, fetchBookedRanges]);

    // Check availability when dates change
    useEffect(() => {
        if (!selectedCheckIn || !selectedCheckOut) return;
        const checkAvailability = async () => {
            setCheckingAvailability(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/check-availability?checkIn=${format(selectedCheckIn, 'yyyy-MM-dd')}&checkOut=${format(selectedCheckOut, 'yyyy-MM-dd')}`
                );
                const data = await response.json();
                setIsAvailable(data.available);
                if (!data.available) {
                    setError('Tarikh yang dipilih sudah ditempah. Sila pilih tarikh lain.');
                }
            } catch {
                setError('Gagal menyemak ketersediaan.');
            } finally {
                setCheckingAvailability(false);
            }
        };
        checkAvailability();
    }, [selectedCheckIn, selectedCheckOut]);

    // Calendar setup
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStartDate = new Date(monthStart);
    calendarStartDate.setDate(monthStart.getDate() - monthStart.getDay());
    const calendarEndDate = new Date(monthEnd);
    calendarEndDate.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));
    const calendarDays = eachDayOfInterval({ start: calendarStartDate, end: calendarEndDate });

    // Check if a date is booked
    const isDateBookedFromCalendar = (date: Date) => {
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

    const isDateBookedFromSupabase = (date: Date) => {
        const checkDate = format(date, 'yyyy-MM-dd');
        return bookedRanges.some(range => checkDate >= range.checkIn && checkDate < range.checkOut);
    };

    const isDateBooked = (date: Date) => isDateBookedFromCalendar(date) || isDateBookedFromSupabase(date);

    const isInSelectedRange = (date: Date) => {
        if (!selectedCheckIn || !selectedCheckOut) return false;
        return isAfter(date, selectedCheckIn) && isBefore(date, selectedCheckOut);
    };

    const wouldCrossBookedDate = (start: Date, end: Date) => {
        const days = eachDayOfInterval({ start, end });
        for (let i = 0; i < days.length - 1; i++) {
            if (isDateBooked(days[i])) return true;
        }
        return false;
    };

    const handleDateClick = (day: Date) => {
        const today = startOfDay(new Date());
        if (isBefore(day, today) || isDateBooked(day) || !isSameMonth(day, currentDate)) return;

        if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
            setSelectedCheckIn(day);
            setSelectedCheckOut(null);
            setError(null);
        } else {
            if (isBefore(day, selectedCheckIn) || isSameDay(day, selectedCheckIn)) {
                setSelectedCheckIn(day);
                setSelectedCheckOut(null);
                setError(null);
            } else {
                if (wouldCrossBookedDate(selectedCheckIn, day)) {
                    setSelectedCheckIn(day);
                    setSelectedCheckOut(null);
                    setError(null);
                    return;
                }
                setSelectedCheckOut(day);
            }
        }
    };

    // Form submission
    const handleSubmit = async () => {
        if (!selectedCheckIn || !selectedCheckOut || !isAvailable) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/create-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestName, guestPhone, guestEmail, guestIc, guestCount,
                    checkIn: format(selectedCheckIn, 'yyyy-MM-dd'),
                    checkOut: format(selectedCheckOut, 'yyyy-MM-dd'),
                }),
            });
            const data = await response.json();
            if (!response.ok) { setError(data.error || 'Gagal membuat tempahan'); setIsSubmitting(false); return; }
            window.location.href = data.paymentUrl;
        } catch {
            setError('Ralat rangkaian. Sila cuba lagi.');
            setIsSubmitting(false);
        }
    };

    const weekDays = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];

    const canProceedStep1 = selectedCheckIn && selectedCheckOut && isAvailable && !checkingAvailability;
    const canProceedStep2 = guestName && guestPhone && guestEmail && guestIc && guestCount > 0;

    return (
        <div className="min-h-screen bg-[#F5EEDC]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#183B4E] to-[#27548A] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/" className="flex items-center text-white/80 hover:text-white transition-colors font-montserrat text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Kembali
                        </Link>
                        <h1 className="font-playfair text-xl font-bold">Tuah Suci Homestay</h1>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center">
                        {STEPS.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-montserrat font-bold text-sm
                    transition-all duration-300
                    ${currentStep >= step.number
                                            ? 'bg-[#DDA853] text-[#183B4E] shadow-lg shadow-[#DDA853]/30'
                                            : 'bg-white/20 text-white/60'
                                        }
                  `}>
                                        {currentStep > step.number ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : step.number}
                                    </div>
                                    <span className={`
                    mt-2 text-xs font-montserrat font-medium whitespace-nowrap
                    ${currentStep >= step.number ? 'text-white' : 'text-white/50'}
                  `}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={`
                    w-16 sm:w-24 h-0.5 mx-2 sm:mx-4 mb-6 transition-all duration-300
                    ${currentStep > step.number ? 'bg-[#DDA853]' : 'bg-white/20'}
                  `} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">

                {/* === STEP 1: Select Dates === */}
                {currentStep === 1 && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#183B4E]">Pilih Tarikh</h2>
                            <p className="text-[#183B4E]/60 font-montserrat mt-2">Pilih tarikh daftar masuk dan daftar keluar anda</p>
                            <p className="text-[#DDA853] font-montserrat font-semibold mt-1">RM350 semalam</p>
                        </div>

                        {/* Date inputs for manual entry */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-2">Daftar Masuk</label>
                                    <input
                                        type="date"
                                        value={selectedCheckIn ? format(selectedCheckIn, 'yyyy-MM-dd') : ''}
                                        min={format(new Date(), 'yyyy-MM-dd')}
                                        onChange={(e) => {
                                            const date = new Date(e.target.value + 'T00:00:00');
                                            if (!isNaN(date.getTime())) {
                                                setSelectedCheckIn(date);
                                                if (selectedCheckOut && date >= selectedCheckOut) setSelectedCheckOut(null);
                                            }
                                        }}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-[#183B4E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-2">Daftar Keluar</label>
                                    <input
                                        type="date"
                                        value={selectedCheckOut ? format(selectedCheckOut, 'yyyy-MM-dd') : ''}
                                        min={selectedCheckIn ? format(new Date(selectedCheckIn.getTime() + 86400000), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                                        onChange={(e) => {
                                            const date = new Date(e.target.value + 'T00:00:00');
                                            if (!isNaN(date.getTime())) setSelectedCheckOut(date);
                                        }}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-[#183B4E]"
                                    />
                                </div>
                            </div>

                            {/* Price summary */}
                            {totalNights > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-[#183B4E]/70 font-montserrat">{totalNights} malam × RM{PRICE_PER_NIGHT}</span>
                                    <span className="text-2xl font-playfair font-bold text-[#183B4E]">RM{totalAmount.toLocaleString()}</span>
                                </div>
                            )}

                            {checkingAvailability && (
                                <div className="mt-3 flex items-center text-sm text-[#27548A] font-montserrat">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#27548A] mr-2"></div>
                                    Menyemak ketersediaan...
                                </div>
                            )}

                            {error && (
                                <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-montserrat">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Calendar */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-[#183B4E] to-[#27548A] text-white p-4 flex justify-between items-center">
                                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Bulan sebelumnya">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h3 className="font-montserrat font-semibold text-lg">{format(currentDate, 'MMMM yyyy')}</h3>
                                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Bulan seterusnya">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-4">
                                {calendarLoading ? (
                                    <div className="flex justify-center items-center py-20">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-[#27548A]"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                                            {weekDays.map(day => (
                                                <div key={day} className="text-center font-montserrat font-semibold text-[#183B4E]/60 py-2 text-xs sm:text-sm">{day}</div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                            {calendarDays.map(day => {
                                                const booked = isDateBooked(day);
                                                const isCurrentMonth = isSameMonth(day, currentDate);
                                                const isToday = isSameDay(day, new Date());
                                                const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                                                const isCheckIn = selectedCheckIn && isSameDay(day, selectedCheckIn);
                                                const isCheckOut = selectedCheckOut && isSameDay(day, selectedCheckOut);
                                                const inRange = isInSelectedRange(day);
                                                const isClickable = isCurrentMonth && !booked && !isPast;

                                                return (
                                                    <div
                                                        key={day.toString()}
                                                        onClick={() => isClickable && handleDateClick(day)}
                                                        className={`
                              relative p-2 sm:p-3 text-center rounded-lg font-montserrat text-sm
                              transition-all duration-200
                              ${!isCurrentMonth ? 'text-gray-200' : ''}
                              ${isPast && isCurrentMonth ? 'text-gray-300' : ''}
                              ${booked && isCurrentMonth ? 'bg-red-50 text-red-400' : ''}
                              ${!booked && isCurrentMonth && !isPast && !isCheckIn && !isCheckOut && !inRange ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer' : ''}
                              ${isCheckIn ? 'bg-[#27548A] text-white font-bold' : ''}
                              ${isCheckOut ? 'bg-[#183B4E] text-white font-bold' : ''}
                              ${inRange ? 'bg-[#27548A]/15 text-[#183B4E]' : ''}
                              ${isToday && !isCheckIn && !isCheckOut ? 'ring-2 ring-blue-400' : ''}
                              ${isClickable ? 'hover:scale-105' : ''}
                            `}
                                                    >
                                                        {format(day, 'd')}
                                                        {isToday && !isCheckIn && !isCheckOut && (
                                                            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="border-t border-gray-100 p-3 bg-gray-50">
                                <div className="flex flex-wrap justify-center gap-4 text-xs font-montserrat">
                                    <div className="flex items-center"><div className="w-3 h-3 bg-green-50 border border-green-300 rounded mr-1.5"></div>Tersedia</div>
                                    <div className="flex items-center"><div className="w-3 h-3 bg-red-50 border border-red-300 rounded mr-1.5"></div>Ditempah</div>
                                    <div className="flex items-center"><div className="w-3 h-3 bg-[#27548A] rounded mr-1.5"></div>Dipilih</div>
                                </div>
                            </div>
                        </div>

                        {/* Next Button */}
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => canProceedStep1 && setCurrentStep(2)}
                                disabled={!canProceedStep1}
                                className={`
                  px-8 py-3.5 rounded-lg font-montserrat font-bold tracking-wide transition-all duration-300
                  ${canProceedStep1
                                        ? 'bg-[#DDA853] text-[#183B4E] hover:bg-[#c9953f] shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0 cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }
                `}
                            >
                                Seterusnya →
                            </button>
                        </div>
                    </div>
                )}

                {/* === STEP 2: Guest Details === */}
                {currentStep === 2 && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#183B4E]">Maklumat Tetamu</h2>
                            <p className="text-[#183B4E]/60 font-montserrat mt-2">Sila isi maklumat anda untuk meneruskan tempahan</p>
                        </div>

                        {/* Booking summary mini card */}
                        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-6 font-montserrat text-sm">
                                <div>
                                    <span className="text-[#183B4E]/50 block text-xs">Daftar Masuk</span>
                                    <span className="font-semibold text-[#183B4E]">{selectedCheckIn ? format(selectedCheckIn, 'dd MMM yyyy') : '-'}</span>
                                </div>
                                <svg className="w-4 h-4 text-[#183B4E]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <div>
                                    <span className="text-[#183B4E]/50 block text-xs">Daftar Keluar</span>
                                    <span className="font-semibold text-[#183B4E]">{selectedCheckOut ? format(selectedCheckOut, 'dd MMM yyyy') : '-'}</span>
                                </div>
                            </div>
                            <div className="font-playfair font-bold text-xl text-[#183B4E]">
                                {totalNights} malam • RM{totalAmount.toLocaleString()}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-white rounded-xl shadow-lg p-6 space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-montserrat">{error}</div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1.5">Nama Penuh</label>
                                <input
                                    type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                                    required placeholder="Nama seperti dalam IC"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-[#183B4E]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1.5">No. Telefon</label>
                                    <input
                                        type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)}
                                        required placeholder="012-3456789"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-[#183B4E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1.5">E-mel</label>
                                    <input
                                        type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                                        required placeholder="contoh@email.com"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-[#183B4E]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1.5">No. Kad Pengenalan</label>
                                    <input
                                        type="text" value={guestIc} onChange={(e) => setGuestIc(e.target.value)}
                                        required placeholder="000000-00-0000"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-[#183B4E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1.5">Bilangan Tetamu</label>
                                    <select
                                        value={guestCount} onChange={(e) => setGuestCount(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-[#183B4E]"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <option key={n} value={n}>{n} orang</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="px-6 py-3 rounded-lg font-montserrat font-semibold text-[#183B4E] bg-white border-2 border-gray-200 hover:border-[#27548A] transition-all duration-300 cursor-pointer"
                            >
                                ← Kembali
                            </button>
                            <button
                                onClick={() => canProceedStep2 && setCurrentStep(3)}
                                disabled={!canProceedStep2}
                                className={`
                  px-8 py-3.5 rounded-lg font-montserrat font-bold tracking-wide transition-all duration-300
                  ${canProceedStep2
                                        ? 'bg-[#DDA853] text-[#183B4E] hover:bg-[#c9953f] shadow-lg hover:shadow-xl hover:translate-y-[-1px] cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }
                `}
                            >
                                Seterusnya →
                            </button>
                        </div>
                    </div>
                )}

                {/* === STEP 3: Confirmation === */}
                {currentStep === 3 && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#183B4E]">Pengesahan Tempahan</h2>
                            <p className="text-[#183B4E]/60 font-montserrat mt-2">Sila semak maklumat anda sebelum membuat pembayaran</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Booking Summary */}
                            <div className="bg-gradient-to-r from-[#183B4E] to-[#27548A] text-white p-6">
                                <h3 className="font-playfair text-xl font-bold mb-1">Tuah Suci Homestay</h3>
                                <p className="text-white/70 font-montserrat text-sm">Pokok Sena, Kedah Darul Aman</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#F5EEDC] rounded-lg p-4">
                                        <span className="text-xs text-[#183B4E]/50 font-montserrat block mb-1">Daftar Masuk</span>
                                        <span className="font-semibold text-[#183B4E] font-montserrat">{selectedCheckIn ? format(selectedCheckIn, 'dd MMM yyyy') : '-'}</span>
                                    </div>
                                    <div className="bg-[#F5EEDC] rounded-lg p-4">
                                        <span className="text-xs text-[#183B4E]/50 font-montserrat block mb-1">Daftar Keluar</span>
                                        <span className="font-semibold text-[#183B4E] font-montserrat">{selectedCheckOut ? format(selectedCheckOut, 'dd MMM yyyy') : '-'}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 space-y-3">
                                    <div className="flex justify-between font-montserrat text-sm">
                                        <span className="text-[#183B4E]/60">Nama</span>
                                        <span className="font-semibold text-[#183B4E]">{guestName}</span>
                                    </div>
                                    <div className="flex justify-between font-montserrat text-sm">
                                        <span className="text-[#183B4E]/60">No. Telefon</span>
                                        <span className="font-semibold text-[#183B4E]">{guestPhone}</span>
                                    </div>
                                    <div className="flex justify-between font-montserrat text-sm">
                                        <span className="text-[#183B4E]/60">E-mel</span>
                                        <span className="font-semibold text-[#183B4E]">{guestEmail}</span>
                                    </div>
                                    <div className="flex justify-between font-montserrat text-sm">
                                        <span className="text-[#183B4E]/60">No. IC</span>
                                        <span className="font-semibold text-[#183B4E]">{guestIc}</span>
                                    </div>
                                    <div className="flex justify-between font-montserrat text-sm">
                                        <span className="text-[#183B4E]/60">Bilangan Tetamu</span>
                                        <span className="font-semibold text-[#183B4E]">{guestCount} orang</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex justify-between font-montserrat text-sm mb-2">
                                        <span className="text-[#183B4E]/60">{totalNights} malam × RM{PRICE_PER_NIGHT}</span>
                                        <span className="text-[#183B4E]">RM{totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                                        <span className="font-montserrat font-bold text-[#183B4E]">Jumlah</span>
                                        <span className="font-playfair font-bold text-3xl text-[#183B4E]">RM{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-montserrat">{error}</div>
                                )}

                                {/* Lock notice */}
                                <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
                                    <p className="text-sm text-blue-700 font-montserrat">
                                        💡 Tempahan anda akan dikunci selama <strong>30 minit</strong> selepas pembayaran dimulakan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="px-6 py-3 rounded-lg font-montserrat font-semibold text-[#183B4E] bg-white border-2 border-gray-200 hover:border-[#27548A] transition-all duration-300 cursor-pointer"
                            >
                                ← Kembali
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`
                  px-8 py-3.5 rounded-lg font-montserrat font-bold tracking-wide transition-all duration-300
                  ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                                        : 'bg-gradient-to-r from-[#183B4E] to-[#27548A] text-white shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0 cursor-pointer'
                                    }
                `}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Memproses...
                                    </span>
                                ) : (
                                    `Bayar Sekarang — RM${totalAmount.toLocaleString()}`
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
