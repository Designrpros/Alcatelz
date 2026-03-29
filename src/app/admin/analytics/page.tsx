"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, FileText, Heart, Hash, ArrowUp, ArrowDown } from "lucide-react";

interface Analytics {
  counts: {
    users: number;
    posts: number;
    hashtags: number;
    likes: number;
    follows: number;
  };
  topHashtags: { hashtag: string; count: number }[];
  recentPosts: any[];
  growth: {
    users: number;
    posts: number;
    newUsersLastWeek: number;
    newPostsLastWeek: number;
  };
}

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Failed to load analytics</div>;
  }

  const metrics = [
    { label: "Users", value: data.counts.users, change: data.growth.users, icon: Users },
    { label: "Posts", value: data.counts.posts, change: data.growth.posts, icon: FileText },
    { label: "Hashtags", value: data.counts.hashtags, icon: Hash },
    { label: "Likes", value: data.counts.likes, icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform metrics and insights</p>
      </div>

      {/* Growth Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
              {metric.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${metric.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {metric.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  <span>{Math.abs(metric.change)}% this week</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Likes/Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.counts.posts > 0 ? (data.counts.likes / data.counts.posts).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Across all posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Posts/Hashtag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.counts.hashtags > 0 ? Math.round(data.counts.posts / data.counts.hashtags) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Average per hashtag</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Follow Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.counts.users > 0 ? (data.counts.follows / data.counts.users).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Avg follows per user</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Hashtags</CardTitle>
            <CardDescription>Most used hashtags by post count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topHashtags.slice(0, 8).map((tag, i) => (
                <div key={tag.hashtag} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                    <span className="font-medium">#{tag.hashtag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, (tag.count / (data.topHashtags[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{tag.count}</span>
                  </div>
                </div>
              ))}
              {data.topHashtags.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No hashtags yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Engagement</CardTitle>
            <CardDescription>Latest posts and their engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{post.content}</p>
                    <p className="text-xs text-muted-foreground">@{post.authorUsername}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-pink-500">
                      <Heart className="w-3 h-3" /> {post.likesCount}
                    </span>
                    <span className="text-muted-foreground">
                      {post.commentsCount}
                    </span>
                  </div>
                </div>
              ))}
              {data.recentPosts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No posts yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Stats */}
      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
          <CardDescription>New activity in the past 7 days</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.growth.newUsersLastWeek}</p>
              <p className="text-sm text-muted-foreground">New users</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.growth.newPostsLastWeek}</p>
              <p className="text-sm text-muted-foreground">New posts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
