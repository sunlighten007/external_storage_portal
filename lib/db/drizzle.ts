import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { getDatabaseUrl } from '@/lib/amplify-config';

// Get database URL with proper error handling for Amplify
const databaseUrl = getDatabaseUrl();
console.log('✅ Database URL found, connecting...');

export const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });
