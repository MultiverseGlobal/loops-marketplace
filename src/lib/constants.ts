export const PRODUCT_CATEGORIES = [
    { id: "all", label: "All Items", icon: "LayoutGrid", color: "#6366f1", image3d: "/assets/3d/3d_tech_laptop_transparent_1776100517427.png" },
    { id: "books", label: "Books", icon: "BookOpen", color: "#f59e0b", image3d: "/assets/3d/3d_books_emerald_glow_1776100565257.png" },
    { id: "electronics", label: "Tech", icon: "Laptop", color: "#10b981", image3d: "/assets/3d/3d_tech_laptop_transparent_1776100517427.png" },
    { id: "fashion", label: "Fashion", icon: "Shirt", color: "#ec4899", image3d: "/assets/3d/3d_sneaker_fashion_emerald_1776100733897.png" },
    { id: "others", label: "Others", icon: "MoreHorizontal", color: "#94a3b8", image3d: "/assets/3d/3d_creative_hub_emerald_glow_1776101035903.png" },
];

export const SERVICE_CATEGORIES = [
    { id: "all", label: "All Hubs", icon: "LayoutGrid", color: "#6366f1", image3d: "/assets/3d/3d_creative_hub_emerald_glow_1776101035903.png" },
    { id: "tutoring", label: "Services", icon: "GraduationCap", color: "#8b5cf6", image3d: "/assets/3d/3d_creative_hub_emerald_glow_1776101035903.png" },
    { id: "tech", label: "Tech Support", icon: "Wrench", color: "#3b82f6", image3d: "/assets/3d/3d_tech_laptop_transparent_1776100517427.png" },
    { id: "design", label: "Creative", icon: "Palette", color: "#ec4899", image3d: "/assets/3d/3d_creative_hub_emerald_glow_1776101035903.png" },
    { id: "others", label: "Others", icon: "MoreHorizontal", color: "#94a3b8", image3d: "/assets/3d/3d_creative_hub_emerald_glow_1776101035903.png" },
];

export const CATEGORIES = PRODUCT_CATEGORIES; // Backwards compatibility for now

export const CURRENCY = "₦";
export const CURRENCY_CODE = "NGN";

export const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000";

// LoopBot Configuration
export const LOOPBOT_NUMBER = "13157376569"; // Twilio Sandbox (Update to production Meta number)
