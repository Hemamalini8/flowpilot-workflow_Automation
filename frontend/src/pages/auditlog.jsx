import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function AuditLog() {
  const [executions, setExecutions] = useState([]);
  const [message, setMessage] = useState("");

  const api = "https://flowpilot-workflow-automation.onrender.com/api";

  const loadExecutions = async () => {
    try {
      const res = await axios.get(`${api}/executions`);
      setExecutions(Array.isArray(res.data) ? res.data : []);
      setMessage("");
    } catch (error) {
      console.log("Error loading audit logs:", error);
      setMessage("Failed to load audit logs");
    }
  };

  useEffect(() => {
    loadExecutions();
  }, []);

  const getStatusClass = (status) => {
    if (status === "completed") return "status completed";
    if (status === "rejected") return "status rejected";
    return "status progress";
  };

  const getWorkflowName = (exec) => {
    if (exec?.workflow && typeof exec.workflow === "object") {
      return exec.workflow.name || "-";
    }
    return "Loan Approval";
  };

  const getCurrentStepName = (exec) => {
    if (!exec) return "-";
    if (exec.status === "completed") return "Completed";
    if (exec.status === "rejected") return "Rejected";
    return exec.currentStep || "-";
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <section
          className="hero"
          style={{ maxWidth: "1080px", margin: "0 auto 20px auto" }}
        >
          <div className="hero-left">
            <p className="mini-title">Audit Log</p>
            <h1>Track all workflow executions for monitoring and compliance.</h1>
            <p className="hero-text">
              Review workflow runs, status, current step, and execution details
              in one place.
            </p>
          </div>
        </section>

        {message && <div className="message-box">{message}</div>}

        <div
          className="card audit-log-card"
          style={{ maxWidth: "1080px", margin: "0 auto" }}
        >
          <div className="section-header">
            <h2>Execution Audit Table</h2>
            <span className="pill blue">{executions.length}</span>
          </div>

          <div className="workflow-table-wrapper">
            <table className="workflow-table audit-clean-table">
              <thead>
                <tr>
                  <th>Execution ID</th>
                  <th>Status</th>
                  <th>Workflow</th>
                  <th>Current Step</th>
                  <th>Amount</th>
                  <th>Country</th>
                  <th>Priority</th>
                </tr>
              </thead>

              <tbody>
                {executions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  executions.map((exec) => (
                    <tr key={exec._id}>
                      <td className="audit-id-cell">
                        <span className="workflow-id-badge">
                          {exec._id.slice(-8)}
                        </span>
                      </td>

                      <td>
                        <span className={getStatusClass(exec.status)}>
                          {exec.status === "in_progress"
                            ? "In Progress"
                            : exec.status}
                        </span>
                      </td>

                      <td className="audit-text-cell">
                        {getWorkflowName(exec)}
                      </td>

                      <td className="audit-text-cell">
                        {getCurrentStepName(exec)}
                      </td>

                      <td>{exec.data?.amount ?? "-"}</td>
                      <td>{exec.data?.country || "-"}</td>
                      <td>{exec.data?.priority || "-"}</td>
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

export default AuditLog;