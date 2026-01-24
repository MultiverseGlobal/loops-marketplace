import { createClient } from "@/lib/supabase/client";

export type Product = {
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
    description?: string;
    seller?: {
        name: string;
        username: string;
        avatar?: string;
        rating?: number;
    };
};

export const productService = {
    async getTrendingProducts(): Promise<Product[]> {
        // For now, returning mock data but structured for future Supabase fetch
        return [
            { id: "1", title: "Calculus Early Transcendentals", price: "$45.00", category: "Books", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000" },
            { id: "2", title: "Graphing Calculator TI-84", price: "$85.00", category: "Electronics", image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=1000" },
            { id: "3", title: "Architecture Kit", price: "$120.00", category: "Supplies", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000" },
            { id: "4", title: "Digital Camera Canon", price: "$250.00", category: "Electronics", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000" },
        ];
    },

    async getAllProducts(): Promise<Product[]> {
        const products = await this.getTrendingProducts();
        return [
            ...products,
            { id: "5", title: "Dorm Mini Fridge", price: "$60.00", category: "Home", image: "https://images.unsplash.com/photo-1571175443880-49e1d58b794a?auto=format&fit=crop&q=80&w=1000" },
            { id: "6", title: "Lab Coat (M)", price: "$15.00", category: "Apparel", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1000" },
        ];
    },

    async getProductById(id: string): Promise<Product | null> {
        const products = await this.getAllProducts();
        return products.find(p => p.id === id) || null;
    }
};
