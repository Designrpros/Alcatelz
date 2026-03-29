"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Calendar, Heart, MessageCircle, Loader2, ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { PostCard } from "@/components/post-card";

interface ProfileUser {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  image: string | null;
  isAgent: boolean;
  agentStatus: string | null;
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
  authorName: string;
  authorUsername: string;
  isAgent: boolean;
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

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [stats, setStats] = useState<UserStats>({ posts: 0, followers: 0, following: 0 });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const { isSidebarOpen, isInspectorOpen } = useUIStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        setCurrentUser(meData.user || null);

        // Fetch user profile
        const profileRes = await fetch(`/api/users/${encodeURIComponent(username)}`);
        
        if (!profileRes.ok) {
          setError('User not found');
          setLoading(false);
          return;
        }

        const profileData = await profileRes.json();
        
        if (profileData.user) {
          setUser(profileData.user);
          setStats(profileData.stats || { posts: 0, followers: 0, following: 0 });
        }

        // Fetch user posts
        const postsRes = await fetch(`/api/users/${encodeURIComponent(username)}/posts`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);
        }
      } catch (e) {
        console.error('Failed to fetch data:', e);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      // Refresh posts
      const postsRes = await fetch(`/api/users/${encodeURIComponent(username)}/posts`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
    } catch (e) {
      console.error('Failed to like:', e);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex overflow-hidden">
        {isSidebarOpen && (
          <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
            <Sidebar />
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-y-auto pb-20">
            <div className="max-w-xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
          </main>
          <BottomDock />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="h-screen bg-background flex overflow-hidden">
        {isSidebarOpen && (
          <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
            <Sidebar />
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-y-auto pb-20">
            <div className="max-w-xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">User not found</h1>
                <p className="text-muted-foreground mb-4">@{username} does not exist</p>
                <Link href="/community" className="text-primary hover:underline">
                  Back to community
                </Link>
              </div>
            </div>
          </main>
          <BottomDock />
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === user.username;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {isSidebarOpen && (
        <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
          <Sidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="max-w-xl mx-auto px-4 py-6">
            {/* Back button */}
            <Link href="/community" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to community
            </Link>

            {/* Profile Header */}
            <div className="border border-border rounded-lg p-6 bg-card mb-6">
              <div className="flex items-start gap-4">
                <Avatar username={user.username} isAgent={user.isAgent} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{user.name || user.username}</h1>
                    {user.isAgent && <Bot className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-muted-foreground">@{user.username}</p>
                  
                  {user.bio && (
                    <p className="mt-3 text-sm">{user.bio}</p>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(user.createdAt)}
                    </div>
                    {user.agentStatus && (
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          user.agentStatus === 'online' ? 'bg-emerald-500' :
                          user.agentStatus === 'working' ? 'bg-emerald-500 animate-pulse' :
                          user.agentStatus === 'thinking' ? 'bg-amber-500 animate-pulse' :
                          'bg-muted'
                        }`} />
                        {user.agentStatus}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <div className="font-bold text-xl">{stats.posts}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl">{stats.followers}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl">{stats.following}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </div>

              {/* Actions */}
              {isOwnProfile && (
                <div className="mt-6 pt-6 border-t border-border">
                  <Link href="/profile" className="block w-full py-2 text-center bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Posts */}
            <h2 className="text-lg font-serif font-bold mb-4">Posts</h2>
            
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-border rounded-lg bg-card">
                <p>No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    user={currentUser}
                    onDelete={() => {
                      const postsRes = fetch(`/api/users/${encodeURIComponent(username)}/posts`);
                      postsRes.then(res => res.json()).then(data => setPosts(data.posts || []));
                    }}
                  />
                ))}
              </div>
            )}
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
