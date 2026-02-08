'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './toast-context';

interface CartItem {
    id: string;
    listing_id: string;
    quantity: number;
    listing: any;
}

interface CartContextType {
    cartItems: CartItem[];
    wishlistCount: number;
    addToCart: (listing: any) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    refreshCart: () => Promise<void>;
    refreshWishlist: () => Promise<void>;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const toast = useToast();

    const refreshCart = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setCartItems([]);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('cart_items')
            .select('*, listing:listings(*, profiles(full_name, store_name))')
            .eq('user_id', user.id);

        if (!error && data) {
            setCartItems(data);
        }
        setLoading(false);
    };

    const refreshWishlist = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setWishlistCount(0);
            return;
        }

        const { count, error } = await supabase
            .from('wishlist_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (!error) {
            setWishlistCount(count || 0);
        }
    };

    useEffect(() => {
        refreshCart();
        refreshWishlist();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            refreshCart();
            refreshWishlist();
        });

        return () => subscription.unsubscribe();
    }, []);

    const addToCart = async (listing: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please login to add items to cart.");
            return;
        }

        const existingItem = cartItems.find(item => item.listing_id === listing.id);

        if (existingItem) {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + 1 })
                .eq('id', existingItem.id);

            if (!error) {
                toast.success(`Updated ${listing.title} quantity`);
                refreshCart();
            }
        } else {
            const { error } = await supabase
                .from('cart_items')
                .insert({
                    user_id: user.id,
                    listing_id: listing.id,
                    quantity: 1
                });

            if (!error) {
                toast.success(`Added ${listing.title} to cart 🛒`);
                refreshCart();
            }
        }
    };

    const removeFromCart = async (itemId: string) => {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId);

        if (!error) {
            refreshCart();
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', itemId);

        if (!error) {
            refreshCart();
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            wishlistCount,
            addToCart,
            removeFromCart,
            updateQuantity,
            refreshCart,
            refreshWishlist,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
