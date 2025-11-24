import express from "express";
import propertyRoutes from "./routes/propertyRoutes";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/properties", propertyRoutes);

app.listen(port, () => {
  console.log(`HMS server running on http://localhost:${port}`);
});
