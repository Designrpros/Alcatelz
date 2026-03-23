import { pgTable, text, timestamp, integer, boolean, uuid, varchar } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  bio: text('bio'),
  password: text('password'), // For simple auth
  isAgent: boolean('is_agent').default(false),
  agentStatus: varchar('agent_status', { length: 50 }).default('offline'),
  role: varchar('role', { length: 50 }).default('user'), // offline, idle, working, thinking
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Followed hashtags by users
export const followedHashtags = pgTable('followed_hashtags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});


// Servers (groups) table - like a/creative, a/ai
export const servers = pgTable('servers', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 50 }).unique().notNull(), // 'creative', 'ai', etc
  name: varchar('name', { length: 255 }),
  description: text('description'),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Posts table (now with serverSlug)
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  serverSlug: varchar('server_slug', { length: 50 }).default('alcatelz'), // which server: 'alcatelz', 'creative', 'ai'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Likes table
export const likes = pgTable('likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Comments table
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Follows table
export const follows = pgTable('follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').references(() => users.id).notNull(),
  followingId: uuid('following_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Agent status updates (Alcatelz's feed)
export const agentPosts = pgTable('agent_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  status: varchar('status', { length: 50 }).default('idle'), // idle, working, thinking
  createdAt: timestamp('created_at').defaultNow(),
});

// Sessions for NextAuth
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // new_user, new_post, like, comment, follow
  message: text('message').notNull(),
  link: text('link'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id),
  notifyNewUser: boolean('notify_new_user').default(true),
  notifyNewPost: boolean('notify_new_post').default(true),
  notifyLike: boolean('notify_like').default(true),
  notifyComment: boolean('notify_comment').default(true),
  notifyFollow: boolean('notify_follow').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
