import prisma from "../lib/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function authenticate(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  const tokenMatch = authorizationHeader?.match(/^Bearer\s+(.+)$/i);
  const token = tokenMatch?.[1];

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Authentication token is required",
    });
  }

  try {
    const tokenPayload = await verifyAccessToken(token);

    const revokedToken = await prisma.revokedToken.findUnique({
      where: {
        jti: tokenPayload.tokenId,
      },
      select: {
        id: true,
      },
    });

    if (revokedToken) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication token has been revoked",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: tokenPayload.userId,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication token is invalid",
      });
    }

    req.user = user;

    req.auth = {
      tokenId: tokenPayload.tokenId,
      expiresAt: tokenPayload.expiresAt,
    };

    return next();
  } catch (error) {
    console.error("Authentication failed:", error);

    return res.status(401).json({
      status: "fail",
      message: "Authentication token is invalid or expired",
    });
  }
}