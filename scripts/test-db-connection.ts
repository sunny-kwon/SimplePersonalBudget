
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function testConnection() {
    console.log('Testing database connection...');
    try {
        const result = await db.execute(sql`SELECT 1 as connected`);
        console.log('Connection successful:', result);
    } catch (error) {
        console.error('Connection failed:', error);
    }
    process.exit(0);
}

testConnection();
