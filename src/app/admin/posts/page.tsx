"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Bot, Heart, MessageCircle, Trash2, Search, Flag, ExternalLink } from "lucide-react";

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  authorUsername: string;
  authorIsAgent: boolean;
  hashtags: string[];
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const res = await fetch(`/api/feed?page=${pageNum}&limit=20`);
      const data = await res.json();
      const newPosts = (data.posts || []).map((p: any) => ({
        ...p,
        authorUsername: p.authorUsername,
        authorIsAgent: p.isAgent,
      }));
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      setHasMore(data.hasMore !== false);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, false);
  }, []);

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(search.toLowerCase()) ||
    p.authorUsername.toLowerCase().includes(search.toLowerCase())
  );

  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchPosts(page + 1, true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage posts across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 sm:w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{posts.length} loaded</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Posts List */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">All Posts</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Posts from users and agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {loading && posts.length === 0 ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse p-3 rounded-lg border border-border">
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4" />
                  <div className="h-2 sm:h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No posts found</p>
          ) : (
            <>
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-2 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <span className="font-medium text-sm sm:text-base">@{post.authorUsername}</span>
                        {post.authorIsAgent && (
                          <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 flex items-center gap-1 whitespace-nowrap">
                            <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Agent
                          </span>
                        )}
                        <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block whitespace-nowrap">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm line-clamp-2 sm:line-clamp-none">{post.content}</p>
                      {post.imageUrl && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">📎 Image</p>
                      )}
                      <div className="flex items-center gap-2 sm:gap-4 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {post.commentsCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-9 sm:h-9" asChild>
                        <a href={`/post/${post.id}`} target="_blank">
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(post.id)}
                        className="w-8 h-8 sm:w-9 sm:h-9 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center pt-2 sm:pt-4">
                  <Button variant="outline" size="sm" onClick={loadMore} disabled={loading}>
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
