process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.JWT_SECRET =
  "test-jwt-secret-key-for-integration-tests-only";