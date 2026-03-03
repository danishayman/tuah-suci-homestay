"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, Booking } from '@/app/lib/supabase';

function BookingStatusContent() {
    const searchParams = useSearchParams();
    const statusId = searchParams.get('status_id');
    const billcode = searchParams.get('billcode');
    const orderId = searchParams.get('order_id');

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBooking() {
            if (!orderId) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (error) {
                    console.error('Error fetching booking:', error);
                } else {
                    setBooking(data as Booking);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchBooking();
    }, [orderId]);

    const isSuccess = statusId === '1';
    const isPending = statusId === '2';
    const isFailed = statusId === '3';

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5EEDC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#27548A]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5EEDC] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Status Header */}
                <div className={`p-8 text-center ${isSuccess
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : isPending
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}>
                    {isSuccess ? (
                        <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    ) : isPending ? (
                        <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}
                    <h1 className="text-2xl font-playfair font-bold text-white">
                        {isSuccess
                            ? 'Pembayaran Berjaya!'
                            : isPending
                                ? 'Pembayaran Dalam Proses'
                                : 'Pembayaran Gagal'}
                    </h1>
                    <p className="text-white/80 font-montserrat text-sm mt-2">
                        {isSuccess
                            ? 'Terima kasih! Tempahan anda telah disahkan.'
                            : isPending
                                ? 'Pembayaran anda sedang diproses.'
                                : 'Pembayaran tidak berjaya. Sila cuba lagi.'}
                    </p>
                </div>

                {/* Booking Details */}
                {booking && (
                    <div className="p-6 space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500 font-montserrat">Nama</span>
                                <span className="text-sm font-semibold text-[#183B4E] font-montserrat">{booking.guest_name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500 font-montserrat">Daftar Masuk</span>
                                <span className="text-sm font-semibold text-[#183B4E] font-montserrat">{booking.check_in}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500 font-montserrat">Daftar Keluar</span>
                                <span className="text-sm font-semibold text-[#183B4E] font-montserrat">{booking.check_out}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500 font-montserrat">Bilangan Malam</span>
                                <span className="text-sm font-semibold text-[#183B4E] font-montserrat">{booking.total_nights} malam</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500 font-montserrat">Bilangan Tetamu</span>
                                <span className="text-sm font-semibold text-[#183B4E] font-montserrat">{booking.guest_count} orang</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500 font-montserrat">Jumlah</span>
                                <span className="text-lg font-bold text-[#183B4E] font-playfair">
                                    RM{(booking.total_amount / 100).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {billcode && (
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <span className="text-xs text-gray-500 font-montserrat">Kod Bil: {billcode}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 pt-0 space-y-3">
                    {isSuccess && (
                        <a
                            href={`https://wa.me/60175240056?text=${encodeURIComponent(
                                `Tuah Suci Homestay - Saya telah membuat pembayaran untuk tempahan.\n\nNama: ${booking?.guest_name}\nDaftar Masuk: ${booking?.check_in}\nDaftar Keluar: ${booking?.check_out}\nKod Bil: ${billcode}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-montserrat font-bold text-center transition-all duration-300"
                        >
                            📱 Hubungi Kami via WhatsApp
                        </a>
                    )}

                    <Link
                        href="/"
                        className="block w-full py-3 rounded-lg bg-gradient-to-r from-[#183B4E] to-[#27548A] hover:from-[#27548A] hover:to-[#183B4E] text-white font-montserrat font-bold text-center transition-all duration-300"
                    >
                        Kembali ke Laman Utama
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function BookingStatusPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F5EEDC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#27548A]"></div>
            </div>
        }>
            <BookingStatusContent />
        </Suspense>
    );
}
