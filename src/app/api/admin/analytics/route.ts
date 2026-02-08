import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();

        // 1. Check Admin Authorization
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Aggregate Growth Metrics
        const [
            usersCount,
            plugsCount,
            listingsCount,
            productsCount,
            servicesCount
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_plug', true),
            supabase.from('listings').select('*', { count: 'exact', head: true }),
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'product'),
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'service')
        ]);

        // 3. Gross Merchandise Value (GMV) Calculation
        // Note: For MVP, we calculate "Listed GMV" as total value of active listings
        const { data: gmvData, error: gmvError } = await supabase
            .from('listings')
            .select('price')
            .eq('status', 'active');

        const listedGMV = gmvData?.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) || 0;

        // 4. Category Distribution
        const { data: categories, error: catError } = await supabase
            .from('listings')
            .select('category');

        const categoryMap: Record<string, number> = {};
        categories?.forEach(item => {
            const cat = item.category || 'Uncategorized';
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        // 5. Top Sellers Leaderboard (based on listing count for now)
        const { data: topSellers, error: sellerError } = await supabase
            .from('listings')
            .select('vendor_id, profiles(full_name, avatar_url)')
            .eq('status', 'active');

        const sellerCounts: Record<string, { name: string, avatar: string, count: number }> = {};
        topSellers?.forEach(item => {
            if (!item.vendor_id) return;
            const profile: any = item.profiles;
            if (!sellerCounts[item.vendor_id]) {
                sellerCounts[item.vendor_id] = {
                    name: profile?.full_name || 'Unknown',
                    avatar: profile?.avatar_url || '',
                    count: 0
                };
            }
            sellerCounts[item.vendor_id].count++;
        });

        const sortedSellers = Object.values(sellerCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return NextResponse.json({
            overview: {
                totalUsers: usersCount.count || 0,
                verifiedPlugs: plugsCount.count || 0,
                totalListings: listingsCount.count || 0,
                products: productsCount.count || 0,
                services: servicesCount.count || 0,
                listedGMV: listedGMV
            },
            categoryDistribution: categoryMap,
            topSellers: sortedSellers,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics', details: error.message },
            { status: 500 }
        );
    }
}
