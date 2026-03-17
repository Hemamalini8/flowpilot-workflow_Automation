const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const workflowRoutes = require("./routes/workflowRoutes");
const stepRoutes = require("./routes/stepRoutes");
const executionRoutes = require("./routes/executionRoutes");
const ruleRoutes = require("./routes/ruleRoutes");
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/workflows", workflowRoutes);
app.use("/api", stepRoutes);
app.use("/api/executions", executionRoutes);
app.use("/api", ruleRoutes);

app.get("/", (req, res) => {
  res.send("Workflow Engine API running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});