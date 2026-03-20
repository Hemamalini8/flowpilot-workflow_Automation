import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import workflowRoutes from "./routes/workflowRoutes.js";
import executionRoutes from "./routes/executionRoutes.js";
import stepRoutes from "./routes/stepRoutes.js";
import ruleRoutes from "./routes/ruleRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", stepRoutes);
app.use("/api", ruleRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/executions", executionRoutes);

app.get("/", (req, res) => {
  res.send("FlowPilot API is running 🚀");
});

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