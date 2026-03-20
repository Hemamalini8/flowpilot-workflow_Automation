const express = require("express");
const router = express.Router();

const Workflow = require("../models/workflow");
const Execution = require("../models/execution");
const Rule = require("../models/rule");

// helper function
function evaluateRule(fieldValue, operator, compareValue) {
  switch (operator) {
    case ">":
      return fieldValue > compareValue;
    case "<":
      return fieldValue < compareValue;
    case ">=":
      return fieldValue >= compareValue;
    case "<=":
      return fieldValue <= compareValue;
    case "==":
      return fieldValue == compareValue;
    case "!=":
      return fieldValue != compareValue;
    default:
      return false;
  }
}

// START WORKFLOW EXECUTION
router.post("/start", async (req, res) => {
  try {
    const { workflowId, data } = req.body;

    const workflow = await Workflow.findById(workflowId);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const steps = Array.isArray(workflow.steps) ? workflow.steps : [];
    const firstStep = steps[0];

    if (!firstStep) {
      return res.status(400).json({ message: "No steps found in this workflow" });
    }

    const execution = new Execution({
      workflow: workflow._id,
      currentStep: firstStep.id || firstStep._id || "step1",
      status: "in_progress",
      data: data || {},
      logs: [
        {
          message: `Execution started. Current step: ${firstStep.name || "Step 1"}`
        }
      ]
    });

    await execution.save();

    res.json({
      message: "Workflow execution started",
      execution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// APPROVE CURRENT STEP
router.post("/approve", async (req, res) => {
  try {
    const { executionId } = req.body;

    const execution = await Execution.findById(executionId);

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    if (execution.status === "completed") {
      return res.json({ message: "Workflow already completed", execution });
    }

    if (execution.status === "rejected") {
      return res.json({ message: "Workflow already rejected", execution });
    }

    const workflow = await Workflow.findById(execution.workflow);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const steps = Array.isArray(workflow.steps) ? workflow.steps : [];

    const currentIndex = steps.findIndex(
      (step) => String(step.id || step._id) === String(execution.currentStep)
    );

    if (currentIndex === -1) {
      return res.status(400).json({ message: "Current step not found in workflow" });
    }

    const currentStep = steps[currentIndex];

    execution.logs.push({
      message: `Step approved: ${currentStep.name || "Unknown Step"}`
    });

    // optional rule check
    let nextStep = null;

    const rule = await Rule.findOne({
      workflow: workflow._id
    });

    if (rule && rule.field && rule.operator) {
      const fieldValue = execution.data?.[rule.field];
      const matched = evaluateRule(fieldValue, rule.operator, rule.value);

      execution.logs.push({
        message: `Rule checked: ${rule.field} ${rule.operator} ${rule.value} = ${matched}`
      });

      if (matched && rule.trueNextStep) {
        nextStep = steps.find(
          (step) => String(step.id || step._id) === String(rule.trueNextStep)
        );
      } else if (!matched && rule.falseNextStep) {
        nextStep = steps.find(
          (step) => String(step.id || step._id) === String(rule.falseNextStep)
        );
      }
    }

    // fallback: move to next step in order
    if (!nextStep) {
      nextStep = steps[currentIndex + 1];
    }

    if (nextStep) {
      execution.currentStep = nextStep.id || nextStep._id || "step1";
      execution.status = "in_progress";
      execution.logs.push({
        message: `Moved to next step: ${nextStep.name || "Next Step"}`
      });
    } else {
      execution.status = "completed";
      execution.logs.push({
        message: "Workflow completed"
      });
    }

    await execution.save();

    res.json({
      message: "Step approved successfully",
      execution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REJECT CURRENT STEP
router.post("/reject", async (req, res) => {
  try {
    const { executionId } = req.body;

    const execution = await Execution.findById(executionId);

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    if (execution.status === "completed") {
      return res.json({ message: "Workflow already completed", execution });
    }

    if (execution.status === "rejected") {
      return res.json({ message: "Workflow already rejected", execution });
    }

    const workflow = await Workflow.findById(execution.workflow);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const steps = Array.isArray(workflow.steps) ? workflow.steps : [];
    const currentStep = steps.find(
      (step) => String(step.id || step._id) === String(execution.currentStep)
    );

    execution.status = "rejected";
    execution.logs.push({
      message: `Step rejected: ${currentStep ? currentStep.name : "Unknown Step"}`
    });

    await execution.save();

    res.json({
      message: "Workflow rejected successfully",
      execution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET EXECUTION BY ID
router.get("/:id", async (req, res) => {
  try {
    const execution = await Execution.findById(req.params.id).populate("workflow");

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL EXECUTIONS
router.get("/", async (req, res) => {
  try {
    const executions = await Execution.find()
      .populate("workflow")
      .sort({ createdAt: -1 });

    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;