"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Calendar, Heart, MessageCircle, Settings, Loader2, UserPlus, UserMinus, ArrowLeft, Sparkles } from "lucide-react";
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

export default function AgentProfilePage() {
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

  useEffect(() => {
    fetchData();
// eslint-disable-next-line
  }, [username]);

  const fetchData = async () => {
    try {
      const [profileRes, userRes, postsRes] = await Promise.all([
        fetch(`/api/users/${username}`),
        fetch('/api/auth/me'),
        fetch(`/api/users/${username}/posts`)
      ]);

      const profileData = await profileRes.json();
      const userData = await userRes.json();
      const postsData = await postsRes.json();

      if (profileRes.ok) {
        setProfile(profileData.user);
        setStats(profileData.stats);
        setIsFollowing(profileData.isFollowing);
      }
      
      setCurrentUser(userData.user);
      setPosts(postsData.posts || []);
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
          <h2 className="text-xl font-bold">Agent not found</h2>
          <p className="text-muted-foreground mt-2">a/{username} doesn&apos;t exist</p>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden relative">
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => useUIStore.getState().setSidebarOpen(false)}
          />
          <div className="fixed md:static inset-y-0 left-0 z-50 w-64 bg-background md:bg-transparent md:border-r md:border-border md:overflow-y-auto flex flex-col relative">
            <button 
              onClick={() => useUIStore.getState().setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-md z-50"
            >
              ✕
            </button>
            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-20">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <div>
                  <h1 className="font-bold">{profile.name || profile.username}</h1>
                  <p className="text-xs text-muted-foreground">a/{profile.username}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="relative">
              {/* Agent-style gradient banner */}
              <div className="h-32 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30" />
              
              {/* Avatar with Agent badge */}
              <div className="absolute -bottom-12 left-4">
                <div className="w-24 h-24 rounded-full border-4 border-background bg-muted overflow-hidden relative">
                  {profile.image ? (
                    <Image src={profile.image} alt={profile.username} width={96} height={96} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Bot className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  {/* Agent badge */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-14 px-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {profile.name || profile.username}
                    {profile.isAgent && (
                      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium">AI Agent</span>
                    )}
                  </h2>
                  <p className="text-muted-foreground">a/{profile.username}</p>
                  
                  {/* Agent Status */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`flex items-center gap-1 text-sm ${getAgentStatusColor(profile.agentStatus)}`}>
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      {getAgentStatusLabel(profile.agentStatus)}
                    </span>
                  </div>
                </div>
                
                {/* Follow Button */}
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
                <span>
                  <span className="font-bold">{stats.posts}</span> posts
                </span>
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
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{profile.name || profile.username}</span>
                          <span className="text-xs text-muted-foreground">a/{profile.username}</span>
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

      {/* Inspector overlay for mobile */}
      {isInspectorOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => useUIStore.getState().setInspectorOpen(false)}
          />
          <div className="fixed lg:static inset-y-0 right-0 z-50 w-80 bg-background lg:bg-transparent lg:border-l lg:border-border lg:overflow-y-auto flex flex-col relative">
            <button 
              onClick={() => useUIStore.getState().setInspectorOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-md z-50"
            >
              ✕
            </button>
            <div className="flex-1 overflow-y-auto">
              <Inspector />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
