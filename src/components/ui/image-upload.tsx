'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
    onUpload: (urls: string[]) => void;
    maxFiles?: number;
    value?: string[];
}

export function ImageUpload({ onUpload, maxFiles = 4, value = [] }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState<string[]>(value);
    const supabase = createClient();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            setUploading(true);
            const newUrls: string[] = [];
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Please sign in to upload images.");
                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Simple validation
                if (!file.type.startsWith('image/')) continue;
                if (previews.length + newUrls.length >= maxFiles) break;

                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('listings')
                    .upload(fileName, file);

                if (uploadError) {
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('listings')
                    .getPublicUrl(fileName);

                newUrls.push(publicUrl);
            }

            const updatedPreviews = [...previews, ...newUrls];
            setPreviews(updatedPreviews);
            onUpload(updatedPreviews);

        } catch (error: any) {
            console.error("Upload error detail:", error);
            if (error.message?.includes('bucket')) {
                alert("Storage bucket 'listings' not found. Please run the storage-setup.sql script in your Supabase SQL Editor.");
            } else {
                alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const removeImage = (indexToRemove: number) => {
        const updated = previews.filter((_, index) => index !== indexToRemove);
        setPreviews(updated);
        onUpload(updated);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((url, index) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-loops-border group">
                        <Image
                            src={url}
                            alt="Listing image"
                            fill
                            className="object-cover"
                        />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {previews.length < maxFiles && (
                    <label className={cn(
                        "relative aspect-square rounded-xl border-2 border-dashed border-loops-border flex flex-col items-center justify-center cursor-pointer hover:border-loops-primary/50 hover:bg-loops-subtle transition-colors group",
                        uploading && "opacity-50 pointer-events-none"
                    )}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-loops-primary animate-spin" />
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-loops-subtle group-hover:bg-white flex items-center justify-center mb-2 transition-colors">
                                    <Upload className="w-5 h-5 text-loops-muted group-hover:text-loops-primary" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-loops-muted">Upload</span>
                            </>
                        )}
                    </label>
                )}
            </div>
            <p className="text-[10px] text-loops-muted uppercase tracking-widest font-bold">
                {previews.length} / {maxFiles} images
            </p>
        </div>
    );
}
