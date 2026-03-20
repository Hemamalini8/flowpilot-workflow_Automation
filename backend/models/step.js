const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
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
  { timestamps: true }
);

module.exports = mongoose.model("Step", stepSchema);