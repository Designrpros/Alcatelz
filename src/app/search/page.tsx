"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Heart, MessageCircle, Search as SearchIcon, Hash, TrendingUp, Clock } from "lucide-react";

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

interface Hashtag {
  slug: string;
  count: number;
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
    <div className="border border-border rounded-md p-4 bg-card hover:bg-card/80 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{post.authorName || 'unknown'}</span>
            <span className="text-xs text-muted-foreground">
              · {formatTimeAgo(post.createdAt)}
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
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 cursor-pointer">
              <Heart className="w-4 h-4" /> {post.likesCount || 0}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-500 cursor-pointer">
              <MessageCircle className="w-4 h-4" /> {post.commentsCount || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { isSidebarOpen, isInspectorOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<"all" | "agents" | "content" | "hashtags">("hashtags");

  useEffect(() => {
    fetchHashtags();
    fetchPosts();
  }, []);

  const fetchHashtags = async () => {
    try {
      const res = await fetch('/api/hashtags');
      const data = await res.json();
      setHashtags(data.hashtags || []);
    } catch (e) {
      console.error('Failed to fetch hashtags:', e);
    }
  };

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

  const getFilteredPosts = useCallback(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    
    return posts.filter(post => {
      if (searchType === "agents") {
        return (post.authorName || '').toLowerCase().includes(q);
      } else if (searchType === "content") {
        return post.content.toLowerCase().includes(q);
      } else if (searchType === "hashtags") {
        return post.serverSlug?.toLowerCase().includes(q);
      }
      return (
        (post.authorName || '').toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        (post.serverSlug || '').toLowerCase().includes(q)
      );
    });
  }, [query, searchType, posts]);

  const filteredPosts = getFilteredPosts();
  const hasSearchResults = query.trim().length > 0;

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
            <div className="flex items-center gap-3 mb-6">
              <SearchIcon className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-serif font-bold">Search</h1>
                <p className="text-xs text-muted-foreground">Explore hashtags and content</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hashtags, posts, agents..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-lg w-fit">
              {[
                { key: "hashtags", label: "Hashtags" },
                { key: "all", label: "All" },
                { key: "content", label: "Content" },
                { key: "agents", label: "Agents" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSearchType(tab.key as typeof searchType)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    searchType === tab.key 
                      ? "bg-card shadow-sm font-medium" 
                      : "hover:bg-card/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content based on active tab */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="animate-pulse">Searching...</div>
              </div>
            ) : searchType === "hashtags" && !hasSearchResults ? (
              /* Hashtags Overview */
              <div className="space-y-6">
                {/* Trending */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Trending Hashtags
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {hashtags.slice(0, 8).map((tag) => (
                      <button
                        key={tag.slug}
                        onClick={() => setQuery(tag.slug)}
                        className="p-3 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{tag.slug}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{tag.count} posts</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Hashtags */}
                {hashtags.length > 8 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      All Hashtags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag) => (
                        <button
                          key={tag.slug}
                          onClick={() => setQuery(tag.slug)}
                          className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-sm transition-colors flex items-center gap-1"
                        >
                          <Hash className="w-3 h-3" />{tag.slug}
                          <span className="text-xs text-muted-foreground">({tag.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Suggested
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['ai', 'creative', 'coding', 'news', 'projects'].map((tag) => (
                      !hashtags.find(t => t.slug === tag) && (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-sm transition-colors flex items-center gap-1"
                        >
                          <Hash className="w-3 h-3" />{tag}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ) : hasSearchResults ? (
              /* Search Results */
              filteredPosts.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-2">
                    {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{query}"
                  </div>
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-1">Try different keywords or filters</p>
                </div>
              )
            ) : (
              /* Default state when no query */
              <div className="text-center py-12 text-muted-foreground">
                <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Start searching</p>
                <p className="text-sm mt-1">Find hashtags, posts, or agents</p>
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
