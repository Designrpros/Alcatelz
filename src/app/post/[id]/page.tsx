"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, MessageCircle, Pencil, Trash2, ArrowLeft, MoreHorizontal } from "lucide-react";
import { SimpleMarkdown } from "@/components/simple-markdown";
import { Avatar } from "@/components/avatar";

interface User {
  id: string;
  username: string;
  name: string | null;
  role?: string;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  liked?: boolean;
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
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetchPost();
    fetchUser();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const res = await fetch("/api/posts/" + params.id);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post || data);
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to fetch post:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch("/api/posts/" + params.id + "/like", { method: "POST" });
      if (res.ok) {
        fetchPost();
      }
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch("/api/posts/" + params.id + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, parentId: replyTo?.id })
      });
      if (res.ok) {
        setNewComment("");
        setReplyTo(null);
        fetchPost();
      }
    } catch (err) {
      console.error("Failed to comment:", err);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || !post) return;
    try {
      const res = await fetch("/api/posts/" + post.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.post) setPost(data.post as Post);
        setEditing(false);
      }
    } catch (err) {
      console.error("Failed to edit:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch("/api/posts/" + params.id, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
        <button onClick={() => router.push("/")} className="mt-4 text-primary hover:underline">
          Back to home
        </button>
      </div>
    );
  }

  const isOwner = user?.id === post.authorId;
  const canEdit = isOwner || user?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.push("/")} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Post</h1>
          {canEdit && !editing && (
            <div className="relative ml-auto">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-muted transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-card border rounded-md shadow-lg z-50 min-w-[140px]">
                  <button
                    onClick={() => { setEditContent(post.content); setEditing(true); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-muted"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => { handleDelete(); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-muted"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Post Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <article className="border border-border rounded-lg p-4 bg-card">
          {/* Author */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar name={post.authorName || '?'} username={post.authorUsername} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{post.authorName}</span>
                <span className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          {editing ? (
            <div className="mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 bg-muted rounded-md resize-none border"
                rows={5}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditing(false); setEditContent(post.content); }}
                  className="px-4 py-2 bg-muted rounded-md hover:bg-muted/80"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <SimpleMarkdown content={post.content} />
            </div>
          )}

          {/* Image */}
          {post.imageUrl && (
            <div className="mt-3 rounded-md overflow-hidden border border-border">
              <img src={post.imageUrl} alt="Post" className="max-h-64 w-full object-cover" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
            >
              <Heart className={`w-5 h-5 ${post.liked ? "fill-current" : ""}`} />
              <span>{post.likesCount || 0}</span>
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentsCount || 0}</span>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="font-semibold mb-4">Comments</h2>

          {/* New Comment */}
          {user && (
            <div className="mb-6 border border-border rounded-lg p-4 bg-card">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground min-h-[60px]"
                rows={2}
              />
              {replyTo && (
                <p className="text-sm text-muted-foreground mt-2">
                  Replying to @{replyTo.authorUsername}{" "}
                  <button onClick={() => setReplyTo(null)} className="text-primary hover:underline">
                    Cancel
                  </button>
                </p>
              )}
              <div className="flex justify-end mt-3 pt-3 border-t border-border">
                <button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-md font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  Comment
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} onReply={setReplyTo} />
            ))}
          </div>

          {comments.length === 0 && (
            <p className="text-center py-8 text-muted-foreground text-sm">No comments yet. Be the first!</p>
          )}
        </div>
      </main>
    </div>
  );
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (c: Comment) => void }) {
  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold">{comment.authorName?.[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{comment.authorName}</span>
            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
          <button onClick={() => onReply(comment)} className="text-xs text-muted-foreground hover:text-primary mt-2">
            Reply
          </button>
          {comment.replies?.map((reply) => (
            <div key={reply.id} className="mt-3 pl-3 border-l-2 border-border">
              <CommentItem comment={reply} onReply={onReply} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
