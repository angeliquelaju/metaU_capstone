import { Router } from "express";
import { createEvents, EventAttributes } from "ics";
import prisma from "../prisma";
import requireAuth from "../middleware/requireAuth";

const router = Router();

router.get("/export/ics", requireAuth, async (req, res) => {
  try {
    const username = req.session.user?.username;
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        mealPlans: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    const plan = user?.mealPlans?.[0];
    if (!plan) {
      res.status(404).json({ error: "no meal plan found" });
      return;
    }

    const today = new Date();
    const day = today.getDay();
    const daysUntilMon = (8 - day) % 7 || 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilMon);
    startDate.setHours(0, 0, 0, 0);
    const DAYS = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const events: EventAttributes[] = [];
    for (const entry of plan.plan as any[]) {
      const dayIndex = DAYS.indexOf(entry.day.toLowerCase());
      if (dayIndex === -1) continue;

      const eventDate = new Date(startDate);
      eventDate.setDate(
        startDate.getDate() + ((dayIndex - startDate.getDay() + 7) % 7)
      );

      for (const meal of entry.meals) {
        const [year, month, day] = [
          eventDate.getFullYear(),
          eventDate.getMonth() + 1,
          eventDate.getDate(),
        ];

        events.push({
          title: `meal: ${meal.title}`,
          start: [year, month, day, 12, 0],
          duration: { hours: 1 },
          description: `eat ${meal.servings} serving of ${meal.title}`,
        });
      }
    }
    const { error, value } = createEvents(events);
    if (error) {
      console.error("ics generation failed: ", error);
      res.status(500).json({ error: "could not generate calendar file" });
      return;
    }
    res.setHeader(
      "Content-Disposition",
      "attachment: filename=meal-plan.ics"
    );
    res.setHeader("Content-Type", "text/calendar");
    res.send(value);
  } catch (err) {
    console.error("error in /export/ics", err);
    res.status(500).json({ error: "server error" });
  }
});
export default router;