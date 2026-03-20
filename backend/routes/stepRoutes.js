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

  return `${safeName || "step"}_${order || 1}`;
}

// ADD STEP TO WORKFLOW
router.post("/workflows/:workflow_id/steps", async (req, res) => {
  try {
    const { workflow_id } = req.params;
    const { name, step_type, order, metadata } = req.body;

    const workflow = await Workflow.findById(workflow_id);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const steps = Array.isArray(workflow.steps) ? workflow.steps : [];
    const stepOrder = Number(order) || steps.length + 1;
    const step_id = generateStepId(name, stepOrder);

    const step = new Step({
      workflow: workflow_id,
      step_id,
      name,
      step_type,
      order: stepOrder,
      metadata: metadata || {},
    });

    await step.save();

    workflow.steps.push({
      step_id,
      name,
      step_type,
      order: stepOrder,
      metadata: metadata || {},
    });

    workflow.steps.sort((a, b) => (a.order || 0) - (b.order || 0));

    if (!workflow.start_step_id) {
      workflow.start_step_id = step_id;
    }

    await workflow.save();

    res.status(201).json({
      message: "Step added successfully",
      step,
      workflow,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LIST STEPS FOR WORKFLOW
router.get("/workflows/:workflow_id/steps", async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.workflow_id);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const steps = Array.isArray(workflow.steps) ? workflow.steps : [];
    const sortedSteps = [...steps].sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json(sortedSteps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE STEP
router.put("/steps/:id", async (req, res) => {
  try {
    const step = await Step.findById(req.params.id);

    if (!step) {
      return res.status(404).json({ message: "Step not found" });
    }

    const updatedStep = await Step.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name ?? step.name,
        step_type: req.body.step_type ?? step.step_type,
        order: req.body.order ?? step.order,
        metadata: req.body.metadata ?? step.metadata,
      },
      { new: true }
    );

    const workflow = await Workflow.findById(step.workflow);

    if (workflow) {
      const workflowSteps = Array.isArray(workflow.steps) ? workflow.steps : [];

      const updatedWorkflowSteps = workflowSteps.map((item, index) => {
        const currentStepId =
          item?.step_id || item?.id || item?._id?.toString() || `step${index + 1}`;

        if (String(currentStepId) === String(step.step_id)) {
          return {
            step_id: step.step_id,
            name: updatedStep.name,
            step_type: updatedStep.step_type,
            order: updatedStep.order,
            metadata: updatedStep.metadata || {},
          };
        }

        return item;
      });

      workflow.steps = updatedWorkflowSteps.sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

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
        (item, index) => {
          const currentStepId =
            item?.step_id || item?.id || item?._id?.toString() || `step${index + 1}`;
          return String(currentStepId) !== String(step.step_id);
        }
      );

      if (String(workflow.start_step_id) === String(step.step_id)) {
        workflow.start_step_id =
          workflow.steps.length > 0 ? workflow.steps[0].step_id : null;
      }

      await workflow.save();
    }

    await Rule.deleteMany({ step_id: step.step_id });
    await Rule.deleteMany({ next_step_id: step.step_id });

    await Step.findByIdAndDelete(req.params.id);

    res.json({ message: "Step deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;