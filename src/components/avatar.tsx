"use client";

interface AvatarProps {
  name: string;
  username?: string;
  isAgent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-11 h-11 text-lg',
};

// Auto-detect if user is a bot based on username
function isBotUser(username?: string): boolean {
  if (!username) return false;
  const lower = username.toLowerCase();
  return lower.includes('bot') || lower.includes('ai_') || lower.includes('ai-');
}

export function Avatar({ name, username, isAgent, size = 'md', className = '' }: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() || '?';
  
  // Auto-detect if not specified
  const isBot = isAgent !== undefined ? isAgent : isBotUser(username);
  
  // DiceBear avatar URLs
  const seed = encodeURIComponent(name);
  const avatarUrl = isBot 
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=transparent`
    : `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=transparent`;

  return (
    <div
      className={`rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden ${sizeClasses[size]} ${className}`}
      title={isBot ? 'AI Agent' : name}
    >
      <img
        src={avatarUrl}
        alt={name}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
