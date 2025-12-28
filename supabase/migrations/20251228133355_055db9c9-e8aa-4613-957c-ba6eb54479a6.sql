-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Create profiles table for students
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  enrollment TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create admins table
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins can be read for login verification (public read for username check)
CREATE POLICY "Admins table is readable for login" ON public.admins
  FOR SELECT USING (true);

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Create categories table for custom categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are readable by everyone
CREATE POLICY "Categories are readable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Insert default categories
INSERT INTO public.categories (name, is_default) VALUES
  ('Infrastructure', true),
  ('Academic', true),
  ('Hostel', true),
  ('Canteen', true),
  ('Library', true),
  ('Sports', true),
  ('Transport', true),
  ('Other', true);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Students can view their own complaints
CREATE POLICY "Students can view their own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own complaints
CREATE POLICY "Students can insert their own complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Allow public read for admin dashboard (admins check via localStorage, not Supabase auth)
CREATE POLICY "Public read for complaints" ON public.complaints
  FOR SELECT USING (true);

-- Allow public update for status changes from admin
CREATE POLICY "Public update for complaints status" ON public.complaints
  FOR UPDATE USING (true);

-- Insert default admin
INSERT INTO public.admins (username, password_hash) VALUES
  ('admin', 'admin123');