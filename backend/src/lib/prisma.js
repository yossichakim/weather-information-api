import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;

// Fail during module initialization rather than allowing requests to reach an
// application that cannot access its persistence layer.
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
