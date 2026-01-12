import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://zpw_user:zpw_dev_password@localhost:5432/zpw_db',
      NODE_ENV: process.env.NODE_ENV || 'test',
      SKIP_AUTH: process.env.SKIP_AUTH || 'true',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/__tests__/**',
      ],
    },
    // Increased timeouts for integration tests that interact with database
    testTimeout: 30000, // 30 seconds for individual tests
    hookTimeout: 30000, // 30 seconds for setup/teardown hooks
    teardownTimeout: 30000, // 30 seconds for teardown
    // Retry flaky tests up to 2 times
    retry: 2,
    // Run tests in sequence to avoid database conflicts
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Run tests sequentially to avoid DB conflicts
      },
    },
    // Isolate test files
    isolate: true,
    // Sequence test execution
    sequence: {
      shuffle: false, // Don't shuffle tests - run in order
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
