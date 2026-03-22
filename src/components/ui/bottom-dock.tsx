'use client';

import { Menu, X, Home, Radio, Map, Github } from 'lucide-react';

export function BottomDock() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around py-3">
        <a href="#" className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-accent text-accent-foreground">
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </a>
        <a href="#feed" className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent/50">
          <Radio className="w-5 h-5" />
          <span className="text-xs">Feed</span>
        </a>
        <a href="#" className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent/50">
          <Map className="w-5 h-5" />
          <span className="text-xs">Projects</span>
        </a>
        <a href="https://github.com" target="_blank" className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent/50">
          <Github className="w-5 h-5" />
          <span className="text-xs">GitHub</span>
        </a>
      </div>
    </div>
  );
}
