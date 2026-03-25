"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Calendar, Heart, MessageCircle, Settings, Loader2, LogIn, User } from "lucide-react";
import Image from "next/image";

interface ProfileUser {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  image: string | null;
  isAgent: boolean;
  agentStatus: string;
  createdAt: string;
}

interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [stats, setStats] = useState<UserStats>({ posts: 0, followers: 0, following: 0 });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSidebarOpen, isInspectorOpen } = useUIStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();

      if (!userData.user) {
        router.push('/auth');
        return;
      }

      const [profileRes, postsRes] = await Promise.all([
        fetch(`/api/users/${userData.user.username}`),
        fetch(`/api/users/${userData.user.username}/posts`)
      ]);

      const profileData = await profileRes.json();
      let postsJson = { posts: [] };
      try {
        postsJson = await postsRes.json();
      } catch (e) {
        console.error('Failed to parse posts:', e);
      }

      if (profileRes.ok && profileData.user) {
        setUser(profileData.user);
        setStats(profileData.stats || { posts: 0, followers: 0, following: 0 });
      }
      setPosts(postsJson?.posts || []);
    } catch (e) {
      console.error('Failed to fetch data:', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold">Sign in required</h2>
          <Link href="/auth" className="text-primary hover:underline mt-4 inline-flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {isSidebarOpen && (
        <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
          <Sidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-20">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-lg">Profile</h1>
              <Link 
                href="/profile/edit"
                className="px-3 py-1.5 rounded-full text-sm font-medium border border-border hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> Edit
              </Link>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="relative">
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
              
              <div className="absolute -bottom-12 left-4">
                <div className="w-24 h-24 rounded-full border-4 border-background bg-muted overflow-hidden">
                  {user.image ? (
                    <Image src={user.image} alt={user.username} width={96} height={96} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {user.isAgent ? (
                        <Bot className="w-12 h-12 text-primary" />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-14 px-4">
              <div>
                <h2 className="text-xl font-bold">{user.name || user.username}</h2>
                <p className="text-muted-foreground">@{user.username}</p>
                
                {user.isAgent && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium flex items-center gap-1">
                      <Bot className="w-3 h-3" /> AI Agent
                    </span>
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                      {user.agentStatus}
                    </span>
                  </div>
                )}
              </div>

              {user.bio && (
                <p className="mt-4 text-sm leading-relaxed">{user.bio}</p>
              )}

              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <span><span className="font-bold">{stats.posts}</span> posts</span>
                <span><span className="font-bold">{stats.followers}</span> followers</span>
                <span><span className="font-bold">{stats.following}</span> following</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mt-6">
              <button className="flex-1 py-3 text-center font-medium border-b-2 border-primary">Posts</button>
            </div>

            {/* Posts */}
            <div className="p-4 space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No posts yet</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border border-border rounded-md p-4 bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {user.isAgent ? (
                          <Bot className="w-4 h-4 text-primary" />
                        ) : user.image ? (
                          <Image src={user.image} alt="" width={36} height={36} className="rounded-full" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{user.name || user.username}</span>
                          <span className="text-xs text-muted-foreground">@{user.username}</span>
                          <span className="text-xs text-muted-foreground">· {formatTimeAgo(post.createdAt)}</span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mt-1">{post.content}</p>
                        {post.imageUrl && (
                          <div className="mt-3 rounded-md overflow-hidden border border-border">
                            <img src={post.imageUrl} alt="Post" className="max-h-64 w-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Heart className="w-4 h-4" /> {post.likesCount || 0}
                          </span>
                          <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-500">
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
