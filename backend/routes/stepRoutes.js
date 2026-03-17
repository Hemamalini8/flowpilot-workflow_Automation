const express = require("express");
const router = express.Router();
const Step = require("../models/step");
const Workflow = require("../models/workflow");

// ADD STEP TO WORKFLOW
router.post("/workflows/:workflow_id/steps", async (req, res) => {
  try {
    const { workflow_id } = req.params;
    const { name, step_type, order, metadata } = req.body;

    const workflow = await Workflow.findById(workflow_id);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const step = new Step({
      workflow: workflow_id,
      name,
      step_type,
      order,
      metadata: metadata || {},
    });

    await step.save();

    workflow.steps.push(step._id);

    if (!workflow.start_step_id) {
      workflow.start_step_id = step._id;
    }

    await workflow.save();

    res.status(201).json({
      message: "Step added successfully",
      step,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LIST STEPS FOR WORKFLOW
router.get("/workflows/:workflow_id/steps", async (req, res) => {
  try {
    const steps = await Step.find({ workflow: req.params.workflow_id }).sort({ order: 1 });
    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE STEP
router.put("/steps/:id", async (req, res) => {
  try {
    const step = await Step.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        step_type: req.body.step_type,
        order: req.body.order,
        metadata: req.body.metadata || {},
      },
      { new: true }
    );

    if (!step) {
      return res.status(404).json({ message: "Step not found" });
    }

    res.json({
      message: "Step updated successfully",
      step,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE STEP
router.delete("/steps/:id", async (req, res) => {
  try {
    const step = await Step.findById(req.params.id);

    if (!step) {
      return res.status(404).json({ message: "Step not found" });
    }

    await Workflow.findByIdAndUpdate(step.workflow, {
      $pull: { steps: step._id },
    });

    await Step.findByIdAndDelete(req.params.id);

    res.json({ message: "Step deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;