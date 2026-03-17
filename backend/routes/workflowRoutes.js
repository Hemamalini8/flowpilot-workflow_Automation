const express = require("express");
const router = express.Router();
const Workflow = require("../models/workflow");
const Step = require("../models/step");
const Rule = require("../models/rule");
const Execution = require("../models/execution");

// CREATE WORKFLOW
router.post("/", async (req, res) => {
  try {
    const { name, input_schema } = req.body;

    const workflow = new Workflow({
      name,
      input_schema: input_schema || {
        amount: { type: "number", required: true },
        country: { type: "string", required: true },
        department: { type: "string", required: false },
        priority: {
          type: "string",
          required: true,
          allowed_values: ["High", "Medium", "Low"],
        },
      },
    });

    await workflow.save();

    res.status(201).json({
      message: "Workflow created successfully",
      workflow,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LIST WORKFLOWS
router.get("/", async (req, res) => {
  try {
    const workflows = await Workflow.find().populate("steps").sort({ createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE WORKFLOW
router.get("/:id", async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id).populate("steps");

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE WORKFLOW
router.put("/:id", async (req, res) => {
  try {
    const oldWorkflow = await Workflow.findById(req.params.id);

    if (!oldWorkflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const updatedWorkflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name ?? oldWorkflow.name,
        input_schema: req.body.input_schema ?? oldWorkflow.input_schema,
        is_active: req.body.is_active ?? oldWorkflow.is_active,
        version: oldWorkflow.version + 1,
      },
      { new: true }
    ).populate("steps");

    res.json({
      message: "Workflow updated successfully",
      workflow: updatedWorkflow,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE WORKFLOW
router.delete("/:id", async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    await Step.deleteMany({ workflow: workflow._id });

    const workflowSteps = workflow.steps || [];
    await Rule.deleteMany({ fromStep: { $in: workflowSteps } });
    await Execution.deleteMany({ workflow: workflow._id });

    await Workflow.findByIdAndDelete(req.params.id);

    res.json({ message: "Workflow deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;