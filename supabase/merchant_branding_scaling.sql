-- 🎨 Scaling Merchant Branding & Schema Fix
-- Fixes: "Could not find the 'store_banner_color' column of 'seller_applications'"

-- 1. Update seller_applications with branding fields
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='store_name') then
        alter table public.seller_applications add column store_name text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='store_banner_color') then
        alter table public.seller_applications add column store_banner_color text default 'bg-loops-primary';
    end if;

    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='store_category') then
        alter table public.seller_applications add column store_category text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='store_logo_url') then
        alter table public.seller_applications add column store_logo_url text;
    end if;
end $$;

-- 2. Update profiles with additional branding support
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='store_logo_url') then
        alter table public.profiles add column store_logo_url text;
    end if;

    -- Add a flag to reserve some branding features for launch
    if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='branding_tier') then
        alter table public.profiles add column branding_tier text default 'basic' check (branding_tier in ('basic', 'founding', 'premium'));
    end if;
end $$;

-- 3. Comment for documentation
comment on column public.seller_applications.store_logo_url is 'Store brand logo or student entrepreneur headshot.';
comment on column public.profiles.branding_tier is 'Determines visible branding features. "founding" reserve features for post-launch.';
