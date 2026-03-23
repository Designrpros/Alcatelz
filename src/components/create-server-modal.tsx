"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, X, Loader2 } from "lucide-react";

interface CreateServerModalProps {
  onClose: () => void;
  onCreated: (server: { slug: string; name: string }) => void;
  prefill?: { slug?: string; name?: string };
}

export function CreateServerModal({ onClose, onCreated, prefill }: CreateServerModalProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(prefill?.slug || "");
  const [name, setName] = useState(prefill?.name || prefill?.slug || "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!slug || !name) {
      setError("Slug and name are required");
      return;
    }
    
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, description }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to create server");
        return;
      }
      
      onCreated(data);
      onClose();
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card rounded-xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-serif font-bold">Create Server</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Creative Projects"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/50"
              maxLength={50}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug *</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="creative"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={30}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              a/{slug || 'your-server'}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this server about?"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
              maxLength={200}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !slug || !name}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
