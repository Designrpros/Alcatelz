"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hash, TrendingUp, FileText, Search, Loader2 } from "lucide-react";

interface Hashtag {
  hashtag: string;
  count: number;
}

export default function AdminHashtags() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHashtags = async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hashtags?page=${pageNum}&limit=50`);
      const data = await res.json();
      const newHashtags = (data.hashtags || []).map((h: { hashtag: string; count: number }) => ({
        hashtag: h.hashtag,
        count: Number(h.count),
      }));
      
      if (append) {
        setHashtags(prev => [...prev, ...newHashtags]);
      } else {
        setHashtags(newHashtags);
      }
      setHasMore(data.hasMore !== false);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch hashtags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHashtags(1, false);
  }, []);

  const filteredHashtags = hashtags.filter(h => 
    h.hashtag.toLowerCase().includes(search.toLowerCase())
  );

  const totalPosts = hashtags.reduce((sum, h) => sum + h.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hashtags</h1>
          <p className="text-muted-foreground mt-1">Manage and explore hashtags</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{hashtags.length} hashtags</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{totalPosts.toLocaleString()} total posts</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search hashtags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hashtags</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hashtags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Posts/Tag</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hashtags.length > 0 ? Math.round(totalPosts / hashtags.length) : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hashtags.length > 0 ? `#${hashtags[0].hashtag}` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {hashtags.length > 0 ? `${hashtags[0].count} posts` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hashtags Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Hashtags</CardTitle>
          <CardDescription>Browse and manage hashtags on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && hashtags.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredHashtags.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No hashtags found</p>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {filteredHashtags.map((tag, i) => (
                  <div 
                    key={tag.hashtag} 
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => window.open(`/?tag=${tag.hashtag}`, '_blank')}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">#{i + 1}</span>
                      <span className="font-medium">#{tag.hashtag}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{tag.count}</span>
                  </div>
                ))}
              </div>
              
              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => fetchHashtags(page + 1, true)}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                      </span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
