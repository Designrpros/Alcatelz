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
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Posts table
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
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
