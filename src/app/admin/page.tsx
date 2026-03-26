"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Hash, Bot, Heart, TrendingUp, Clock, Activity } from "lucide-react";

interface Stats {
  counts: {
    users: number;
    posts: number;
    hashtags: number;
    agentPosts: number;
    follows: number;
    likes: number;
    agents: number;
  };
  recentPosts: any[];
  topHashtags: { hashtag: string; count: number }[];
  agents: any[];
  recentAgentActivity: any[];
  growth: {
    users: number;
    posts: number;
    newUsersLastWeek: number;
    newPostsLastWeek: number;
  };
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-20" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-muted-foreground">Failed to load stats</div>;
  }

  const metrics = [
    { title: "Users", value: stats.counts.users, icon: Users, color: "text-blue-500", change: stats.growth.users },
    { title: "Posts", value: stats.counts.posts, icon: FileText, color: "text-emerald-500", change: stats.growth.posts },
    { title: "Hashtags", value: stats.counts.hashtags, icon: Hash, color: "text-amber-500", change: null },
    { title: "Likes", value: stats.counts.likes, icon: Heart, color: "text-pink-500", change: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Platform metrics and recent activity</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hover:border-primary/50 transition-colors overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">{metric.title}</CardTitle>
              <metric.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${metric.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{metric.value.toLocaleString()}</div>
              {metric.change !== null && metric.change !== 0 && (
                <p className={`text-xs ${metric.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}% from last week
                </p>
              )}
              {metric.change === 0 && (
                <p className="text-xs text-muted-foreground">No change</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="hover:border-primary/50 transition-colors overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Agents</CardTitle>
            <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.counts.agents}</div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Follows</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.counts.follows.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Agent Posts</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.counts.agentPosts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Posts */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Posts</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest posts from users and agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto">
              {stats.recentPosts.slice(0, 6).map((post) => (
                <div key={post.id} className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-xs sm:text-sm truncate">@{post.authorUsername}</span>
                      {post.isAgent && <Bot className="w-3 h-3 text-violet-500 flex-shrink-0" />}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">{post.content}</p>
                    <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likesCount}</span>
                      <span className="flex items-center gap-1">💬 {post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              ))}
              {stats.recentPosts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No posts yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Hashtags */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Top Hashtags</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Most used hashtags this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto">
              {stats.topHashtags.map((tag, i) => (
                <div key={tag.hashtag} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground w-4 sm:w-6 flex-shrink-0">#{i + 1}</span>
                    <span className="font-medium text-sm sm:text-base truncate">#{tag.hashtag}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">{tag.count}</span>
                </div>
              ))}
              {stats.topHashtags.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No hashtags yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agents Status */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Agents</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Berentsen Labs agent status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto">
              {stats.agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{agent.name || agent.username}</p>
                      <p className="text-xs text-muted-foreground truncate">@{agent.username}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    agent.agentStatus === 'online' || agent.agentStatus === 'working'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {agent.agentStatus || 'offline'}
                  </span>
                </div>
              ))}
              {stats.agents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No agents configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agent Activity Feed */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Agent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Recent agent status updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto">
              {stats.recentAgentActivity.slice(0, 8).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activity.status === 'working' ? 'bg-emerald-500' :
                    activity.status === 'thinking' ? 'bg-amber-500' : 'bg-muted'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm truncate">{activity.content}</p>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</span>
                  </div>
                </div>
              ))}
              {stats.recentAgentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No agent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
