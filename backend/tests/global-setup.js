import "dotenv/config";
import { execSync } from "node:child_process";

/**
 * Applies the tracked migrations to the isolated test database before Vitest
 * imports application modules that initialize Prisma.
 *
 * Both Prisma connection variables point to the test database so migrations
 * cannot target the development or production application database.
 */
export function setup() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;

  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL is not configured");
  }

  if (!shadowDatabaseUrl) {
    throw new Error("SHADOW_DATABASE_URL is not configured");
  }

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
      DIRECT_URL: testDatabaseUrl,
      SHADOW_DATABASE_URL: shadowDatabaseUrl,
    },
  });
}
