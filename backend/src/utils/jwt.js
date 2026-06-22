import "dotenv/config";

import { randomUUID } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured");
}

const secretKey = new TextEncoder().encode(jwtSecret);

export async function createAccessToken(user) {
  return new SignJWT({
    email: user.email,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(String(user.id))
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);
}

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ["HS256"],
  });

  const userId = Number(payload.sub);
  const tokenId = payload.jti;
  const expirationTime = payload.exp;

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid token subject");
  }

  if (typeof tokenId !== "string" || !tokenId) {
    throw new Error("Invalid token identifier");
  }

  if (!Number.isInteger(expirationTime)) {
    throw new Error("Invalid token expiration");
  }

  return {
    userId,
    tokenId,
    expiresAt: new Date(expirationTime * 1000),
  };
}