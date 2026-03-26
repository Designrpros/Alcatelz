"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bot, Heart, MessageCircle, UserPlus, Hash, Loader2, Clock, FileText } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  user?: string;
}

export default function AdminActivity() {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        // Combine posts and agent activity into one feed
        const posts: Activity[] = (data.recentPosts || []).map((p: any) => ({
          id: p.id,
          type: 'post',
          content: p.content,
          createdAt: p.createdAt,
          user: p.authorUsername,
        }));
        
        const agentActivity: Activity[] = (data.recentAgentActivity || []).map((a: any) => ({
          id: a.id,
          type: 'agent',
          content: a.content,
          createdAt: a.createdAt,
        }));

        // Merge and sort by date
        const all = [...posts, ...agentActivity].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setActivity(all);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch activity:', err);
        setLoading(false);
      });
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'post': return FileText;
      case 'agent': return Bot;
      case 'like': return Heart;
      case 'comment': return MessageCircle;
      case 'user': return UserPlus;
      default: return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-blue-500 bg-blue-500/10';
      case 'agent': return 'text-violet-500 bg-violet-500/10';
      case 'like': return 'text-pink-500 bg-pink-500/10';
      case 'comment': return 'text-amber-500 bg-amber-500/10';
      case 'user': return 'text-emerald-500 bg-emerald-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
          <p className="text-muted-foreground mt-1">Recent platform activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{activity.length} events</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Today</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activity.filter(a => a.type === 'post' && new Date(a.createdAt).toDateString() === new Date().toDateString()).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent Updates</CardTitle>
            <Bot className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activity.filter(a => a.type === 'agent').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Hour</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activity.filter(a => {
                const diff = Date.now() - new Date(a.createdAt).getTime();
                return diff < 3600000;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Day</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activity.filter(a => {
                const diff = Date.now() - new Date(a.createdAt).getTime();
                return diff < 86400000;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Latest posts and agent activity</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : activity.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No activity yet</p>
          ) : (
            <div className="space-y-1">
              {activity.map((item, i) => {
                const Icon = getIcon(item.type);
                return (
                  <div 
                    key={item.id} 
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(item.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.user && (
                          <span className="font-medium text-sm">@{item.user}</span>
                        )}
                        {item.type === 'agent' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">
                            Agent
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm mt-1 line-clamp-2">{item.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
