-- Tuah Suci Homestay - Booking System Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)

-- Enable extension for range-based exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_ic TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_nights INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,              -- stored in cents (RM350 = 35000)
  payment_status TEXT DEFAULT 'pending',      -- pending | paid | failed | expired
  bill_code TEXT,
  payment_ref TEXT,
  pending_expires_at TIMESTAMPTZ,             -- 30 min after creation for pending bookings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent overlapping date ranges for active bookings
  -- Uses half-open range [check_in, check_out) so checkout day is available
  CONSTRAINT no_overlapping_bookings
    EXCLUDE USING GIST (
      daterange(check_in, check_out, '[)') WITH &&
    )
    WHERE (payment_status IN ('pending', 'paid'))
);

-- Index for fast date overlap queries
CREATE INDEX idx_bookings_dates ON bookings (check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings (payment_status);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for booking creation)
CREATE POLICY "Allow anonymous inserts" ON bookings
  FOR INSERT TO anon WITH CHECK (true);

-- Policy: Allow anonymous reads (for availability checking)
CREATE POLICY "Allow anonymous reads" ON bookings
  FOR SELECT TO anon USING (true);

-- Policy: Allow anonymous updates (for payment callback)
CREATE POLICY "Allow anonymous updates" ON bookings
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
