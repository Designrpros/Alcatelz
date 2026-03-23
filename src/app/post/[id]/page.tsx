/* eslint-disable */
"use client";
import { useEffect, useState } from "react";
import { SimpleMarkdown } from "@/components/simple-markdown";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bot, MessageCircle, ArrowLeft, Send, Reply } from "lucide-react";



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
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  content: string;
  parentId: string | null;
  depth: number;
  createdAt: string;
  replies: Comment[];
}

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;
  const { isSidebarOpen, isInspectorOpen } = useUIStore();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchPost();
    fetchComments();
    fetchUser();
  }, [postId]);

  async function fetchPost() {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data as Post);
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  }

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {}
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    
    try {
      await fetch(`/api/posts/${postId}/comments?postId=${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: commentText,
          parentId: replyingTo?.id || null 
        }),
      });
      setCommentText("");
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error("Failed to comment:", error);
    }
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  function renderComment(comment: Comment, depth = 0) {
    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-4 pl-4 border-l border-border" : ""}`}>
        <div className="py-2">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/users/${comment.authorUsername}`} className="font-medium text-sm hover:underline">
              {comment.authorName || comment.authorUsername}
            </Link>
            <span className="text-xs text-muted-foreground">
              @{comment.authorUsername}
            </span>
            <span className="text-xs text-muted-foreground">
              • {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button 
              onClick={() => setReplyingTo({ id: comment.id, name: comment.authorUsername })}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-1">
            {comment.replies.map((reply: Comment) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
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
          <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Back button */}
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to feed
            </Link>

            {/* Post */}
            <article className="border border-border rounded-lg p-4 bg-card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Link href={`/users/${post.authorUsername}`} className="font-medium hover:underline">
                    {post.authorName || post.authorUsername}
                  </Link>
                  <p className="text-sm text-muted-foreground">@{post.authorUsername}</p>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <SimpleMarkdown content={post.content} />
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                <span>{timeAgo(post.createdAt)}</span>
                <span>{post.commentsCount || 0} comments</span>
                <span>{post.likesCount || 0} likes</span>
              </div>
            </article>

            {/* Comment form */}
            <div className="border border-border rounded-lg p-4 bg-card mb-6">
              <div className="flex items-start gap-3">
                {user ? (
                  <>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={replyingTo ? `Reply to @${replyingTo.name}...` : "Write a comment..."}
                      className="flex-1 bg-background border border-border rounded-md p-2 resize-none h-20"
                    />
                    <button
                      onClick={submitComment}
                      disabled={!commentText.trim()}
                      className="p-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    <Link href="/auth" className="text-primary hover:underline">Log in</Link> to comment
                  </p>
                )}
              </div>
              {replyingTo && (
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                  Replying to @{replyingTo.name}
                  <button 
                    onClick={() => setReplyingTo(null)}
                    className="text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <h2 className="font-medium mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Comments ({comments.length})
              </h2>
              
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-2">
                  {comments.map((comment) => renderComment(comment))}
                </div>
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
