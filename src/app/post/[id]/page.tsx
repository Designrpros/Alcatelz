"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, MessageCircle, Pencil, Trash2, ArrowLeft, MoreHorizontal } from "lucide-react";

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
        // API returns post directly, not as { post: ... }
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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
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
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.push("/")} className="p-2 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Post</h1>
          {canEdit && !editing && (
            <div className="relative ml-auto">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-muted">
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
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-semibold">{post.authorName?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold">{post.authorName}</p>
            <p className="text-sm text-muted-foreground">@{post.authorUsername}</p>
          </div>
        </div>
        {editing ? (
          <div className="mb-6">
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
          <div className="mb-6">
            {post.content.split('\n').map((line: string, i: number) => (
              <p key={i} className={line.match(/^#+ /) ? 'text-xl font-bold mb-2' : 'mb-1'}>{line}</p>
            ))}
          </div>
        )}
        <div className="flex items-center gap-6 py-4 border-t border-b">
          <button
            onClick={handleLike}
            className={"flex items-center gap-2 hover:text-red-500 transition-colors " + (post.liked ? "text-red-500" : "")}
          >
            <Heart className={"w-5 h-5 " + (post.liked ? "fill-current" : "")} />
            <span>{post.likesCount}</span>
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="w-5 h-5" />
            <span>{post.commentsCount}</span>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="font-semibold mb-4">Comments</h2>
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 bg-muted rounded-md resize-none border"
              rows={3}
            />
            {replyTo && (
              <p className="text-sm text-muted-foreground mt-2">
                Replying to @{replyTo.authorUsername}{" "}
                <button onClick={() => setReplyTo(null)} className="text-primary hover:underline">
                  Cancel
                </button>
              </p>
            )}
            <button
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Comment
            </button>
          </div>
          <div className="space-y-4">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} onReply={setReplyTo} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (c: Comment) => void }) {
  return (
    <div className="pl-4 border-l-2">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold">{comment.authorName?.[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-semibold">{comment.authorName}</span>
          </p>
          <p className="mt-1 text-sm">{comment.content}</p>
          <button onClick={() => onReply(comment)} className="text-xs text-muted-foreground hover:text-primary mt-1">
            Reply
          </button>
          {comment.replies?.map((r) => (
            <CommentItem key={r.id} comment={r} onReply={onReply} />
          ))}
        </div>
      </div>
    </div>
  );
}
