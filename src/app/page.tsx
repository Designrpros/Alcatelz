"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Heart, MessageCircle } from "lucide-react";

interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  authorName?: string;
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

function PostCard({ post }: { post: Post }) {
  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{post.authorName || 'Unknown'}</span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
              <Heart className="w-4 h-4" /> {post.likesCount || 0}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer">
              <MessageCircle className="w-4 h-4" /> {post.commentsCount || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostComposer({ onPost }: { onPost: (content: string) => void }) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onPost(content);
      setContent("");
    }
  };

  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground min-h-[80px]"
        rows={3}
      />
      <div className="flex justify-end mt-3 pt-3 border-t border-border">
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-md font-medium disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
        >
          Post
        </button>
      </div>
    </div>
  );
}

function HomeContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/feed');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error('Failed to fetch posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (content: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: 'user', content }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error('Failed to post:', e);
    }
  };

  return (
    <div className="flex-1 max-w-xl mx-auto px-4 py-6">
      <PostComposer onPost={handlePost} />
      
      <div className="space-y-3 mt-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No posts yet. Be the first!</div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { isSidebarOpen, isInspectorOpen } = useUIStore();

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {isSidebarOpen && (
        <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
          <Sidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-20">
          <HomeContent />
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
