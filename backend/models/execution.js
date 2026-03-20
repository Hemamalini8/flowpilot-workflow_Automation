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
    workflow_version: {
      type: Number,
      default: 1
    },
    currentStep: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "rejected", "failed", "canceled"],
      default: "in_progress"
    },
    data: {
      type: Object,
      default: {}
    },
    logs: {
      type: [logSchema],
      default: []
    },
    retries: {
      type: Number,
      default: 0
    },
    triggered_by: {
      type: String,
      default: "user"
    },
    started_at: {
      type: Date,
      default: Date.now
    },
    ended_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Execution", executionSchema);