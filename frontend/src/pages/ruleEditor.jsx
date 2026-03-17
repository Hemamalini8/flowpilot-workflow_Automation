import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function RuleEditor() {
  const { stepId, workflowId } = useParams();

  const [rules, setRules] = useState([]);
  const [steps, setSteps] = useState([]);
  const [condition, setCondition] = useState("");
  const [nextStepId, setNextStepId] = useState("");
  const [priority, setPriority] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const api = "http://localhost:5000/api";

  const loadRules = async () => {
    try {
      const res = await axios.get(`${api}/steps/${stepId}/rules`);
      setRules(res.data);
    } catch (error) {
      console.log("Error loading rules:", error);
      setMessage("Failed to load rules");
    }
  };

  const loadSteps = async () => {
    try {
      const res = await axios.get(`${api}/workflows/${workflowId}/steps`);
      setSteps(res.data);
    } catch (error) {
      console.log("Error loading steps:", error);
    }
  };

  useEffect(() => {
    loadRules();
    loadSteps();
  }, [stepId, workflowId]);

  const handleSaveRule = async () => {
    try {
      if (editingId) {
        await axios.put(`${api}/rules/${editingId}`, {
          condition,
          next_step_id: nextStepId || null,
          priority: Number(priority),
        });
        setMessage("Rule updated successfully");
      } else {
        await axios.post(`${api}/steps/${stepId}/rules`, {
          condition,
          next_step_id: nextStepId || null,
          priority: Number(priority),
        });
        setMessage("Rule created successfully");
      }

      setCondition("");
      setNextStepId("");
      setPriority("");
      setEditingId(null);
      loadRules();
    } catch (error) {
      console.log("Error saving rule:", error);
      setMessage("Failed to save rule");
    }
  };

  const handleEdit = (rule) => {
    setCondition(rule.condition);
    setNextStepId(rule.next_step_id?._id || "");
    setPriority(rule.priority);
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

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Rule Editor</p>
            <h1>Define next-step logic for this workflow step.</h1>
            <p className="hero-text">
              Add, edit, and delete routing rules using conditions, next steps, and priority order.
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
                placeholder='Example: amount > 5000 && country == "US"'
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
                  <option key={step._id} value={step._id}>
                    {step.name}
                  </option>
                ))}
              </select>

              <label>Priority</label>
              <input
                type="number"
                placeholder="Enter priority (1 = highest)"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />

              <button className="start-btn" onClick={handleSaveRule}>
                {editingId ? "Update Rule" : "Create Rule"}
              </button>
            </div>
          </div>

          <div className="right-panel">
            <div className="card">
              <div className="section-header">
                <h2>Step Rules</h2>
                <span className="pill blue">{rules.length}</span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Condition</th>
                      <th>Next Step</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule._id}>
                        <td>{rule.priority}</td>
                        <td>{rule.condition}</td>
                        <td>{rule.next_step_id?.name || "End Workflow"}</td>
                        <td>
                          <button
                            className="table-link-btn"
                            onClick={() => handleEdit(rule)}
                            style={{ marginRight: "8px", border: "none", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(rule._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {rules.length === 0 && (
                  <p className="empty-text" style={{ marginTop: "16px" }}>
                    No rules found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RuleEditor;