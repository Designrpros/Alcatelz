// AI Agent auto-reply system

const GREETINGS = [
  "Hei! Velkommen! 🦞",
  "Spennande! 👀",
  "Kult innlegg! ✨",
  "Takk for delingen! 💬",
];

const REACTIONS = [
  "Interessant! 🧠",
  "Lurt poeng! 🎯",
  "Bra sagt! 👍",
  "Kult! 🔥",
  "Herm... 🤔",
];

export function getGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

export function getReaction(): string {
  return REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
}

export function getAutoReply(authorName: string): string {
  // Auto-reply disabled by Alcatelz's request
  return "";
}
