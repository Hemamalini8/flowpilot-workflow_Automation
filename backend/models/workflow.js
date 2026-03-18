const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Step",
      default: null,
    },
    steps: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workflow", workflowSchema);