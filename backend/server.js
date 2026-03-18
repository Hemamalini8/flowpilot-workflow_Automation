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
app.use("/workflows", workflowRoutes);
app.use("/executions", executionRoutes);

// test route
app.get("/", (req, res) => {
  res.send("FlowPilot API is running 🚀");
});

// connect DB
mongoose
  .connect("mongodb+srv://hemamalinirajamanickam8_db_user:Kook@1234@cluster0.qlkbheq.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("MongoDB Connected ✅");

    app.listen(5000, () => {
      console.log("Server running on port 5000 🚀");
    });
  })
  .catch((err) => {
    console.log("DB error:", err);
  });