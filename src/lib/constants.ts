export const PRODUCT_CATEGORIES = [
    { id: "all", label: "All Items", icon: "LayoutGrid", color: "#6366f1" },
    { id: "books", label: "Books", icon: "BookOpen", color: "#f59e0b" },
    { id: "electronics", label: "Tech", icon: "Laptop", color: "#10b981" },
    { id: "fashion", label: "Fashion", icon: "Shirt", color: "#ec4899" },
    { id: "others", label: "Others", icon: "MoreHorizontal", color: "#94a3b8" },
];

export const SERVICE_CATEGORIES = [
    { id: "all", label: "All Hubs", icon: "LayoutGrid", color: "#6366f1" },
    { id: "tutoring", label: "Services", icon: "GraduationCap", color: "#8b5cf6" },
    { id: "tech", label: "Tech Support", icon: "Wrench", color: "#3b82f6" },
    { id: "design", label: "Creative", icon: "Palette", color: "#ec4899" },
    { id: "others", label: "Others", icon: "MoreHorizontal", color: "#94a3b8" },
];

export const CATEGORIES = PRODUCT_CATEGORIES; // Backwards compatibility for now

export const CURRENCY = "₦";
export const CURRENCY_CODE = "NGN";

export const FALLBACK_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000";

// LoopBot Configuration
export const LOOPBOT_NUMBER = "13157376569"; // Twilio Sandbox (Update to production Meta number)
