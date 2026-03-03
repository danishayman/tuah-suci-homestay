import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import crypto from 'crypto';

const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY!;

export async function POST(request: Request) {
    try {
        // ToyyibPay sends callback as form-urlencoded
        const formData = await request.formData();

        const refno = formData.get('refno') as string;
        const status = formData.get('status') as string;
        const reason = formData.get('reason') as string;
        const billcode = formData.get('billcode') as string;
        const orderId = formData.get('order_id') as string;
        const amount = formData.get('amount') as string;
        const receivedHash = formData.get('hash') as string;

        console.log('Payment callback received:', {
            refno,
            status,
            reason,
            billcode,
            orderId,
            amount,
        });

        // Validate MD5 hash
        // Formula: MD5(userSecretKey + status + order_id + refno + "ok")
        const expectedHash = crypto
            .createHash('md5')
            .update(TOYYIBPAY_SECRET_KEY + status + orderId + refno + 'ok')
            .digest('hex');

        if (receivedHash !== expectedHash) {
            console.error('Hash mismatch:', { receivedHash, expectedHash });
            return NextResponse.json(
                { error: 'Invalid hash' },
                { status: 403 }
            );
        }

        // Map ToyyibPay status to our status
        // 1 = success, 2 = pending, 3 = fail
        let paymentStatus: string;
        switch (status) {
            case '1':
                paymentStatus = 'paid';
                break;
            case '3':
                paymentStatus = 'failed';
                break;
            default:
                paymentStatus = 'pending';
                break;
        }

        // Update booking in Supabase
        // orderId is the booking UUID (billExternalReferenceNo)
        const updateData: Record<string, unknown> = {
            payment_status: paymentStatus,
            payment_ref: refno,
            updated_at: new Date().toISOString(),
        };

        // If paid, clear the pending expiry
        if (paymentStatus === 'paid') {
            updateData.pending_expires_at = null;
        }

        const { error: updateError } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', orderId);

        if (updateError) {
            console.error('Error updating booking:', updateError);
            return NextResponse.json(
                { error: 'Failed to update booking' },
                { status: 500 }
            );
        }

        console.log(`Booking ${orderId} updated to ${paymentStatus}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing payment callback:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
