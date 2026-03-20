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
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const api = "https://flowpilot-workflow-automation.onrender.com/api";

  const loadRules = async () => {
    if (!stepId) return;

    try {
      const res = await axios.get(`${api}/steps/${stepId}/rules`);
      setRules(Array.isArray(res.data) ? res.data : []);
      setMessage("");
    } catch (error) {
      console.log("Error loading rules:", error);
      setMessage(error?.response?.data?.message || "Failed to load rules");
    }
  };

  const loadSteps = async () => {
    if (!workflowId) return;

    try {
      const res = await axios.get(`${api}/workflows/${workflowId}/steps`);
      setSteps(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Error loading steps:", error);
      setMessage(error?.response?.data?.message || "Failed to load steps");
    }
  };

  useEffect(() => {
    if (workflowId && stepId) {
      loadRules();
      loadSteps();
    } else {
      setMessage("Workflow id or step id missing");
    }
  }, [workflowId, stepId]);

  const resetForm = () => {
    setCondition("");
    setNextStepId("");
    setPriority("");
    setEditingId(null);
  };

  const handleSaveRule = async () => {
    if (!condition.trim() || !priority) {
      setMessage("Condition and priority are required");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${api}/rules/${editingId}`, {
          condition: condition.trim(),
          next_step_id: nextStepId || null,
          priority: Number(priority),
        });
        setMessage("Rule updated successfully");
      } else {
        await axios.post(`${api}/steps/${stepId}/rules`, {
          workflowId,
          condition: condition.trim(),
          next_step_id: nextStepId || null,
          priority: Number(priority),
        });
        setMessage("Rule created successfully");
      }

      resetForm();
      loadRules();
    } catch (error) {
      console.log("Error saving rule:", error);
      setMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to save rule"
      );
    }
  };

  const handleEdit = (rule) => {
    setCondition(rule.condition || "");
    setNextStepId(rule.next_step_id || "");
    setPriority(rule.priority || "");
    setEditingId(rule._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${api}/rules/${id}`);
      setMessage("Rule deleted successfully");
      loadRules();
    } catch (error) {
      console.log("Error deleting rule:", error);
      setMessage("Failed to delete rule");
    }
  };

  const getStepName = (targetStepId) => {
    if (!targetStepId) return "End Workflow";

    const found = steps.find((step, index) => {
      const idValue =
        step?.step_id || step?.id || step?._id?.toString() || `step${index + 1}`;
      return String(idValue) === String(targetStepId);
    });

    return found?.name || targetStepId;
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Rule Editor</p>
            <h1>Define next-step logic</h1>
            <p className="hero-text">
              Create and manage rules for this step.
            </p>
          </div>
        </section>

        {message && <div className="message-box">{message}</div>}

        <div className="dashboard-grid">
          <div className="left-panel">
            <div className="card">
              <div className="section-header">
                <h2>{editingId ? "Edit Rule" : "Add Rule"}</h2>
              </div>

              <label>Condition</label>
              <input
                type="text"
                placeholder={`Example: amount > 100 && country == 'US'`}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />

              <label>Next Step</label>
              <select
                value={nextStepId}
                onChange={(e) => setNextStepId(e.target.value)}
              >
                <option value="">End Workflow</option>
                {steps.map((step, index) => {
                  const value =
                    step?.step_id || step?.id || step?._id?.toString() || `step${index + 1}`;

                  return (
                    <option key={value} value={value}>
                      {step.name}
                    </option>
                  );
                })}
              </select>

              <label>Priority</label>
              <input
                type="number"
                placeholder="1 = highest"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />

              <div className="button-group">
                <button className="start-btn" onClick={handleSaveRule}>
                  {editingId ? "Update Rule" : "Create Rule"}
                </button>

                <button className="reject-btn" onClick={() => navigate(-1)}>
                  Back
                </button>
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="card">
              <div className="section-header">
                <h2>Rules</h2>
                <span className="pill blue">{rules.length}</span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="workflow-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Condition</th>
                      <th>Next Step</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-row">
                          No rules found.
                        </td>
                      </tr>
                    ) : (
                      rules.map((rule) => (
                        <tr key={rule._id}>
                          <td>{rule.priority}</td>
                          <td>{rule.condition}</td>
                          <td>{getStepName(rule.next_step_id)}</td>
                          <td>
                            <button
                              className="edit-btn workflow-action-btn"
                              onClick={() => handleEdit(rule)}
                              style={{ marginRight: "8px" }}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn workflow-action-btn"
                              onClick={() => handleDelete(rule._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RuleEditor;