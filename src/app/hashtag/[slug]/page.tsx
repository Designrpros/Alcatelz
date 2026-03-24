"use client";

import { useState, useEffect } from "react";
import { SimpleMarkdown } from "@/components/simple-markdown";



import { useParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Heart, MessageCircle, Hash, ArrowLeft, Loader2, UserPlus, UserMinus } from "lucide-react";

interface UserType {
  id: string;
  username: string;
  name: string | null;
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

export default function HashtagPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const { isSidebarOpen, isInspectorOpen } = useUIStore();

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const [postsRes, userRes, followRes] = await Promise.all([
        fetch(`/api/hashtags/${encodeURIComponent(slug)}`),
        fetch('/api/auth/me'),
        fetch('/api/hashtags/follow')
      ]);

      const postsData = await postsRes.json();
      const userData = await userRes.json();
      const followData = await followRes.json();

      setPosts(postsData.posts || []);
      setUser(userData.user);
      
      if (userData.user && followData.hashtags) {
        setIsFollowing(followData.hashtags.some((h: { slug: string }) => h.slug === slug));
      }
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    
    setFollowingLoading(true);
    try {
      if (isFollowing) {
        await fetch(`/api/hashtags/follow?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
        setIsFollowing(false);
      } else {
        await fetch('/api/hashtags/follow', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serverSlug: slug })
        });
        setIsFollowing(true);
      }
    } catch (e) {
      console.error('Follow/unfollow failed:', e);
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'like' })
      });
      fetchData();
    } catch (e) {
      console.error('Like failed:', e);
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
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <Link href="/" className="p-2 rounded-full hover:bg-muted transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <Hash className="w-6 h-6 text-primary" />
                  <h1 className="text-xl font-serif font-bold">{slug}</h1>
                </div>
              </div>
              
              {user && (
                <button
                  onClick={handleFollow}
                  disabled={followingLoading}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                    isFollowing 
                      ? 'bg-muted text-foreground hover:bg-muted/80' 
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {followingLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" /> Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Follow
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Posts */}
            <div className="p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Hash className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No posts in #{slug} yet.</p>
                  <p className="text-sm mt-1">Be the first to post!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border border-border rounded-md p-4 bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{post.authorName || 'unknown'}</span>
                          <span className="text-xs text-muted-foreground">· {formatTimeAgo(post.createdAt)}</span>
                        </div>
                        <SimpleMarkdown content={post.content} />
                        {post.imageUrl && (
                          <div className="mt-3 rounded-md overflow-hidden border border-border">
                            <img src={post.imageUrl} alt="Post" className="max-h-64 w-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 cursor-pointer"
                          >
                            <Heart className="w-4 h-4" /> {post.likesCount || 0}
                          </button>
                          <Link 
                            href={`/post/${post.id}`}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-500"
                          >
                            <MessageCircle className="w-4 h-4" /> {post.commentsCount || 0}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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
