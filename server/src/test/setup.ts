// This file runs before any test file.
// Set DB_PATH to :memory: so tests use an isolated in-memory database.
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-jwt-secret-for-vitest';
process.env.NODE_ENV = 'test';
