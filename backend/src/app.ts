import express from "express";
import session from "express-session";
import authRoutes from "./routes/auth";
import recipeRoutes from "./routes/recipes";
import generatePlanRoutes from "./routes/generatePlan";
import groceryRoutes from "./routes/grocery";
import mealPlanRoutes from "./routes/mealPlan";
import userGoalRoutes from "./routes/userGoals";
import friendSuggestionRoutes from "./routes/friendSuggestion";

import dotenv from "dotenv";

dotenv.config();

const app = express();
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true, sameSite: "none", maxAge: 1000 * 60 * 60 },
  }),
);

app.get("/", (req, res) => {
  res.send("backend running");
});

app.use(authRoutes);
app.use(recipeRoutes);
app.use(generatePlanRoutes);
app.use(groceryRoutes);
app.use(mealPlanRoutes);
app.use(userGoalRoutes);
app.use(friendSuggestionRoutes);

export default app;
