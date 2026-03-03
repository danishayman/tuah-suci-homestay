import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');

        if (!checkIn || !checkOut) {
            return NextResponse.json(
                { error: 'checkIn and checkOut are required' },
                { status: 400 }
            );
        }

        // Query for overlapping bookings that are paid or non-expired pending
        // Uses half-open range logic: [check_in, check_out)
        // A booking overlaps if: existing.check_in < requested.check_out AND existing.check_out > requested.check_in
        const { data: overlapping, error } = await supabase
            .from('bookings')
            .select('id, check_in, check_out, payment_status, pending_expires_at')
            .or(`payment_status.eq.paid,and(payment_status.eq.pending,pending_expires_at.gt.${new Date().toISOString()})`)
            .lt('check_in', checkOut)
            .gt('check_out', checkIn);

        if (error) {
            console.error('Error checking availability:', error);
            return NextResponse.json(
                { error: 'Failed to check availability' },
                { status: 500 }
            );
        }

        const isAvailable = !overlapping || overlapping.length === 0;

        return NextResponse.json({
            available: isAvailable,
            conflictingBookings: isAvailable ? [] : overlapping.map(b => ({
                checkIn: b.check_in,
                checkOut: b.check_out,
            })),
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
