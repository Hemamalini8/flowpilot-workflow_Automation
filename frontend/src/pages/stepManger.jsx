import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function StepManager() {
  const { workflowId, id } = useParams();
  const currentWorkflowId = workflowId || id;
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [newStepName, setNewStepName] = useState("");
  const [newStepType, setNewStepType] = useState("task");
  const [message, setMessage] = useState("");

  const api = "https://flowpilot-workflow-automation.onrender.com/api";

  const loadWorkflow = async () => {
    try {
      const res = await axios.get(`${api}/workflows/${currentWorkflowId}`);
      setWorkflow(res.data || null);
    } catch (error) {
      console.log("Error loading workflow:", error);
      setMessage("Failed to load workflow");
    }
  };

  const loadSteps = async () => {
    try {
      const res = await axios.get(`${api}/workflows/${currentWorkflowId}/steps`);
      setSteps(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error loading steps:", error);
      setMessage("Failed to load steps");
    }
  };

  useEffect(() => {
    if (currentWorkflowId) {
      loadWorkflow();
      loadSteps();
    }
  }, [currentWorkflowId]);

  const addStep = async () => {
    if (!newStepName.trim()) {
      setMessage("Step name is required");
      return;
    }

    try {
      await axios.post(`${api}/workflows/${currentWorkflowId}/steps`, {
        name: newStepName.trim(),
        step_type: newStepType,
        order: steps.length + 1,
        metadata: {},
      });

      setNewStepName("");
      setNewStepType("task");
      setMessage("Step added successfully");
      await loadWorkflow();
      await loadSteps();
    } catch (error) {
      console.log("Error adding step:", error);
      setMessage(error?.response?.data?.message || "Failed to add step");
    }
  };

  const deleteStep = async (id) => {
    try {
      await axios.delete(`${api}/steps/${id}`);
      setMessage("Step deleted successfully");
      await loadWorkflow();
      await loadSteps();
    } catch (error) {
      console.log("Error deleting step:", error);
      setMessage(error?.response?.data?.message || "Failed to delete step");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Step Manager</p>
            <h1>Manage workflow steps</h1>
            <p className="hero-text">
              Add, remove, and manage workflow steps for this workflow.
            </p>
          </div>
        </section>

        {message && <div className="message-box">{message}</div>}

        <div className="card" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="section-header">
            <h2>Workflow: {workflow?.name || "Loading..."}</h2>
            <span className="pill blue">{steps.length}</span>
          </div>

          <label>Step Name</label>
          <input
            type="text"
            placeholder="Enter step name"
            value={newStepName}
            onChange={(e) => setNewStepName(e.target.value)}
          />

          <label>Step Type</label>
          <select
            value={newStepType}
            onChange={(e) => setNewStepType(e.target.value)}
          >
            <option value="task">Task</option>
            <option value="approval">Approval</option>
            <option value="notification">Notification</option>
          </select>

          <button
            className="start-btn"
            onClick={addStep}
            style={{ marginTop: "16px", marginBottom: "24px" }}
          >
            Add Step
          </button>

          <div className="history-list">
            {steps.length === 0 ? (
              <p className="empty-text">No steps found.</p>
            ) : (
              steps.map((step, index) => (
                <div key={step._id || step.step_id} className="history-card">
                  <div className="history-top">
                    <span className="history-id">
                      {index + 1}. {step.name}
                    </span>
                    <span className="pill blue">{step.step_type}</span>
                  </div>

                  <p className="muted">
                    <strong>Step ID:</strong> {step.step_id || "-"}
                  </p>

                  <div
                    className="workflow-action-group"
                    style={{ marginTop: "12px" }}
                  >
                    <button
                      className="edit-btn workflow-action-btn"
                      onClick={() =>
                        navigate(`/rules/${currentWorkflowId}/${step.step_id}`)
                      }
                    >
                      Rules
                    </button>

                    <button
                      className="delete-btn workflow-action-btn"
                      onClick={() => deleteStep(step._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepManager;