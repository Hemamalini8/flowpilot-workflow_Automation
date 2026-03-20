const express = require("express");
const router = express.Router();

const Rule = require("../models/rule");
const Workflow = require("../models/workflow");

// ADD RULE TO STEP
router.post("/steps/:step_id/rules", async (req, res) => {
  try {
    const { step_id } = req.params;
    const { workflowId, condition, next_step_id, priority } = req.body;

    if (!workflowId) {
      return res.status(400).json({ message: "workflowId is required" });
    }

    const workflow = await Workflow.findById(workflowId);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const stepExists = Array.isArray(workflow.steps)
      ? workflow.steps.some((step, index) => {
          const currentStepId =
            step?.step_id || step?.id || step?._id?.toString() || `step${index + 1}`;
          return String(currentStepId) === String(step_id);
        })
      : false;

    if (!stepExists) {
      return res.status(404).json({ message: "Step not found in workflow" });
    }

    const rule = new Rule({
      workflow: workflow._id,
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
    const rules = await Rule.find({ step_id: req.params.step_id }).sort({ priority: 1 });
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
    );

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