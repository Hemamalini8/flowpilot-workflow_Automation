import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function WorkflowList() {
  const [workflows, setWorkflows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const api = "https://flowpilot-workflow-automation.onrender.com/api";

  const loadWorkflows = async () => {
    try {
      const res = await axios.get(`${api}/workflows`);
      setWorkflows(Array.isArray(res.data) ? res.data : []);
      setMessage("");
    } catch (error) {
      console.log("Error loading workflows:", error);
      setMessage("Failed to load workflows");
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleDeleteWorkflow = async (workflowId) => {
    try {
      await axios.delete(`${api}/workflows/${workflowId}`);
      setMessage("Workflow deleted successfully");
      loadWorkflows();
    } catch (error) {
      console.log("Error deleting workflow:", error);
      setMessage(error?.response?.data?.message || "Failed to delete workflow");
    }
  };

  const handleToggleStatus = async (workflow) => {
    try {
      await axios.put(`${api}/workflows/${workflow._id}`, {
        name: workflow.name,
        input_schema: workflow.input_schema,
        is_active: !workflow.is_active,
        start_step_id: workflow.start_step_id,
        steps: workflow.steps || [],
      });

      setMessage("Workflow status updated successfully");
      loadWorkflows();
    } catch (error) {
      console.log("Error updating workflow status:", error);
      setMessage(error?.response?.data?.message || "Failed to update workflow");
    }
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? workflow.is_active
        : !workflow.is_active;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-page">
      <div className="container">
        <section
          className="hero"
          style={{ maxWidth: "980px", margin: "0 auto 20px auto" }}
        >
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

        <div
          className="card workflow-list-card"
          style={{ maxWidth: "980px", margin: "0 auto" }}
        >
          <div className="section-header">
            <h2>All Workflows</h2>
            <button
              className="refresh-btn"
              onClick={() => navigate("/workflow-editor")}
            >
              Create Workflow
            </button>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search workflow by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: "180px" }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

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
                          {Array.isArray(workflow.steps) ? workflow.steps.length : 0}
                        </span>
                      </td>

                      <td>
                        <span className="version-badge">
                          v{workflow.version || 1}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status ${
                            workflow.is_active ? "completed" : "rejected"
                          }`}
                        >
                          {workflow.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="workflow-action-group">
                          <button
                            className="edit-btn workflow-action-btn"
                            onClick={() =>
                              navigate(`/workflow-editor/${workflow._id}`)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="step-btn workflow-action-btn"
                            onClick={() => navigate(`/steps/${workflow._id}`)}
                          >
                            Steps
                          </button>

                          <button
                            className="step-btn workflow-action-btn"
                            onClick={() =>
                              handleToggleStatus(workflow)
                            }
                          >
                            {workflow.is_active ? "Stop" : "Start"}
                          </button>

                          <button
                            className="delete-btn workflow-action-btn"
                            onClick={() => handleDeleteWorkflow(workflow._id)}
                          >
                            Delete
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