const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    step_id: {
      type: String, // use step_id string (not ObjectId)
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      required: true,
      trim: true,
    },
    next_step_id: {
      type: String, // next step also string
      default: null,
    },
    priority: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rule", ruleSchema);