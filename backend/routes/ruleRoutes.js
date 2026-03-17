const express = require("express");
const router = express.Router();
const Rule = require("../models/rule");

// ADD RULE TO STEP
router.post("/steps/:step_id/rules", async (req, res) => {
  try {
    const { step_id } = req.params;
    const { condition, next_step_id, priority } = req.body;

    const rule = new Rule({
      step_id,
      condition,
      next_step_id: next_step_id || null,
      priority,
    });

    await rule.save();

    res.status(201).json({
      message: "Rule created successfully",
      rule,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LIST RULES FOR STEP
router.get("/steps/:step_id/rules", async (req, res) => {
  try {
    const rules = await Rule.find({ step_id: req.params.step_id })
      .populate("next_step_id")
      .sort({ priority: 1 });

    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE RULE
router.put("/rules/:id", async (req, res) => {
  try {
    const rule = await Rule.findByIdAndUpdate(
      req.params.id,
      {
        condition: req.body.condition,
        next_step_id: req.body.next_step_id || null,
        priority: req.body.priority,
      },
      { new: true }
    ).populate("next_step_id");

    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }

    res.json({
      message: "Rule updated successfully",
      rule,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE RULE
router.delete("/rules/:id", async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }

    await Rule.findByIdAndDelete(req.params.id);

    res.json({ message: "Rule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;