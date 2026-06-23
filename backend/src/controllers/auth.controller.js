import {
  loginUser,
  registerUser,
  revokeAccessToken,
} from "../services/auth.service.js";

import { createAccessToken } from "../utils/jwt.js";

/**
 * Validates registration input and delegates credential persistence to the
 * authentication service. Registration creates an account but does not issue
 * an access token.
 */
export async function register(req, res, next) {
  const email = req.body.email?.trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Email and password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: "fail",
      message: "Password must contain at least 8 characters",
    });
  }

  try {
    const user = await registerUser(email, password);

    return res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Validates credentials, authenticates the user, and returns a newly signed
 * bearer token without exposing the stored password hash.
 */
export async function login(req, res, next) {
  const email = req.body.email?.trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Email and password are required",
    });
  }

  try {
    const user = await loginUser(email, password);
    const accessToken = await createAccessToken(user);

    return res.status(200).json({
      status: "success",
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns the identity attached by the authentication middleware.
 *
 * The response never accepts a user identifier from request input.
 */
export function getCurrentUser(req, res) {
  return res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
}

/**
 * Revokes the bearer token presented on this request.
 *
 * Other tokens previously issued to the same user remain unaffected.
 */
export async function logout(req, res, next) {
  try {
    await revokeAccessToken(
      req.user.id,
      req.auth.tokenId,
      req.auth.expiresAt
    );

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(error);
  }
}
