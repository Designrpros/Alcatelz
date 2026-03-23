"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { CreateServerModal } from "@/components/create-server-modal";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Heart, MessageCircle, Image as ImageIcon, Send, Globe, Hash, Upload, LogIn, Plus, Search as SearchIcon } from "lucide-react";

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
  authorUsername?: string;
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

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [servers, setServers] = useState<Server[]>([
    { id: 'alcatelz', slug: 'alcatelz', name: 'Alcatelz' },
    { id: 'ai', slug: 'ai', name: 'AI' },
    { id: 'creative', slug: 'creative', name: 'Creative' },
    { id: 'coding', slug: 'coding', name: 'Coding' },
    { id: 'news', slug: 'news', name: 'News' },
  ]);
  const [activeServer, setActiveServer] = useState('all');
  const [feedFilter, setFeedFilter] = useState<'all' | 'hot' | 'trending'>('all');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showHashtagSearch, setShowHashtagSearch] = useState(false);
  const [hashtagSearch, setHashtagSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ slug: string; count: number }[]>([]);
  const { isSidebarOpen, isInspectorOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchData();
  }, [activeServer]);

  // Search hashtags when typing
  useEffect(() => {
    if (hashtagSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/hashtags?q=${encodeURIComponent(hashtagSearch)}`);
        const data = await res.json();
        setSearchResults(data.hashtags || []);
      } catch (e) {
        console.error('Failed to search hashtags:', e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [hashtagSearch]);

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
      const serverParam = activeServer === 'all' ? '' : `server=${activeServer}`;
      const res = await fetch(`/api/feed?${serverParam}`);
      const jsonData = await res.json();
      let allPosts = jsonData.posts || [];

      // Apply feed filter
      if (feedFilter === 'hot') {
        // Hot: mix of recent and popular (likes + comments)
        allPosts = allPosts.sort((a: Post, b: Post) => {
          const scoreA = (a.likesCount || 0) + (a.commentsCount || 0) * 2;
          const scoreB = (b.likesCount || 0) + (b.commentsCount || 0) * 2;
          return scoreB - scoreA;
        });
      } else if (feedFilter === 'trending') {
        // Trending: posts from last 24h with most engagement
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        allPosts = allPosts.filter((p: Post) => new Date(p.createdAt).getTime() > oneDayAgo);
        allPosts = allPosts.sort((a: Post, b: Post) => {
          const scoreA = (a.likesCount || 0) + (a.commentsCount || 0) * 2;
          const scoreB = (b.likesCount || 0) + (b.commentsCount || 0) * 2;
          return scoreB - scoreA;
        });
      }
      // 'all' - keep chronological order

      setPosts(allPosts);
      // Merge API servers with defaults, don't overwrite
      if (jsonData.servers && jsonData.servers.length > 0) {
        setServers(prev => {
          const existingSlugs = new Set(prev.map(s => s.slug));
          const newServers = jsonData.servers.filter((s: Server) => !existingSlugs.has(s.slug));
          return [...prev, ...newServers];
        });
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
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      fetchData();
    } catch (e) {
      console.error('Failed to like:', e);
    }
  };

  const handleServerCreated = (server: { slug: string; name: string }) => {
    const newServer = { ...server, id: server.slug };
    setServers([...servers, newServer]);
    setActiveServer(server.slug);
    fetchData();
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

            {/* Feed filter */}
            <div className="flex gap-1 mb-4 p-1 bg-muted/50 rounded-lg w-fit">
              {[
                { key: "all", label: "All" },
                { key: "hot", label: "🔥 Hot" },
                { key: "trending", label: "📈 Trending" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFeedFilter(filter.key as typeof feedFilter)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${feedFilter === filter.key
                      ? "bg-card shadow-sm font-medium"
                      : "hover:bg-card/50"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Server tabs */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 items-center">
                <button
                  onClick={() => setShowHashtagSearch(!showHashtagSearch)}
                  className={`px-2.5 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${showHashtagSearch ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  title="Search hashtags"
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveServer('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeServer === 'all'
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
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${activeServer === server.slug
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                  >
                    <Hash className="w-3 h-3" />{server.slug}
                  </button>
                ))}
                {user && (
                  <button
                    onClick={() => setShowCreateServer(true)}
                    className="px-2.5 py-1.5 rounded-full text-sm font-medium bg-muted hover:bg-muted/80 text-muted-foreground transition-colors flex-shrink-0"
                    title="Create new hashtag"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Hashtag search dropdown */}
              {showHashtagSearch && (
                <div className="mt-2 relative">
                  <input
                    type="text"
                    value={hashtagSearch}
                    onChange={(e) => setHashtagSearch(e.target.value)}
                    placeholder="Search hashtags..."
                    autoFocus
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {hashtagSearch.length > 0 && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                      {searchResults.length > 0 ? (
                        searchResults.slice(0, 8).map((tag) => (
                          <button
                            key={tag.slug}
                            onClick={() => {
                              setActiveServer(tag.slug);
                              setHashtagSearch("");
                              setShowHashtagSearch(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-primary" />{tag.slug}
                            </span>
                            <span className="text-xs text-muted-foreground">{tag.count} posts</span>
                          </button>
                        ))
                      ) : hashtagSearch.length > 1 ? (
                        <div className="p-3">
                          <p className="text-sm text-muted-foreground mb-2">No hashtag found for "#{hashtagSearch}"</p>
                          <button
                            onClick={() => {
                              setShowCreateServer(true);
                              setHashtagSearch("");
                              setShowHashtagSearch(false);
                            }}
                            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Create #{hashtagSearch}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
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
                posts.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} user={user} onDelete={fetchData} />)
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

      {showCreateServer && (
        <CreateServerModal
          onClose={() => setShowCreateServer(false)}
          onCreated={handleServerCreated}
        />
      )}
    </div>
  );
}
