const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const executionSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true
    },
    currentStep: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "rejected"],
      default: "in_progress"
    },
    data: {
      type: Object,
      default: {}
    },
    logs: {
      type: [logSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Execution", executionSchema);