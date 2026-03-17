import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function StepManager() {
  const { workflowId } = useParams();

  const [steps, setSteps] = useState([]);
  const [name, setName] = useState("");
  const [stepType, setStepType] = useState("approval");
  const [order, setOrder] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const api = "http://localhost:5000/api";

  const loadSteps = async () => {
    try {
      const res = await axios.get(`${api}/workflows/${workflowId}/steps`);
      setSteps(res.data);
    } catch (error) {
      console.log("Error loading steps:", error);
      setMessage("Failed to load steps");
    }
  };

  useEffect(() => {
    loadSteps();
  }, [workflowId]);

  const handleSaveStep = async () => {
    try {
      if (editingId) {
        await axios.put(`${api}/steps/${editingId}`, {
          name,
          step_type: stepType,
          order: Number(order),
          metadata: {},
        });
        setMessage("Step updated successfully");
      } else {
        await axios.post(`${api}/workflows/${workflowId}/steps`, {
          name,
          step_type: stepType,
          order: Number(order),
          metadata: {},
        });
        setMessage("Step created successfully");
      }

      setName("");
      setStepType("approval");
      setOrder("");
      setEditingId(null);
      loadSteps();
    } catch (error) {
      console.log("Error saving step:", error);
      setMessage("Failed to save step");
    }
  };

  const handleEdit = (step) => {
    setName(step.name);
    setStepType(step.step_type || "approval");
    setOrder(step.order);
    setEditingId(step._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${api}/steps/${id}`);
      setMessage("Step deleted successfully");
      loadSteps();
    } catch (error) {
      console.log("Error deleting step:", error);
      setMessage("Failed to delete step");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Step Manager</p>
            <h1>Create and manage workflow steps.</h1>
            <p className="hero-text">
              Add, edit, and delete workflow steps including step type and
              execution order.
            </p>
          </div>
        </section>

        {message && <div className="message-box">{message}</div>}

        <div className="dashboard-grid">
          <div className="left-panel">
            <div className="card">
              <div className="section-header">
                <h2>{editingId ? "Edit Step" : "Add Step"}</h2>
              </div>

              <label>Step Name</label>
              <input
                type="text"
                placeholder="Enter step name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label>Step Type</label>
              <select
                value={stepType}
                onChange={(e) => setStepType(e.target.value)}
              >
                <option value="task">Task</option>
                <option value="approval">Approval</option>
                <option value="notification">Notification</option>
              </select>

              <label>Order</label>
              <input
                type="number"
                placeholder="Enter order"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />

              <button className="start-btn" onClick={handleSaveStep}>
                {editingId ? "Update Step" : "Create Step"}
              </button>
            </div>
          </div>

          <div className="right-panel">
            <div className="card">
              <div className="section-header">
                <h2>Workflow Steps</h2>
                <span className="pill blue">{steps.length}</span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((step) => (
                      <tr key={step._id}>
                        <td>{step.name}</td>
                        <td>{step.step_type || "approval"}</td>
                        <td>{step.order}</td>
                        <td>
                          <button
                            className="table-link-btn"
                            onClick={() => handleEdit(step)}
                            style={{
                              marginRight: "8px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>

                          <a
                            href={`/workflow-rules/${workflowId}/${step._id}`}
                            className="table-link-btn"
                            style={{
                              marginRight: "8px",
                              background: "#f59e0b",
                              textDecoration: "none",
                            }}
                          >
                            Rules
                          </a>

                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(step._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {steps.length === 0 && (
                  <p className="empty-text" style={{ marginTop: "16px" }}>
                    No steps found.
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

export default StepManager;
