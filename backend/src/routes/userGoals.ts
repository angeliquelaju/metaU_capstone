import { Router } from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";

const router = Router();

router.get("/user/goals", requireAuth, async (req, res) => {
  const username = req.session.user?.username;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(401).json({ error: "user not found" });
    return;
  }
  res.json({
    calories: user.goalCalories ?? 0,
    protein: user.goalProtein ?? 0,
    carbs: user.goalCarbs ?? 0,
  });
});

router.post("/user/goals", requireAuth, async (req, res) => {
  const username = req.session.user?.username;
  const { calories, protein, carbs } = req.body;
  const user = await prisma.user.update({
    where: { username },
    data: {
      goalCalories: calories,
      goalProtein: protein,
      goalCarbs: carbs,
    },
  });
  res.json({
    message: "goals saved",
    calories: user.goalCalories,
    protein: user.goalProtein,
    carbs: user.goalCarbs,
  });
});
export default router;
