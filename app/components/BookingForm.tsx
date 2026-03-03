"use client";

import { useState, useEffect } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';

const PRICE_PER_NIGHT = 350;

type BookingFormProps = {
    checkIn: Date | null;
    checkOut: Date | null;
    onClose: () => void;
    onBookingComplete: () => void;
};

export default function BookingForm({ checkIn, checkOut, onClose, onBookingComplete }: BookingFormProps) {
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestIc, setGuestIc] = useState('');
    const [guestCount, setGuestCount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const totalNights = checkIn && checkOut
        ? differenceInCalendarDays(checkOut, checkIn)
        : 0;

    const totalAmount = totalNights * PRICE_PER_NIGHT;

    // Check availability when dates change
    useEffect(() => {
        if (!checkIn || !checkOut) return;

        const checkAvailability = async () => {
            setCheckingAvailability(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/check-availability?checkIn=${format(checkIn, 'yyyy-MM-dd')}&checkOut=${format(checkOut, 'yyyy-MM-dd')}`
                );
                const data = await response.json();
                setIsAvailable(data.available);
                if (!data.available) {
                    setError('Tarikh yang dipilih sudah ditempah. Sila pilih tarikh lain.');
                }
            } catch {
                setError('Gagal menyemak ketersediaan. Sila cuba lagi.');
            } finally {
                setCheckingAvailability(false);
            }
        };

        checkAvailability();
    }, [checkIn, checkOut]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkIn || !checkOut || isAvailable === false) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/create-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestName,
                    guestPhone,
                    guestEmail,
                    guestIc,
                    guestCount,
                    checkIn: format(checkIn, 'yyyy-MM-dd'),
                    checkOut: format(checkOut, 'yyyy-MM-dd'),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Gagal membuat tempahan');
                setIsSubmitting(false);
                return;
            }

            // Redirect to ToyyibPay payment page
            window.location.href = data.paymentUrl;
        } catch {
            setError('Ralat rangkaian. Sila cuba lagi.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#183B4E] to-[#27548A] text-white p-5 rounded-t-2xl flex justify-between items-center">
                    <div>
                        <h3 className="font-playfair text-xl font-bold">Borang Tempahan</h3>
                        <p className="text-white/80 text-sm font-montserrat mt-1">Tuah Suci Homestay</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                        aria-label="Tutup"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Booking Summary */}
                <div className="bg-[#F5EEDC] p-4 border-b border-[#DDA853]/30">
                    <div className="grid grid-cols-2 gap-4 text-sm font-montserrat">
                        <div>
                            <span className="text-[#183B4E]/60 block">Daftar Masuk</span>
                            <span className="text-[#183B4E] font-semibold">
                                {checkIn ? format(checkIn, 'dd MMM yyyy') : '-'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#183B4E]/60 block">Daftar Keluar</span>
                            <span className="text-[#183B4E] font-semibold">
                                {checkOut ? format(checkOut, 'dd MMM yyyy') : '-'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#DDA853]/30 flex justify-between items-center">
                        <span className="text-[#183B4E] font-montserrat text-sm">
                            {totalNights} malam × RM{PRICE_PER_NIGHT}
                        </span>
                        <span className="text-[#183B4E] font-playfair text-2xl font-bold">
                            RM{totalAmount.toLocaleString()}
                        </span>
                    </div>
                    {checkingAvailability && (
                        <div className="mt-2 flex items-center text-sm text-[#27548A] font-montserrat">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#27548A] mr-2"></div>
                            Menyemak ketersediaan...
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-montserrat">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1">
                            Nama Penuh
                        </label>
                        <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            required
                            placeholder="Nama seperti dalam IC"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-sm text-[#183B4E]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1">
                            No. Telefon
                        </label>
                        <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            required
                            placeholder="012-3456789"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-sm text-[#183B4E]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1">
                            E-mel
                        </label>
                        <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            required
                            placeholder="contoh@email.com"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-sm text-[#183B4E]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1">
                            No. Kad Pengenalan
                        </label>
                        <input
                            type="text"
                            value={guestIc}
                            onChange={(e) => setGuestIc(e.target.value)}
                            required
                            placeholder="000000-00-0000"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-sm text-[#183B4E]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#183B4E] font-montserrat mb-1">
                            Bilangan Tetamu
                        </label>
                        <select
                            value={guestCount}
                            onChange={(e) => setGuestCount(parseInt(e.target.value))}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#27548A] focus:ring-2 focus:ring-[#27548A]/20 outline-none transition-all font-montserrat text-sm text-[#183B4E]"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <option key={n} value={n}>{n} tetamu</option>
                            ))}
                        </select>
                    </div>

                    {/* Lock timer notice */}
                    <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
                        <p className="text-sm text-blue-700 font-montserrat">
                            💡 Tempahan anda akan dikunci selama <strong>30 minit</strong> selepas pembayaran dimulakan.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isAvailable === false || checkingAvailability || totalNights <= 0}
                        className={`w-full py-3.5 rounded-lg font-montserrat font-bold text-white tracking-wide transition-all duration-300 ${isSubmitting || isAvailable === false || checkingAvailability || totalNights <= 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#183B4E] to-[#27548A] hover:from-[#27548A] hover:to-[#183B4E] hover:translate-y-[-1px] shadow-lg hover:shadow-xl active:translate-y-0'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Memproses...
                            </span>
                        ) : (
                            `Bayar Sekarang — RM${totalAmount.toLocaleString()}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
