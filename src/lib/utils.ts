import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export function formatWhatsAppNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = (phone || "").replace(/\D/g, "");

    // If it starts with 0 and has 11 digits (Nigerian standard), replace 0 with 234
    if (cleaned.startsWith("0") && cleaned.length === 11) {
        return "234" + cleaned.substring(1);
    }

    // If it's already 234 followed by the rest, return it
    if (cleaned.startsWith("234") && cleaned.length === 13) {
        return cleaned;
    }

    // Default: just return cleaned digits (WhatsApp API takes numbers)
    return cleaned;
}
