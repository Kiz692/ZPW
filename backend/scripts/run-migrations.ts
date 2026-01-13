#!/usr/bin/env tsx
/**
 * Migration Runner Script
 * Applies SQL migration files to the database
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../src/core/db/client.js';

const MIGRATIONS_DIR = join(process.cwd(), 'db', 'migrations');

async function runMigrations() {
  try {
    console.log('🔍 Checking database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // Check if migrations table exists
    const migrationTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      );
    `);

    if (!migrationTableCheck.rows[0].exists) {
      console.log('📦 Creating migrations table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
          id SERIAL PRIMARY KEY,
          hash text NOT NULL,
          created_at bigint
        );
      `);
      console.log('✅ Migrations table created\n');
    }

    // Read migration file
    const migrationFile = join(MIGRATIONS_DIR, '0000_clammy_silver_centurion.sql');
    console.log(`📄 Reading migration file: ${migrationFile}`);
    const migrationSQL = readFileSync(migrationFile, 'utf-8');

    // Check if migration already applied
    const hash = '0000_clammy_silver_centurion';
    const existingMigration = await pool.query(
      'SELECT id FROM __drizzle_migrations WHERE hash = $1',
      [hash]
    );

    if (existingMigration.rows.length > 0) {
      console.log('✅ Migration already applied, skipping...\n');
      process.exit(0);
    }

    console.log('🚀 Applying migration...');
    
    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    // Record migration
    await pool.query(
      'INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)',
      [hash, Date.now()]
    );

    console.log('✅ Migration applied successfully\n');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
