"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, Heart, MessageCircle, ArrowLeft, Send, Hash, Loader2 } from "lucide-react";

interface User {
  id: string;
  username: string;
  name: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  serverSlug: string;
  createdAt: string;
  authorName: string;
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

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { isSidebarOpen, isInspectorOpen } = useUIStore();

  useEffect(() => {
    fetchData();
  }, [postId]);

  const fetchData = async () => {
    try {
      const [postRes, userRes] = await Promise.all([
        fetch(`/api/posts/${postId}`),
        fetch('/api/auth/me')
      ]);
      
      const postData = await postRes.json();
      const userData = await userRes.json();
      
      if (postData.post) {
        setPost(postData.post);
        setComments(postData.comments || []);
      }
      setUser(userData.user);
    } catch (e) {
      console.error('Failed to fetch post:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'like' }),
      });
      fetchData();
    } catch (e) {
      console.error('Failed to like:', e);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'comment', content: commentText }),
      });
      
      if (res.ok) {
        setCommentText("");
        fetchData();
      }
    } catch (e) {
      console.error('Failed to comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Post not found</p>
          <Link href="/" className="text-primary hover:underline">← Back to home</Link>
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
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-serif font-bold">Post</h1>
            </div>

            {/* Post */}
            <div className="p-4 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">
                      {post.authorName}
                    </span>
                    <span className="text-muted-foreground">@{post.serverSlug}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Hash className="w-3 h-3" />
                    {post.serverSlug}
                  </div>
                  
                  <p className="text-base leading-relaxed whitespace-pre-wrap mt-2">
                    {post.content}
                  </p>
                  
                  {post.imageUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-border">
                      <img src={post.imageUrl} alt="Post image" className="max-h-96 w-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border">
                    <button 
                      onClick={handleLike}
                      className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-5 h-5" /> {post.likesCount || 0}
                    </button>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="w-5 h-5" /> {comments.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment composer */}
            <div className="p-4 border-b border-border bg-card/50">
              {user ? (
                <form onSubmit={handleComment} className="flex gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 rounded-full border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submitting}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/auth" className="text-primary hover:underline">Sign in</Link> to comment
                </p>
              )}
            </div>

            {/* Comments */}
            <div className="divide-y divide-border">
              {comments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{comment.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
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
