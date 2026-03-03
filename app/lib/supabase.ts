import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Booking type matching the Supabase schema
export type Booking = {
    id: string;
    guest_name: string;
    guest_phone: string;
    guest_email: string;
    guest_ic: string;
    guest_count: number;
    check_in: string;
    check_out: string;
    total_nights: number;
    total_amount: number;
    payment_status: 'pending' | 'paid' | 'failed' | 'expired';
    bill_code: string | null;
    payment_ref: string | null;
    pending_expires_at: string | null;
    created_at: string;
    updated_at: string;
};
