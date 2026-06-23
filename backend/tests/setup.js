import "dotenv/config";

process.env.NODE_ENV = "test";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is not configured");
}

// Application modules read DATABASE_URL and JWT_SECRET during import, so the
// test-specific values must be assigned before the app is loaded.
process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET =
  "test-jwt-secret-key-for-integration-tests-only";
