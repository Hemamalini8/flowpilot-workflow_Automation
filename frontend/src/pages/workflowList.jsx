import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function WorkflowList() {
  const [workflows, setWorkflows] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const api = "https://flowpilot-workflow-automation.onrender.com";
  const loadWorkflows = async () => {
    try {
      const res = await axios.get(`${api}/workflows`);
      setWorkflows(res.data);
    } catch (error) {
      console.log("Error loading workflows:", error);
      setMessage("Failed to load workflows");
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero" style={{ maxWidth: "980px", margin: "0 auto 20px auto" }}>
          <div className="hero-left">
            <p className="mini-title">Workflow List</p>
            <h1>Manage all workflows from one place.</h1>
            <p className="hero-text">
              View workflow details, search workflows, and open the editor to
              create or update workflow configurations.
            </p>
          </div>
        </section>

        {message && <div className="message-box">{message}</div>}

        <div className="card workflow-list-card" style={{ maxWidth: "980px", margin: "0 auto" }}>
          <div className="section-header">
            <h2>All Workflows</h2>
            <button
              className="refresh-btn"
              onClick={() => navigate("/workflow-editor")}
            >
              Create Workflow
            </button>
          </div>

          <input
            type="text"
            placeholder="Search workflow by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: "20px" }}
          />

          <div className="workflow-table-wrapper">
            <table className="workflow-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Steps</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      No workflows found.
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map((workflow) => (
                    <tr key={workflow._id}>
                      <td className="workflow-id-cell">
                        <span className="workflow-id-badge">
                          {workflow._id.slice(-6)}
                        </span>
                      </td>

                      <td className="workflow-name-cell">{workflow.name}</td>

                      <td>
                        <span className="count-badge">
                          {workflow.steps?.length || 0}
                        </span>
                      </td>

                      <td>
                        <span className="version-badge">
                          v{workflow.version || 1}
                        </span>
                      </td>

                      <td>
                        <span className={`status ${workflow.is_active ? "completed" : "rejected"}`}>
                          {workflow.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="workflow-action-group">
                          <button
                            className="edit-btn workflow-action-btn"
                            onClick={() => navigate(`/workflow-editor/${workflow._id}`)}
                          >
                            Edit
                          </button>

                          <button
                            className="step-btn workflow-action-btn"
                            onClick={() => navigate(`/steps/${workflow._id}`)}
                          >
                            Steps
                          </button>
                        </div>
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
  );
}

export default WorkflowList;