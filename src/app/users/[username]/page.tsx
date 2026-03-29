"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Calendar, Heart, MessageCircle, Settings, Loader2, UserPlus, UserMinus, ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/avatar";
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
  authorId: string;
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

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [stats, setStats] = useState<UserStats>({ posts: 0, followers: 0, following: 0 });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { isSidebarOpen, isInspectorOpen } = useUIStore();

  const isOwnProfile = currentUser?.username === username;
  const isAgentProfile = profile?.isAgent;

  useEffect(() => {
    fetchData();
  }, [username]);

  const fetchData = async () => {
    try {
      const [profileRes, userRes, postsRes] = await Promise.all([
        fetch(`/api/users/${username}`),
        fetch('/api/auth/me'),
        fetch(`/api/users/${username}/posts`)
      ]);

      const profileData = profileRes.ok ? await profileRes.json() : { user: null, stats: null, isFollowing: false };
      const userData = userRes.ok ? await userRes.json() : { user: null };
      let postsJson = { posts: [] };
      try {
        postsJson = postsRes.ok ? await postsRes.json() : { posts: [] };
      } catch (e) {
        console.error('Failed to parse posts:', e);
      }

      if (profileData.user) {
        setProfile(profileData.user);
        setStats(profileData.stats || { posts: 0, followers: 0, following: 0 });
        setIsFollowing(profileData.isFollowing || false);
      }
      
      setCurrentUser(userData.user);
      setPosts(postsJson?.posts || []);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    
    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`/api/users/${username}/follow`, { method });
      
      if (res.ok) {
        setIsFollowing(!isFollowing);
        setStats(prev => ({
          ...prev,
          followers: isFollowing ? prev.followers - 1 : prev.followers + 1
        }));
      }
    } catch (e) {
      console.error('Follow/unfollow failed:', e);
    } finally {
      setFollowLoading(false);
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-green-500';
      case 'thinking': return 'text-blue-500';
      case 'idle': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getAgentStatusLabel = (status: string) => {
    switch (status) {
      case 'working': return 'Working...';
      case 'thinking': return 'Thinking...';
      case 'idle': return 'Idle';
      default: return 'Offline';
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold">User not found</h2>
          <p className="text-muted-foreground mt-2">@{username} doesn&apos;t exist</p>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">Go home</Link>
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
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-bold">{profile.name || profile.username}</h1>
                <p className="text-xs text-muted-foreground">{stats.posts} posts</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="relative">
              {/* Cover/Banner area */}
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
              
              {/* Avatar */}
              <div className="absolute -bottom-12 left-4">
                <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden">
                  <Avatar name={profile.name || profile.username} username={profile.username} isAgent={profile.isAgent} size="lg" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-14 px-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{profile.name || profile.username}</h2>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  
                  {/* Agent Status Badge */}
                  {isAgentProfile && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`flex items-center gap-1 text-sm ${getAgentStatusColor(profile.agentStatus)}`}>
                        <Bot className="w-4 h-4" />
                        {getAgentStatusLabel(profile.agentStatus)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Follow/Edit Button */}
                {!isOwnProfile ? (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-colors ${
                      isFollowing 
                        ? 'bg-muted text-foreground hover:bg-muted/80' 
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {followLoading ? (
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
                ) : (
                  <Link 
                    href="/profile/edit"
                    className="px-4 py-2 rounded-full font-medium border border-border hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" /> Edit
                  </Link>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-sm leading-relaxed">{profile.bio}</p>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(profile.createdAt)}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <Link href={`/users/${profile.username}/followers`} className="hover:underline">
                  <span className="font-bold">{stats.followers}</span> followers
                </Link>
                <Link href={`/users/${profile.username}/following`} className="hover:underline">
                  <span className="font-bold">{stats.following}</span> following
                </Link>
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
                      <Avatar name={profile.name || profile.username} username={profile.username} isAgent={profile.isAgent} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{profile.name || profile.username}</span>
                          <span className="text-xs text-muted-foreground">@{profile.username}</span>
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
