import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import workflowRoutes from "./routes/workflowRoutes.js";
import executionRoutes from "./routes/executionRoutes.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/workflows", workflowRoutes);
app.use("/api/executions", executionRoutes);

// test route
app.get("/", (req, res) => {
  res.send("FlowPilot API is running 🚀");
});

// connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.log("DB error:", err);
  });