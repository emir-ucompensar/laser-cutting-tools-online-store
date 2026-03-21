# Database Schema

## Tables Overview

### products
Stores product catalog items with metadata and image references.

**Fields:**
- `id` - Unique identifier (UUID)
- `name` - Product name
- `type` - Product category (e.g., "3D Printer", "Power Supply")
- `price` - Price in COP (must be > 0)
- `image_url` - Public URL to product image stored in Supabase Storage
- `created_by` - Foreign key to `auth.users(id)` — denotes product owner
- `created_at` - Timestamp with timezone

**Relationships:**
- Each product references the user who created it via `created_by`
- Products are deleted when the user is deleted (CASCADE)

### auth.users
Managed by Supabase. Contains email, password, and session metadata. Do not create manually.

---

## How to Recreate

1. Open Supabase SQL Editor
2. Copy the entire contents of `schema.sql`
3. Paste into the editor and execute

If you need to delete and recreate:
```sql
DROP TABLE IF EXISTS public.products CASCADE;
```

Then run the CREATE TABLE and RLS policy statements from `schema.sql`.

---

## Row Level Security (RLS)

Three policies are enabled:
- **SELECT**: Public. Anyone can view all products.
- **INSERT**: Only the authenticated user can insert products.
- **DELETE**: Only the product owner can delete their own products.

These policies are enforced automatically by Supabase.

---

## Indexes

Two indexes improve query performance:
- `idx_products_created_by` — Speeds up filtering by user
- `idx_products_created_at` — Speeds up sorting by creation date (DESC)
