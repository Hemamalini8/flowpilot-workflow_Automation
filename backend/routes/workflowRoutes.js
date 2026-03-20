const express = require("express");
const router = express.Router();
const Workflow = require("../models/workflow");
const Step = require("../models/step");
const Rule = require("../models/rule");
const Execution = require("../models/execution");

// CREATE WORKFLOW
router.post("/", async (req, res) => {
  try {
    const { name, input_schema, steps, start_step_id } = req.body;

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
      steps: Array.isArray(steps) ? steps : [],
      start_step_id:
        start_step_id ||
        (Array.isArray(steps) && steps.length > 0 ? steps[0].step_id : null),
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
    const { search = "", status = "" } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (status === "active") {
      query.is_active = true;
    } else if (status === "inactive") {
      query.is_active = false;
    }

    const workflows = await Workflow.find(query).sort({ createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE WORKFLOW
router.get("/:id", async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

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
        start_step_id: req.body.start_step_id ?? oldWorkflow.start_step_id,
        steps: req.body.steps ?? oldWorkflow.steps,
        version: oldWorkflow.version + 1,
      },
      { new: true }
    );

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
    await Rule.deleteMany({ workflow: workflow._id });
    await Execution.deleteMany({ workflow: workflow._id });
    await Workflow.findByIdAndDelete(req.params.id);

    res.json({ message: "Workflow deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;