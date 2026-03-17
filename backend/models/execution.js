const mongoose = require("mongoose");

const ExecutionSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true
    },
    currentStep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Step"
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "rejected"],
      default: "pending"
    },
    data: {
      type: Object,
      default: {}
    },
    logs: [
      {
        message: String,
        time: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Execution", ExecutionSchema);