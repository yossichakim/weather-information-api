import "dotenv/config";

process.env.NODE_ENV = "test";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is not configured");
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET =
  "test-jwt-secret-key-for-integration-tests-only";