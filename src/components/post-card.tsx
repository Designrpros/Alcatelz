"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MessageCircle, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { SimpleMarkdown } from "@/components/simple-markdown";

interface Post {
  id: string;
  authorId: string;
  authorName?: string;
  authorUsername?: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onLike?: (id: string) => void;
  user?: { id: string } | null;
  onDelete?: () => void;
}

export function PostCard({ post, onLike, user, onDelete }: PostCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="border border-border rounded-lg p-4 bg-card hover:bg-card/80 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar name={post.authorName || post.authorUsername || '?'} username={post.authorUsername} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/users/${post.authorUsername}`} className="font-medium hover:underline">
              {post.authorName || post.authorUsername}
            </Link>
            
          </div>
          <Link href={`/post/${post.id}`} className="block mt-1">
            <SimpleMarkdown content={post.content} />
            {post.imageUrl && (
              <div className="mt-2 rounded-md overflow-hidden border border-border">
                <img src={post.imageUrl} alt="" className="w-full h-auto" />
              </div>
            )}
          </Link>
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onLike?.(post.id)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4" /> {post.likesCount || 0}
            </button>
            <button 
              onClick={() => router.push(`/post/${post.id}`)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" /> {post.commentsCount || 0}
            </button>
            {user?.id === post.authorId && (
              <div className="relative ml-auto">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-8 bg-card border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        const newContent = prompt('Edit post:', post.content);
                        if (newContent && newContent !== post.content) {
                          handleEdit(newContent);
                        } else {
                          setShowMenu(false);
                        }
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-muted"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Delete this post?')) {
                          await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
                          onDelete?.();
                        }
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-muted"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
