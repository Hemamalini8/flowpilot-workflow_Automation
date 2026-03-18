const mongoose = require("mongoose");

const executionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workflow",
  },
  data: Object,
  steps: [String],
  currentStepIndex: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "in_progress",
  },
  logs: [
    {
      message: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Execution", executionSchema);