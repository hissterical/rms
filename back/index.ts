import express from "express";
import cors from "cors";
import propertyRoutes from "./routes/propertyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: [ // CHANGE THISS !!!!!
      "http://localhost:3000",
      "http://localhost:3001",
      "https://rms-ze-front.vercel.app",
      "https://rms-front-git-main-draxs-projects-939fc184.vercel.app",
      "https://hampilabs.com",
      "https://sohraa.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // 🔥 let cors decide headers based on Access-Control-Request-Headers
    // allowedHeaders: undefined
  })
);

// Make sure Express handles OPTIONS (if needed)
app.options("*", cors());

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);

app.listen(port, () => {
  console.log(`HMS server running on http://localhost:${port}`);
});
