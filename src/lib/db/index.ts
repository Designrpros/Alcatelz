import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Production connection (Vercel):
// Option 1: Vercel Postgres (Private Network) - auto-configured when using Vercel Blob/Postgres
// DATABASE_URL from Vercel dashboard (under Storage > Postgres > Connection Details)
// Already set via process.env.DATABASE_URL
//
// Option 2: Supabase / Neon / Railway via Prisma-like proxy
// Use @vercel/postgres or a connection pooler for serverless
//
// For local development, use the Docker container:
// postgres://postgres:password@localhost:5432/alcatelz
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
