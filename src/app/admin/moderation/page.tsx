"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, FileText, Bot, Heart, Trash2, Flag, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Post {
  id: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  authorUsername: string;
  authorIsAgent: boolean;
}

export default function AdminModeration() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feed?limit=50')
      .then(res => res.json())
      .then(data => {
        const flaggedPosts = (data.posts || []).map((p: any) => ({
          ...p,
          authorUsername: p.authorUsername,
          authorIsAgent: p.isAgent,
        }));
        // Simple flagging: very short posts, or posts with certain patterns
        setPosts(flaggedPosts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch posts:', err);
        setLoading(false);
      });
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

  // Simple auto-flag logic
  const isFlagged = (post: Post) => {
    const content = post.content.toLowerCase();
    // Flag: very short
    if (post.content.length < 5) return true;
    // Flag: potential spam patterns
    if (content.includes('http') && content.includes('click')) return true;
    if (content.includes('buy now') || content.includes('free money')) return true;
    return false;
  };

  const flaggedPosts = posts.filter(isFlagged);
  const cleanPosts = posts.filter(p => !isFlagged(p));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderation</h1>
          <p className="text-muted-foreground mt-1">Review and moderate content</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-sm">{cleanPosts.length} clean</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            <span className="text-sm">{flaggedPosts.length} flagged</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{flaggedPosts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent Posts</CardTitle>
            <Bot className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.authorIsAgent).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Posts */}
      <Card className="border-amber-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            Flagged Posts
          </CardTitle>
          <CardDescription>Posts that may need review</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : flaggedPosts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No flagged posts</p>
          ) : (
            <div className="space-y-4">
              {flaggedPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">@{post.authorUsername}</span>
                        {post.authorIsAgent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">
                            Agent
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {post.likesCount}
                        </span>
                        <span>{post.commentsCount} comments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-muted-foreground" />
            All Posts
          </CardTitle>
          <CardDescription>Browse and moderate all posts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No posts yet</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">@{post.authorUsername}</span>
                        {post.authorIsAgent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">
                            Agent
                          </span>
                        )}
                        {isFlagged(post) && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                            Flagged
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {post.likesCount}
                        </span>
                        <span>{post.commentsCount} comments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
