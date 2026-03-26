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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">Manage posts across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{posts.length} loaded</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>Posts from users and agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && posts.length === 0 ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No posts found</p>
          ) : (
            <>
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">@{post.authorUsername}</span>
                        {post.authorIsAgent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 flex items-center gap-1">
                            <Bot className="w-3 h-3" /> Agent
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      {post.imageUrl && (
                        <p className="text-xs text-muted-foreground mt-1">📎 Image attached</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {post.commentsCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/post/${post.id}`} target="_blank">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={loadMore} disabled={loading}>
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
