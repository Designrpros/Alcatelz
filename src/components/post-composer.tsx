"use client";
import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { Image as ImageIcon, Send, Upload, LogIn, Hash } from "lucide-react";

interface User {
    id: string;
    username: string;
    name: string | null;
}

interface PostComposerProps {
    onPost: (content: string, imageUrl?: string) => void;
    user: User | null;
    serverSlug: string;
}

export function PostComposer({ onPost, user, serverSlug }: PostComposerProps) {
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Extract hashtags from content
    const extractedHashtags = useMemo(() => {
        const matches = content.match(/#([a-zA-Z0-9_]+)/g) || [];
        return [...new Set(matches.map(h => h.slice(1).toLowerCase()))];
    }, [content]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setImageUrl(data.url);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = () => {
        if (content.trim()) {
            onPost(content, imageUrl || undefined);
            setContent("");
            setImageUrl("");
            setIsExpanded(false);
        }
    };

    if (!user) {
        return (
            <div className="border border-border rounded-lg p-4 bg-card">
                <p className="text-sm text-muted-foreground text-center">
                    <Link href="/auth" className="text-primary hover:underline flex items-center justify-center gap-2">
                        <LogIn className="w-4 h-4" /> Sign in to post
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-lg p-4 bg-card">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="What's on your mind? Use #hashtags to categorize..."
                className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground min-h-[60px]"
                rows={isExpanded ? 4 : 2}
            />

            {/* Extracted hashtags preview */}
            {isExpanded && extractedHashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {extractedHashtags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {isExpanded && (
                <>
                    {imageUrl && (
                        <div className="mt-3 relative">
                            <img src={imageUrl} alt="Preview" className="max-h-40 rounded-md" />
                            <button
                                onClick={() => setImageUrl("")}
                                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="p-1.5 rounded hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                            title="Upload image"
                        >
                            {isUploading ? (
                                <Upload className="w-4 h-4 text-muted-foreground animate-spin" />
                            ) : (
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim()}
                            className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-md font-medium disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                        >
                            <Send className="w-3 h-3" /> Post
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
