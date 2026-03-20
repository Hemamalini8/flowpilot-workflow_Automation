const mongoose = require("mongoose");

const workflowStepSchema = new mongoose.Schema(
  {
    step_id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    step_type: {
      type: String,
      enum: ["task", "approval", "notification"],
      required: true,
      default: "task",
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    input_schema: {
      type: Object,
      default: {
        amount: { type: "number", required: true },
        country: { type: "string", required: true },
        department: { type: "string", required: false },
        priority: {
          type: "string",
          required: true,
          allowed_values: ["High", "Medium", "Low"],
        },
      },
    },
    start_step_id: {
      type: String,
      default: null,
    },
    steps: {
      type: [workflowStepSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workflow", workflowSchema);