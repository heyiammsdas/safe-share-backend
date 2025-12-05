// server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";
import profileRoutes from "./routes/profile";
import auth from "./middlewares/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/profile", profileRoutes);

// Example protected route
app.get("/api/protected", auth, (req: any, res) => {
  res.json({ ok: true, user: req.user });
});

// Root route
app.get("/", (req, res) => {
  res.send("SafeShare backend running");
});

async function start() {
  try {
    if (!process.env.MONGO_URI) throw new Error("Missing Mongo Uri");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start", err);
    process.exit(1);
  }
}

start();