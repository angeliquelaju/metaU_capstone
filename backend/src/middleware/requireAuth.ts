import { Request, Response, NextFunction } from "express";

export default function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.session.user) {
    res.status(401).json({ message: "please log in" });
    return;
  }
  next();
}
