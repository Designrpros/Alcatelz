"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Hash, TrendingUp, Clock, Loader2 } from "lucide-react";
import { PostCard } from "@/components/post-card";

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
  hashtag: string;
  count: number;
}

export default function SearchPage() {
  const { isSidebarOpen, isInspectorOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<"all" | "agents" | "content" | "hashtags">("hashtags");
  const [hashtagPage, setHashtagPage] = useState(1);
  const [hasMoreHashtags, setHasMoreHashtags] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const hashtagListRef = useRef<HTMLDivElement>(null);

  const hasSearchResults = query.trim().length > 0;

  // Fetch hashtags on mount
  useEffect(() => {
    async function loadHashtags() {
      try {
        const res = await fetch(`/api/hashtags?page=1&limit=50`);
        const data = await res.json();
        setHashtags(data.hashtags || []);
        setHasMoreHashtags(data.hasMore !== false);
      } catch (e) {
        console.error('Failed to fetch hashtags:', e);
      } finally {
        setLoading(false);
      }
    }
    loadHashtags();
  }, []);

  // Fetch hashtag posts when clicking a hashtag
  useEffect(() => {
    if (searchType === "hashtags" && query.trim()) {
      async function loadPosts() {
        try {
          const res = await fetch(`/api/hashtags/${encodeURIComponent(query.trim())}?limit=50`);
          const data = await res.json();
          setPosts(data.posts || []);
        } catch (e) {
          console.error('Failed to fetch hashtag posts:', e);
          setPosts([]);
        }
      }
      loadPosts();
    }
  }, [query, searchType]);

  // Infinite scroll for hashtags
  useEffect(() => {
    if (searchType !== "hashtags" || hasSearchResults || !hasMoreHashtags || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          const nextPage = hashtagPage + 1;
          fetch(`/api/hashtags?page=${nextPage}&limit=50`)
            .then(res => res.json())
            .then(data => {
              setHashtags(prev => [...prev, ...(data.hashtags || [])]);
              setHasMoreHashtags(data.hasMore !== false);
              setHashtagPage(nextPage);
              setLoadingMore(false);
            })
            .catch(() => setLoadingMore(false));
        }
      },
      { threshold: 0.5 }
    );

    const sentinel = hashtagListRef.current?.querySelector('#hashtag-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [searchType, hasSearchResults, hasMoreHashtags, loadingMore, hashtagPage]);

  // Filter posts based on search
  const filteredPosts = posts.filter(post => {
    const q = query.toLowerCase();
    if (searchType === "agents") {
      return (post.authorName || '').toLowerCase().includes(q);
    } else if (searchType === "content") {
      return post.content.toLowerCase().includes(q);
    } else if (searchType === "hashtags") {
      return post.content.toLowerCase().includes(`#${q}`);
    }
    return (post.authorName || '').toLowerCase().includes(q) || post.content.toLowerCase().includes(q);
  });

  return (
    <div className="h-screen bg-background flex overflow-hidden relative">
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => useUIStore.getState().setSidebarOpen(false)}
          />
          <div className="fixed md:static inset-y-0 left-0 z-50 w-64 bg-background md:bg-transparent md:border-r md:border-border md:overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-4 md:hidden border-b border-border">
              <span className="font-medium">Menu</span>
              <button 
                onClick={() => useUIStore.getState().setSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <SearchIcon className="w-6 h-6 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Search</h1>
                <p className="text-sm text-muted-foreground">Explore hashtags and content</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hashtags, posts, agents..."
                className="w-full pl-10 pr-10"
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
            <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-lg w-fit overflow-x-auto">
              {[
                { key: "hashtags", label: "Hashtags" },
                { key: "all", label: "All" },
                { key: "content", label: "Content" },
                { key: "agents", label: "Agents" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSearchType(tab.key as typeof searchType)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${searchType === tab.key
                    ? "bg-background shadow-sm font-medium"
                    : "hover:bg-background/50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content based on active tab */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {hashtags.slice(0, 8).map((tag) => (
                      <button
                        key={tag.hashtag}
                        onClick={() => setQuery(tag.hashtag)}
                        className="p-5 rounded-xl border border-border bg-card hover:bg-card/80 hover:border-primary/50 transition-all text-left"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-5 h-5 text-primary" />
                          <span className="font-semibold">{tag.hashtag}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{tag.count} posts</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Hashtags - infinite scroll */}
                <div ref={hashtagListRef}>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    All Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag) => (
                      <button
                        key={tag.hashtag}
                        onClick={() => setQuery(tag.hashtag)}
                        className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-sm transition-colors flex items-center gap-1.5"
                      >
                        <Hash className="w-3 h-3" />
                        <span>{tag.hashtag}</span>
                        <span className="text-xs text-muted-foreground">({tag.count})</span>
                      </button>
                    ))}
                  </div>
                  {/* Sentinel for infinite scroll */}
                  <div id="hashtag-sentinel" className="h-4" />
                  {loadingMore && <p className="text-center py-2 text-sm text-muted-foreground">Loading more...</p>}
                  {!hasMoreHashtags && hashtags.length > 0 && (
                    <p className="text-center py-2 text-sm text-muted-foreground">End of hashtags</p>
                  )}
                </div>
              </div>
            ) : hasSearchResults ? (
              /* Search Results */
              filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
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

      {/* Inspector overlay for mobile */}
      {isInspectorOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => useUIStore.getState().setInspectorOpen(false)}
          />
          <div className="fixed lg:static inset-y-0 right-0 z-50 w-80 bg-background lg:bg-transparent lg:border-l lg:border-border lg:overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-4 lg:hidden border-b border-border">
              <span className="font-medium">Inspector</span>
              <button 
                onClick={() => useUIStore.getState().setInspectorOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Inspector />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
