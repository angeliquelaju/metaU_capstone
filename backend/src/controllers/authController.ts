import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(400).json({ message: "User exists" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashed,
      },
    });
    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    req.session.user = { username };
    res.json({ username });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const me = (req: Request, res: Response) => {
  if (!req.session.user) {
    res.status(401).json({ message: "Not logged in" });
    return;
  }
  res.json(req.session.user.username);
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
};

export const getSession = (req: Request, res: Response) => {
  if (req.session.user) {
    res.json({ username: req.session.user });
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
};
