import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function AuditLog() {
  const [executions, setExecutions] = useState([]);

  const api = "http://localhost:5000/api";

  const getStatusClass = (status) => {
    if (status === "completed") return "status completed";
    if (status === "rejected") return "status rejected";
    return "status progress";
  };

  const loadExecutions = async () => {
    try {
      const res = await axios.get(`${api}/executions`);
      setExecutions(res.data);
    } catch (error) {
      console.log("Error loading audit logs:", error);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Audit Log</p>
            <h1>Track all workflow executions for monitoring and compliance.</h1>
            <p className="hero-text">
              Review workflow runs, status, current step, and execution details in one place.
            </p>
          </div>
        </section>

        <div className="card">
          <div className="section-header">
            <h2>Execution Audit Table</h2>
            <span className="pill blue">{executions.length}</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="audit-table">
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
                {executions.map((exec) => (
                  <tr key={exec._id}>
                    <td>{exec._id}</td>
                    <td>
                      <span className={getStatusClass(exec.status)}>
                        {exec.status}
                      </span>
                    </td>
                    <td>{exec.workflow?.name || "Not available"}</td>
                    <td>{exec.currentStep?.name || "Not available"}</td>
                    <td>{exec.data?.amount ?? "-"}</td>
                    <td>{exec.data?.country || "-"}</td>
                    <td>{exec.data?.priority || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLog;