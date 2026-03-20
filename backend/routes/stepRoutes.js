const express = require("express");
const router = express.Router();
const Step = require("../models/step");
const Workflow = require("../models/workflow");
const Rule = require("../models/rule");

function generateStepId(name, order) {
  const safeName = String(name || "step")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  return `${safeName}_${order}`;
}

// ADD STEP
router.post("/workflows/:workflow_id/steps", async (req, res) => {
  try {
    const { workflow_id } = req.params;
    const { name, step_type, order, metadata } = req.body;

    const workflow = await Workflow.findById(workflow_id);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const finalOrder = Number(order) || ((workflow.steps || []).length + 1);
    const step_id = generateStepId(name, finalOrder);

    const exists = await Step.findOne({ workflow: workflow_id, step_id });
    if (exists) {
      return res.status(400).json({ message: "Step id already exists. Use different step name." });
    }

    const step = new Step({
      workflow: workflow_id,
      name,
      step_type,
      order: finalOrder,
      metadata: metadata || {},
      step_id,
    });

    await step.save();

    workflow.steps = Array.isArray(workflow.steps) ? workflow.steps : [];
    workflow.steps.push({
      _id: step._id,
      step_id: step.step_id,
      name: step.name,
      step_type: step.step_type,
      order: step.order,
      metadata: step.metadata || {},
    });

    workflow.steps.sort((a, b) => (a.order || 0) - (b.order || 0));

    if (!workflow.start_step_id) {
      workflow.start_step_id = step.step_id;
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

// LIST STEPS
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
    const oldStep = await Step.findById(req.params.id);

    if (!oldStep) {
      return res.status(404).json({ message: "Step not found" });
    }

    const updatedStep = await Step.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name ?? oldStep.name,
        step_type: req.body.step_type ?? oldStep.step_type,
        order: req.body.order ?? oldStep.order,
        metadata: req.body.metadata ?? oldStep.metadata,
      },
      { new: true }
    );

    const workflow = await Workflow.findById(updatedStep.workflow);

    if (workflow) {
      workflow.steps = (workflow.steps || []).map((step) => {
        if (String(step._id) === String(updatedStep._id)) {
          return {
            _id: updatedStep._id,
            step_id: updatedStep.step_id,
            name: updatedStep.name,
            step_type: updatedStep.step_type,
            order: updatedStep.order,
            metadata: updatedStep.metadata || {},
          };
        }
        return step;
      });

      workflow.steps.sort((a, b) => (a.order || 0) - (b.order || 0));
      await workflow.save();
    }

    res.json({
      message: "Step updated successfully",
      step: updatedStep,
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

    const workflow = await Workflow.findById(step.workflow);

    if (workflow) {
      workflow.steps = (workflow.steps || []).filter(
        (item) => String(item._id) !== String(step._id)
      );

      if (String(workflow.start_step_id) === String(step.step_id)) {
        workflow.start_step_id =
          workflow.steps.length > 0 ? workflow.steps[0].step_id : null;
      }

      await workflow.save();
    }

    await Rule.deleteMany({
      $or: [
        { step_id: step.step_id },
        { next_step_id: step.step_id },
      ],
    });

    await Step.findByIdAndDelete(req.params.id);

    res.json({ message: "Step deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;