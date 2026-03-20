import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function RuleEditor() {
  const { workflowId, stepId } = useParams();
  const navigate = useNavigate();

  const [rules, setRules] = useState([]);
  const [steps, setSteps] = useState([]);
  const [condition, setCondition] = useState("");
  const [nextStepId, setNextStepId] = useState("");
  const [priority, setPriority] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const api = "https://flowpilot-workflow-automation.onrender.com/api";

  const loadSteps = async () => {
    try {
      const res = await axios.get(`${api}/workflows/${workflowId}/steps`);
      setSteps(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      setMessage("Failed to load steps");
    }
  };

  const loadRules = async () => {
    try {
      const res = await axios.get(`${api}/steps/${stepId}/rules`);
      setRules(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      setMessage("Failed to load rules");
    }
  };

  useEffect(() => {
    if (workflowId && stepId) {
      loadSteps();
      loadRules();
    } else {
      setMessage("Workflow id or step id missing");
    }
  }, [workflowId, stepId]);

  const clearForm = () => {
    setCondition("");
    setNextStepId("");
    setPriority("");
    setEditingId("");
  };

  const saveRule = async () => {
    if (!condition.trim()) {
      setMessage("Condition is required");
      return;
    }

    if (!priority) {
      setMessage("Priority is required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        condition: condition.trim(),
        next_step_id: nextStepId || null,
        priority: Number(priority),
      };

      if (editingId) {
        await axios.put(`${api}/rules/${editingId}`, payload);
        setMessage("Rule updated successfully");
      } else {
        await axios.post(`${api}/steps/${stepId}/rules`, payload);
        setMessage("Rule created successfully");
      }

      clearForm();
      await loadRules();
    } catch (error) {
      console.log(error);
      setMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to save rule"
      );
    } finally {
      setLoading(false);
    }
  };

  const editRule = (rule) => {
    setEditingId(rule._id || "");
    setCondition(rule.condition || "");
    setPriority(rule.priority || "");
    setNextStepId(
      typeof rule.next_step_id === "object"
        ? rule.next_step_id?._id || ""
        : rule.next_step_id || ""
    );
  };

  const deleteRule = async (id) => {
    try {
      await axios.delete(`${api}/rules/${id}`);
      setMessage("Rule deleted successfully");
      await loadRules();
    } catch (error) {
      console.log(error);
      setMessage("Failed to delete rule");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Rule Editor</p>
            <h1>Save rules for this step</h1>
            <p className="hero-text">
              Add condition, next step, and priority.
            </p>
          </div>
        </section>

        {message && <div className="message-box">{message}</div>}

        <div className="card" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="section-header">
            <h2>{editingId ? "Edit Rule" : "Add Rule"}</h2>
            <span className="pill blue">{rules.length}</span>
          </div>

          <p className="muted" style={{ marginBottom: "10px" }}>
            Step ID: {stepId || "-"}
          </p>

          <label>Condition</label>
          <input
            type="text"
            placeholder="Example: amount > 100 && country == 'US'"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />

          <label>Next Step</label>
          <select
            value={nextStepId}
            onChange={(e) => setNextStepId(e.target.value)}
          >
            <option value="">End Workflow</option>
            {steps.map((step) => (
              <option key={step._id} value={step.step_id}>
                {step.name}
              </option>
            ))}
          </select>

          <label>Priority</label>
          <input
            type="number"
            placeholder="1 = highest"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />

          <div className="button-group" style={{ marginTop: "16px" }}>
            <button className="start-btn" onClick={saveRule} disabled={loading}>
              {loading ? "Processing..." : editingId ? "Update Rule" : "Create Rule"}
            </button>

            <button className="edit-btn workflow-action-btn" onClick={clearForm}>
              Clear
            </button>

            <button className="reject-btn" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          <div className="history-list" style={{ marginTop: "24px" }}>
            {rules.length === 0 ? (
              <p className="empty-text">No rules found.</p>
            ) : (
              rules.map((rule) => (
                <div key={rule._id} className="history-card">
                  <div className="history-top">
                    <span className="history-id">Priority: {rule.priority}</span>
                  </div>

                  <p className="muted">
                    <strong>Condition:</strong> {rule.condition}
                  </p>

                  <p className="muted">
                    <strong>Next Step:</strong>{" "}
                    {typeof rule.next_step_id === "object"
                      ? rule.next_step_id?.name || "End Workflow"
                      : rule.next_step_id || "End Workflow"}
                  </p>

                  <div
                    className="workflow-action-group"
                    style={{ marginTop: "12px" }}
                  >
                    <button
                      className="edit-btn workflow-action-btn"
                      onClick={() => editRule(rule)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn workflow-action-btn"
                      onClick={() => deleteRule(rule._id)}
                    >
                      Delete
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

export default RuleEditor;