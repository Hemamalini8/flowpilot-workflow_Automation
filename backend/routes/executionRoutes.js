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

    const workflow = await Workflow.findById(workflowId).populate("steps");

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const sortedSteps = workflow.steps.sort((a, b) => a.order - b.order);
    const firstStep = sortedSteps[0];

    if (!firstStep) {
      return res.status(400).json({ message: "No steps found in this workflow" });
    }

    const execution = new Execution({
      workflow: workflow._id,
      currentStep: firstStep._id,
      status: "in_progress",
      data: data || {},
      logs: [
        {
          message: `Execution started. Current step: ${firstStep.name}`
        }
      ]
    });

    await execution.save();
    await execution.populate("currentStep");

    res.json({
      message: "Workflow execution started",
      execution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// APPROVE CURRENT STEP WITH RULE CHECK
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

    const workflow = await Workflow.findById(execution.workflow).populate("steps");

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const sortedSteps = workflow.steps.sort((a, b) => a.order - b.order);

    const currentIndex = sortedSteps.findIndex(
      (step) => step._id.toString() === execution.currentStep.toString()
    );

    if (currentIndex === -1) {
      return res.status(400).json({ message: "Current step not found in workflow" });
    }

    const currentStep = sortedSteps[currentIndex];

    execution.logs.push({
      message: `Step approved: ${currentStep.name}`
    });

    const rule = await Rule.findOne({
      workflow: workflow._id,
      fromStep: currentStep._id
    });

    let nextStep = null;

    if (rule) {
      const fieldValue = execution.data[rule.field];
      const matched = evaluateRule(fieldValue, rule.operator, rule.value);

      execution.logs.push({
        message: `Rule checked: ${rule.field} ${rule.operator} ${rule.value} = ${matched}`
      });

      if (matched) {
        nextStep = workflow.steps.find(
          (step) => step._id.toString() === rule.trueNextStep.toString()
        );
      } else if (rule.falseNextStep) {
        nextStep = workflow.steps.find(
          (step) => step._id.toString() === rule.falseNextStep.toString()
        );
      }
    } else {
      nextStep = sortedSteps[currentIndex + 1];
    }

    if (nextStep) {
      execution.currentStep = nextStep._id;
      execution.status = "in_progress";
      execution.logs.push({
        message: `Moved to next step: ${nextStep.name}`
      });
    } else {
      execution.status = "completed";
      execution.logs.push({
        message: "Workflow completed"
      });
    }

    await execution.save();
    await execution.populate("currentStep");

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

    const workflow = await Workflow.findById(execution.workflow).populate("steps");

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const currentStep = workflow.steps.find(
      (step) => step._id.toString() === execution.currentStep.toString()
    );

    execution.status = "rejected";

    execution.logs.push({
      message: `Step rejected: ${currentStep ? currentStep.name : "Unknown Step"}`
    });

    await execution.save();
    await execution.populate("currentStep");

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
    const execution = await Execution.findById(req.params.id)
      .populate("workflow")
      .populate("currentStep");

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
      .populate("currentStep")
      .sort({ createdAt: -1 });

    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;