const express = require("express");
const router = express.Router();

const Workflow = require("../models/workflow");
const Execution = require("../models/execution");
const Rule = require("../models/rule");

function getStepId(step, index) {
  if (!step) return `step${index + 1}`;
  return step.step_id || step.id || step._id?.toString() || `step${index + 1}`;
}

function getStepName(step, index) {
  if (!step) return `Step ${index + 1}`;
  return step.name || step.step_id || step.id || `Step ${index + 1}`;
}

function evaluateCondition(condition, data) {
  if (!condition || condition.trim() === "") return false;
  if (condition.trim().toUpperCase() === "DEFAULT") return true;

  try {
    let expression = condition;

    expression = expression.replace(
      /\bcontains\((\w+),\s*['"]([^'"]+)['"]\)/g,
      (_, field, value) =>
        `(String(data["${field}"] || "").includes("${value}"))`
    );

    expression = expression.replace(
      /\bstartsWith\((\w+),\s*['"]([^'"]+)['"]\)/g,
      (_, field, value) =>
        `(String(data["${field}"] || "").startsWith("${value}"))`
    );

    expression = expression.replace(
      /\bendsWith\((\w+),\s*['"]([^'"]+)['"]\)/g,
      (_, field, value) =>
        `(String(data["${field}"] || "").endsWith("${value}"))`
    );

    expression = expression.replace(
      /\b(amount|country|department|priority)\b/g,
      'data["$1"]'
    );

    // eslint-disable-next-line no-new-func
    return Function("data", `return (${expression});`)(data || {});
  } catch (error) {
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

    if (steps.length === 0) {
      return res.status(400).json({ message: "No steps found in this workflow" });
    }

    const firstStep =
      steps.find(
        (step, index) =>
          String(getStepId(step, index)) === String(workflow.start_step_id)
      ) || steps[0];

    const firstStepIndex = steps.findIndex(
      (step, index) =>
        String(getStepId(step, index)) === String(getStepId(firstStep, index))
    );

    const execution = new Execution({
      workflow: workflow._id,
      workflow_version: workflow.version || 1,
      currentStep: getStepId(firstStep, firstStepIndex >= 0 ? firstStepIndex : 0),
      status: "in_progress",
      data: data || {},
      retries: 0,
      started_at: new Date(),
      logs: [
        {
          message: `Execution started. Current step: ${getStepName(
            firstStep,
            firstStepIndex >= 0 ? firstStepIndex : 0
          )}`,
          timestamp: new Date(),
        },
      ],
    });

    await execution.save();

    res.json({
      message: "Workflow execution started",
      execution,
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

    if (steps.length === 0) {
      return res.status(400).json({ message: "No steps found in workflow" });
    }

    const currentIndex = steps.findIndex(
      (step, index) =>
        String(getStepId(step, index)) === String(execution.currentStep)
    );

    if (currentIndex === -1) {
      return res.status(400).json({ message: "Current step not found in workflow" });
    }

    const currentStep = steps[currentIndex];

    execution.logs.push({
      message: `Step approved: ${getStepName(currentStep, currentIndex)}`,
      timestamp: new Date(),
    });

    let nextStep = null;

    const rules = await Rule.find({
      workflow: workflow._id,
      step_id: getStepId(currentStep, currentIndex),
    }).sort({ priority: 1 });

    if (rules.length > 0) {
      for (const rule of rules) {
        const matched = evaluateCondition(rule.condition, execution.data || {});

        execution.logs.push({
          message: `Rule checked: ${rule.condition} = ${matched}`,
          timestamp: new Date(),
        });

        if (matched) {
          if (rule.next_step_id) {
            nextStep = steps.find(
              (step, index) =>
                String(getStepId(step, index)) === String(rule.next_step_id)
            );
          } else {
            nextStep = null;
          }
          break;
        }
      }
    }

    if (!rules.length && !nextStep) {
      nextStep = steps[currentIndex + 1];
    }

    if (nextStep) {
      const nextIndex = steps.findIndex(
        (step, index) =>
          String(getStepId(step, index)) ===
          String(getStepId(nextStep, index))
      );

      execution.currentStep = getStepId(
        nextStep,
        nextIndex >= 0 ? nextIndex : currentIndex + 1
      );
      execution.status = "in_progress";

      execution.logs.push({
        message: `Moved to next step: ${getStepName(
          nextStep,
          nextIndex >= 0 ? nextIndex : currentIndex + 1
        )}`,
        timestamp: new Date(),
      });
    } else {
      execution.status = "completed";
      execution.ended_at = new Date();

      execution.logs.push({
        message: "Workflow completed",
        timestamp: new Date(),
      });
    }

    await execution.save();

    res.json({
      message: "Step approved successfully",
      execution,
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
    const currentIndex = steps.findIndex(
      (step, index) =>
        String(getStepId(step, index)) === String(execution.currentStep)
    );

    const currentStep = currentIndex >= 0 ? steps[currentIndex] : null;

    execution.status = "rejected";
    execution.ended_at = new Date();

    execution.logs.push({
      message: `Step rejected: ${
        currentStep ? getStepName(currentStep, currentIndex) : "Unknown Step"
      }`,
      timestamp: new Date(),
    });

    await execution.save();

    res.json({
      message: "Workflow rejected successfully",
      execution,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RETRY EXECUTION
router.post("/:id/retry", async (req, res) => {
  try {
    const execution = await Execution.findById(req.params.id);

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    execution.status = "in_progress";
    execution.retries = (execution.retries || 0) + 1;
    execution.ended_at = null;

    execution.logs.push({
      message: `Execution retried. Retry count: ${execution.retries}`,
      timestamp: new Date(),
    });

    await execution.save();

    res.json({
      message: "Execution retried successfully",
      execution,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CANCEL EXECUTION
router.post("/:id/cancel", async (req, res) => {
  try {
    const execution = await Execution.findById(req.params.id);

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    execution.status = "canceled";
    execution.ended_at = new Date();

    execution.logs.push({
      message: "Execution canceled",
      timestamp: new Date(),
    });

    await execution.save();

    res.json({
      message: "Execution canceled successfully",
      execution,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET EXECUTION BY ID
router.get("/:id", async (req, res) => {
  try {
    const execution = await Execution.findById(req.params.id);

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
    const executions = await Execution.find().sort({ createdAt: -1 });
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;