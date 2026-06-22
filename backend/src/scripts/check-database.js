import prisma from "../lib/prisma.js";

async function checkDatabaseConnection() {
  try {
    const userCount = await prisma.user.count();
    const taskCount = await prisma.task.count();

    console.log("Database connection successful");
    console.log({
      userCount,
      taskCount,
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();