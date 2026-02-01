import { createClient } from './supabase/client';

export async function followUser(followingId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Auth required");
    if (user.id === followingId) throw new Error("Cannot follow yourself");

    const { error } = await supabase
        .from('follows')
        .insert({
            follower_id: user.id,
            following_id: followingId
        });

    if (error) throw error;
    return true;
}

export async function unfollowUser(followingId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Auth required");

    const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

    if (error) throw error;
    return true;
}

export async function getFollowStatus(followingId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Check follow error:', error);
    }

    return !!data;
}

export async function getFollowCounts(userId: string) {
    const supabase = createClient();

    const [followers, following] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
    ]);

    return {
        followers: followers.count || 0,
        following: following.count || 0
    };
}
