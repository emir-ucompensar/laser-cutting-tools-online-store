-- ============================================================================
-- Database Schema — Laser Cutting Tools Online Store
-- ============================================================================

-- Table: public.products
-- Stores all products in the catalog
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all products
CREATE POLICY "Allow select products" ON public.products
  FOR SELECT USING (true);

-- Policy: Users can only insert their own products
CREATE POLICY "Allow insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy: Users can only delete their own products
CREATE POLICY "Allow delete own products" ON public.products
  FOR DELETE USING (auth.uid() = created_by);

-- ============================================================================
-- Note: auth.users is managed by Supabase. It already exists and cannot be
-- created manually. The schema above is for reference only.
-- ============================================================================
