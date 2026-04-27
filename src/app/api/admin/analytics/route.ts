// Testing write access
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

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
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        const [
            usersCount,
            plugsCount,
            listingsCount,
            productsCount,
            servicesCount,
            newUsers24h,
            newListings24h,
            readyVendors
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_plug', true),
            supabase.from('listings').select('*', { count: 'exact', head: true }),
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'product'),
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'service'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('created_at', yesterday),
            supabase.from('listings').select('*', { count: 'exact', head: true }).gt('created_at', yesterday),
            // Count vendors with >= 3 listings
            supabase.rpc('get_ready_vendors_count') // We'll need to create this RPC or do it manually
        ]);

        // Alternative for ready vendors if RPC doesn't exist yet
        let readyVendorsCount = readyVendors.data || 0;
        if (readyVendors.error) {
            const { data: allPlugs } = await supabase.from('profiles').select('id').eq('is_plug', true);
            const plugIds = allPlugs?.map(p => p.id) || [];
            const { data: listingCounts } = await supabase.from('listings').select('seller_id');
            const counts: Record<string, number> = {};
            listingCounts?.forEach(l => {
                if (plugIds.includes(l.seller_id)) {
                    counts[l.seller_id] = (counts[l.seller_id] || 0) + 1;
                }
            });
            readyVendorsCount = Object.values(counts).filter(c => c >= 3).length;
        }

        // 3. GMV Calculation
        const { data: gmvData } = await supabase
            .from('listings')
            .select('price')
            .eq('status', 'active');

        const listedGMV = gmvData?.reduce((acc: number, curr: any) => acc + (Number(curr.price) || 0), 0) || 0;

        const { data: realizedData } = await supabase
            .from('transactions')
            .select('amount')
            .eq('status', 'completed');

        const realizedGMV = realizedData?.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0) || 0;

        // 4. Category Distribution
        const { data: categories, error: catError } = await supabase
            .from('listings')
            .select('category');

        const categoryMap: Record<string, number> = {};
        categories?.forEach((item: any) => {
            const cat = item.category || 'Uncategorized';
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        // 5. Top Sellers Leaderboard (based on listing count for now)
        const { data: topSellers, error: sellerError } = await supabase
            .from('listings')
            .select('seller_id, profiles(full_name, avatar_url)')
            .eq('status', 'active');

        const sellerCounts: Record<string, { name: string, avatar: string, count: number }> = {};
        topSellers?.forEach((item: any) => {
            if (!item.seller_id) return;
            const profile: any = item.profiles;
            if (!sellerCounts[item.seller_id]) {
                sellerCounts[item.seller_id] = {
                    name: profile?.full_name || 'Unknown',
                    avatar: profile?.avatar_url || '',
                    count: 0
                };
            }
            sellerCounts[item.seller_id].count++;
        });

        const sortedSellers = Object.values(sellerCounts)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5);

        return NextResponse.json({
            overview: {
                totalUsers: usersCount.count || 0,
                verifiedPlugs: plugsCount.count || 0,
                totalListings: listingsCount.count || 0,
                products: productsCount.count || 0,
                services: servicesCount.count || 0,
                listedGMV: listedGMV,
                realizedGMV: realizedGMV,
                newUsers24h: newUsers24h.count || 0,
                newListings24h: newListings24h.count || 0,
                readyVendors: readyVendorsCount
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
