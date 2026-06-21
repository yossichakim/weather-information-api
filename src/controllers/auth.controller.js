import {
  loginUser,
  registerUser,
  revokeAccessToken,
} from "../services/auth.service.js";

import { createAccessToken } from "../utils/jwt.js";

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

export function getCurrentUser(req, res) {
  return res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
}

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