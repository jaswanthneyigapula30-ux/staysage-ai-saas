-- StaySage AI Database Schema
-- Run this in your Supabase SQL Editor to set up the database tables, relationships, and policies.

-- Create profiles table (links to Supabase Auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT,
  room_number TEXT,
  raw_text TEXT NOT NULL,
  source TEXT DEFAULT 'front_desk' CHECK (source IN ('front_desk', 'phone', 'mobile_app', 'in_person')),
  department TEXT DEFAULT 'Maintenance' CHECK (department IN ('Maintenance', 'Housekeeping', 'Billing', 'Noise', 'Staff Behavior', 'Amenities', 'Food Service', 'Safety')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security for complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Complaints Policies
CREATE POLICY "Authenticated users can select complaints" ON public.complaints
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert complaints" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update complaints" ON public.complaints
  FOR UPDATE TO authenticated USING (true);

-- Create complaint analysis table (1-to-1 relationship with complaints)
CREATE TABLE IF NOT EXISTS public.complaint_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  sentiment TEXT NOT NULL,
  suggested_department TEXT NOT NULL,
  escalation_required BOOLEAN DEFAULT FALSE,
  suggested_action TEXT NOT NULL,
  internal_note TEXT,
  ai_response_raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security for complaint_analysis
ALTER TABLE public.complaint_analysis ENABLE ROW LEVEL SECURITY;

-- Complaint Analysis Policies
CREATE POLICY "Authenticated users can view analysis" ON public.complaint_analysis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert analysis" ON public.complaint_analysis
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security for activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Activity Logs Policies
CREATE POLICY "Authenticated users can view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert activity logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to automatically handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'staff')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_complaint_updated
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed some initial data helpers if needed
