"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Heart, MessageCircle, Image as ImageIcon, Send, Globe, Hash, Upload, LogIn } from "lucide-react";

interface User {
  id: string;
  username: string;
  name: string | null;
}

interface Server {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  authorName?: string;
  serverSlug?: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function PostCard({ post, onLike }: { post: Post; onLike?: (id: string) => void }) {
  const router = useRouter();
  
  return (
    <div 
      className="border border-border rounded-md p-4 bg-card hover:bg-card/80 transition-colors cursor-pointer"
      onClick={() => router.push(`/post/${post.id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {post.authorName || 'unknown'}
            </span>
            <span className="text-muted-foreground">@</span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary mb-1">
            <Hash className="w-3 h-3" />
            {post.serverSlug || 'alcatelz'}
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <div className="mt-3 rounded-md overflow-hidden border border-border">
              <img src={post.imageUrl} alt="Post image" className="max-h-64 w-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onLike?.(post.id)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4" /> {post.likesCount || 0}
            </button>
            <button 
              onClick={() => router.push(`/post/${post.id}`)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" /> {post.commentsCount || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostComposer({ onPost, user, serverSlug }: { onPost: (content: string, imageUrl?: string) => void; user: User | null; serverSlug: string }) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="border border-border rounded-md p-4 bg-card">
        <p className="text-sm text-muted-foreground text-center">
          <Link href="/auth" className="text-primary hover:underline flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> Sign in to post
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setIsExpanded(true)}
        placeholder={`What would you like to share in #${serverSlug}?`}
        className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground min-h-[60px]"
        rows={isExpanded ? 4 : 2}
      />
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                <Hash className="w-3 h-3 inline" />{serverSlug}
              </span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-md font-medium disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Post
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [servers, setServers] = useState<Server[]>([{ id: 'default', slug: 'alcatelz', name: 'Alcatelz' }]);
  const [activeServer, setActiveServer] = useState('alcatelz');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { isSidebarOpen, isInspectorOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchData();
  }, [activeServer]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      console.error('Failed to fetch user:', e);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/feed?server=${activeServer}`);
      const data = await res.json();
      setPosts(data.posts || []);
      if (data.servers && data.servers.length > 0) {
        setServers(data.servers);
      }
    } catch (e) {
      console.error('Failed to fetch posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (content: string, imageUrl?: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl, serverSlug: activeServer }),
      });
      if (res.ok) {
        fetchData();
      } else if (res.status === 401) {
        router.push('/auth');
      }
    } catch (e) {
      console.error('Failed to post:', e);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      router.push('/auth');
      return;
    }
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'like' }),
      });
      fetchData();
    } catch (e) {
      console.error('Failed to like:', e);
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {isSidebarOpen && (
        <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
          <Sidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="flex-1 max-w-2xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6" />
                <div>
                  <h1 className="text-xl font-serif font-bold">Home</h1>
                  <p className="text-xs text-muted-foreground">Your personalized feed</p>
                </div>
              </div>
              {user && (
                <div className="text-sm text-muted-foreground">
                  @{user.username}
                </div>
              )}
            </div>

            {/* Server tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveServer('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeServer === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                All
              </button>
              {servers.map((server) => (
                <button
                  key={server.slug}
                  onClick={() => setActiveServer(server.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeServer === server.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  <Hash className="w-3 h-3" />{server.slug}
                </button>
              ))}
            </div>

            {/* Composer */}
            <PostComposer onPost={handlePost} user={user} serverSlug={activeServer} />

            {/* Feed */}
            <div className="space-y-3 mt-6">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="animate-pulse">Loading...</div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No posts{activeServer !== 'all' ? ` in #${activeServer}` : ''} yet.</p>
                  <p className="text-sm mt-1">Be the first to share!</p>
                </div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} />)
              )}
            </div>
          </div>
        </main>
        <BottomDock />
      </div>

      {isInspectorOpen && (
        <div className="w-80 flex-shrink-0 border-l border-border overflow-y-auto">
          <Inspector />
        </div>
      )}
    </div>
  );
}
