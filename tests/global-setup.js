import { execSync } from "node:child_process";

const TEST_DATABASE_URL = "file:./prisma/test.db";

export function setup() {
  execSync(
    `npx prisma db push --force-reset --url "${TEST_DATABASE_URL}"`,
    {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: TEST_DATABASE_URL,
      },
    }
  );
}