const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema(
  {
    step_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Step",
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    next_step_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Step",
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