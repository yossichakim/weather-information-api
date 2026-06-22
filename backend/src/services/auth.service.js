import bcrypt from "bcryptjs";

import prisma from "../lib/prisma.js";

const PASSWORD_SALT_ROUNDS = 12;

export async function registerUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;

    throw error;
  }

  const passwordHash = await bcrypt.hash(
    password,
    PASSWORD_SALT_ROUNDS
  );

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });
}

export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;

    throw error;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;

    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function revokeAccessToken(
  userId,
  tokenId,
  expiresAt
) {
  return prisma.revokedToken.upsert({
    where: {
      jti: tokenId,
    },
    update: {
      expiresAt,
    },
    create: {
      jti: tokenId,
      expiresAt,
      userId,
    },
  });
}