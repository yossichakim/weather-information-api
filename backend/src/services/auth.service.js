import bcrypt from "bcryptjs";

import prisma from "../lib/prisma.js";

const PASSWORD_SALT_ROUNDS = 12;

/**
 * Creates a user with a normalized email address and a bcrypt password hash.
 *
 * @throws {Error} With status code 409 when the normalized email already
 * exists.
 */
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

/**
 * Verifies credentials and returns only the public user fields needed by the
 * token and response layers.
 *
 * Missing users and invalid passwords intentionally share one error response
 * to avoid disclosing account existence.
 */
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

/**
 * Persists the presented JWT identifier until its original expiration time.
 *
 * The upsert makes repeated logout attempts idempotent for the same token.
 */
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
