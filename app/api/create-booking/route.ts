import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import crypto from 'crypto';

const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY!;
const TOYYIBPAY_CATEGORY_CODE = process.env.TOYYIBPAY_CATEGORY_CODE!;
const TOYYIBPAY_BASE_URL = process.env.TOYYIBPAY_BASE_URL || 'https://dev.toyyibpay.com';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const PRICE_PER_NIGHT_CENTS = 35000; // RM350 in cents
const PENDING_LOCK_MINUTES = 30;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { guestName, guestPhone, guestEmail, guestIc, guestCount, checkIn, checkOut } = body;

        // Validate required fields
        if (!guestName || !guestPhone || !guestEmail || !guestIc || !guestCount || !checkIn || !checkOut) {
            return NextResponse.json(
                { error: 'Semua maklumat diperlukan' },
                { status: 400 }
            );
        }

        // Validate dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate <= checkInDate) {
            return NextResponse.json(
                { error: 'Tarikh daftar keluar mestilah selepas tarikh daftar masuk' },
                { status: 400 }
            );
        }

        // Calculate nights and total
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalAmountCents = totalNights * PRICE_PER_NIGHT_CENTS;

        // Check for overlapping bookings (paid or non-expired pending)
        const now = new Date().toISOString();
        const { data: overlapping, error: overlapError } = await supabase
            .from('bookings')
            .select('id')
            .or(`payment_status.eq.paid,and(payment_status.eq.pending,pending_expires_at.gt.${now})`)
            .lt('check_in', checkOut)
            .gt('check_out', checkIn);

        if (overlapError) {
            console.error('Error checking overlap:', overlapError);
            return NextResponse.json(
                { error: 'Gagal menyemak ketersediaan' },
                { status: 500 }
            );
        }

        if (overlapping && overlapping.length > 0) {
            return NextResponse.json(
                { error: 'Tarikh yang dipilih sudah ditempah. Sila pilih tarikh lain.' },
                { status: 409 }
            );
        }

        // Calculate pending_expires_at (30 minutes from now)
        const pendingExpiresAt = new Date(Date.now() + PENDING_LOCK_MINUTES * 60 * 1000).toISOString();

        // Insert booking into Supabase
        const { data: booking, error: insertError } = await supabase
            .from('bookings')
            .insert({
                guest_name: guestName,
                guest_phone: guestPhone,
                guest_email: guestEmail,
                guest_ic: guestIc,
                guest_count: guestCount,
                check_in: checkIn,
                check_out: checkOut,
                total_nights: totalNights,
                total_amount: totalAmountCents,
                payment_status: 'pending',
                pending_expires_at: pendingExpiresAt,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting booking:', insertError);
            // Check if it's a constraint violation (double booking at DB level)
            if (insertError.code === '23P01') {
                return NextResponse.json(
                    { error: 'Tarikh yang dipilih sudah ditempah. Sila pilih tarikh lain.' },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { error: 'Gagal membuat tempahan' },
                { status: 500 }
            );
        }

        // Create bill on ToyyibPay
        const billData = new URLSearchParams({
            userSecretKey: TOYYIBPAY_SECRET_KEY,
            categoryCode: TOYYIBPAY_CATEGORY_CODE,
            billName: 'Tempahan Tuah Suci Homestay',
            billDescription: `Tempahan ${totalNights} malam (${checkIn} - ${checkOut})`,
            billPriceSetting: '1',
            billPayorInfo: '1',
            billAmount: totalAmountCents.toString(),
            billReturnUrl: `${BASE_URL}/booking/status`,
            billCallbackUrl: `${BASE_URL}/api/payment-callback`,
            billExternalReferenceNo: booking.id,
            billTo: guestName,
            billEmail: guestEmail,
            billPhone: guestPhone,
            billSplitPayment: '0',
            billSplitPaymentArgs: '',
            billPaymentChannel: '2', // FPX + Credit Card
            billDisplayMerchant: '1',
            billContentEmail: `Terima kasih kerana menempah Tuah Suci Homestay!\n\nDaftar Masuk: ${checkIn}\nDaftar Keluar: ${checkOut}\nBilangan Malam: ${totalNights}\nJumlah: RM${(totalAmountCents / 100).toFixed(2)}`,
            billChargeToCustomer: '',
            billExpiryDays: '1',
        });

        const toyyibResponse = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/createBill`, {
            method: 'POST',
            body: billData,
        });

        const toyyibResult = await toyyibResponse.json();

        if (!toyyibResult || !toyyibResult[0]?.BillCode) {
            console.error('ToyyibPay error:', toyyibResult);
            // Clean up the booking if ToyyibPay fails
            await supabase.from('bookings').delete().eq('id', booking.id);
            return NextResponse.json(
                { error: 'Gagal membuat bil pembayaran. Sila cuba lagi.' },
                { status: 500 }
            );
        }

        const billCode = toyyibResult[0].BillCode;

        // Update booking with bill code
        await supabase
            .from('bookings')
            .update({ bill_code: billCode })
            .eq('id', booking.id);

        // Return the payment URL
        const paymentUrl = `${TOYYIBPAY_BASE_URL}/${billCode}`;

        // Generate a simple hash for client-side verification
        const verificationHash = crypto
            .createHash('md5')
            .update(booking.id + TOYYIBPAY_SECRET_KEY)
            .digest('hex');

        return NextResponse.json({
            paymentUrl,
            bookingId: booking.id,
            billCode,
            totalNights,
            totalAmount: totalAmountCents / 100,
            hash: verificationHash,
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json(
            { error: 'Ralat dalaman pelayan' },
            { status: 500 }
        );
    }
}
