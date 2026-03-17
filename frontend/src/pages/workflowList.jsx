import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function WorkflowList() {
  const [workflows, setWorkflows] = useState([]);
  const [search, setSearch] = useState("");

  const api = "http://localhost:5000/api";

  const loadWorkflows = async () => {
    try {
      const res = await axios.get(`${api}/workflows`);
      setWorkflows(res.data);
    } catch (error) {
      console.log("Error loading workflows:", error);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Workflow List</p>
            <h1>Manage all workflows from one place.</h1>
            <p className="hero-text">
              View workflow details, search workflows, and open the editor to
              create or update workflow configurations.
            </p>
          </div>
        </section>

        <div className="card">
          <div className="section-header">
            <h2>All Workflows</h2>
            <Link to="/workflow-editor" className="primary-btn">
              Create Workflow
            </Link>
          </div>

          <input
            type="text"
            placeholder="Search workflow by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div style={{ overflowX: "auto", marginTop: "18px" }}>
            <table className="audit-table">
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
                {filteredWorkflows.map((workflow) => (
                  <tr key={workflow._id}>
                    <td>{workflow._id}</td>
                    <td>{workflow.name}</td>
                    <td>{workflow.steps?.length || 0}</td>
                    <td>{workflow.version}</td>
                    <td>{workflow.is_active ? "Active" : "Inactive"}</td>
                    <td>
                      <Link
                        to={`/workflow-editor/${workflow._id}`}
                        className="table-link-btn"
                        style={{ marginRight: "8px" }}
                      >
                        Edit
                      </Link>

                      <Link
                        to={`/workflow-steps/${workflow._id}`}
                        className="table-link-btn"
                        style={{ background: "#10b981" }}
                      >
                        Steps
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredWorkflows.length === 0 && (
              <p className="empty-text" style={{ marginTop: "16px" }}>
                No workflows found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowList;
