/* eslint-disable */
"use client";

export function SimpleMarkdown({ content }: { content: string }) {
  if (!content) return null;
  
  // Simple markdown parsing
  let html: string = content
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener">$1</a>')
    // Hashtags (make them blue and clickable, stop propagation to prevent post link)
    .replace(/#([a-zA-Z0-9_]+)/g, '<a href="/hashtag/$1" onclick="event.stopPropagation()" class="text-primary hover:underline font-medium cursor-pointer">#$1</a>')
    // Line breaks
    .replace(/\n/g, '<br />');
  
  return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />;
}
