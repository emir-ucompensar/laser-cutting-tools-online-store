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

-- Table: public.cart_items
-- Stores shopping cart items for each authenticated user
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

CREATE OR REPLACE FUNCTION public.set_cart_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_cart_updated_at();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all products
CREATE POLICY "Allow select products" ON public.products
  FOR SELECT USING (true);

-- Policy: Users can only insert their own products
CREATE POLICY "Allow insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy: Users can only delete their own products
CREATE POLICY "Allow delete own products" ON public.products
  FOR DELETE USING (auth.uid() = created_by);

-- Policy: Users can read only their own cart items
CREATE POLICY "Allow select own cart items" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert only in their own cart
CREATE POLICY "Allow insert own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own cart
CREATE POLICY "Allow update own cart items" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own cart items
CREATE POLICY "Allow delete own cart items" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RPC: account self-deletion
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users
  WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

-- ============================================================================
-- Note: auth.users is managed by Supabase. It already exists and cannot be
-- created manually. The schema above is for reference only.
-- ============================================================================
