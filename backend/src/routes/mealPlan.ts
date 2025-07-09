import { Router } from "express";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";

const router = Router();

router.get("/meal-plan", requireAuth, async (req, res) => {
    const username = req.session.user?.username;
    const user = await prisma.user.findUnique({
        where: {username},
        include: {
            mealPlans: {
                orderBy: {createdAt: "desc"},
                take: 1,
            },
        },
    });
    const plan = user?.mealPlans?.[0]?.plan;
    if (!plan) {
        res.status(404).json({error: "no meal plan found"});
        return;
    }
    res.json(plan);
})

export default router;