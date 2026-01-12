#!/usr/bin/env node
/**
 * SKIP_AUTH Guard
 * Prevents deployment with SKIP_AUTH enabled in production
 */

require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const skipAuth = process.env.SKIP_AUTH === 'true' || process.env.SKIP_AUTH === '1';

// In production or staging, SKIP_AUTH must be false or unset
if ((nodeEnv === 'production' || nodeEnv === 'staging') && skipAuth) {
  console.error('❌ ERROR: SKIP_AUTH cannot be enabled in production or staging environments!');
  console.error(`   NODE_ENV: ${nodeEnv}`);
  console.error(`   SKIP_AUTH: ${process.env.SKIP_AUTH}`);
  console.error('\n💡 This is a security guard to prevent accidental deployment without authentication.');
  console.error('   Remove SKIP_AUTH from your environment variables or set it to false.');
  process.exit(1);
}

// In development, warn if SKIP_AUTH is enabled
if (nodeEnv === 'development' && skipAuth) {
  console.warn('⚠️  WARNING: SKIP_AUTH is enabled in development mode.');
  console.warn('   Authentication is bypassed. This should NEVER be enabled in production!');
}

console.log('✅ Auth guard check passed');
process.exit(0);
