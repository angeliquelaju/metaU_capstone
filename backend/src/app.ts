import express from "express";
import session from "express-session";
import authRoutes from "./routes/auth";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const cors = require('cors');

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }, 
  })
);

app.use(authRoutes);

export default app;
