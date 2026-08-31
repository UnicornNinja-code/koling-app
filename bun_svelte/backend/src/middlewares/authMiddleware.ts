/*
 * authMiddleware.ts
 * JWT Authentication Middleware in TypeScript
 */

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "No token provided, unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string | number; role: string };

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ msg: "User not found, unauthorized" });
    }

    req.user = user;
    next();
  } catch (error: any) {
    return res.status(403).json({ msg: "Invalid or expired token", error: error.message });
  }
};
