import prisma from "../lib/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Authenticates a bearer token and propagates verified identity to protected
 * route handlers.
 *
 * Signature verification is followed by a database revocation check and a
 * user lookup. Downstream authorization must use `req.user.id`, never an
 * identity supplied by the request body, query string, or route parameters.
 */
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

    // Logout persists the token identifier, allowing otherwise valid JWTs to
    // be rejected before protected application logic runs.
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

    // Loading the user both supplies the trusted request identity and rejects
    // tokens whose subject references an account that no longer exists.
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
