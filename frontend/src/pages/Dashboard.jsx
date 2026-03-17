import { useEffect, useState } from "react";
import axios from "axios";
import WorkflowCard from "../components/workflowCard";
import ExecutionCard from "../components/ExecutionCard";
import MessageBox from "../components/messageBox";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function Dashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [amount, setAmount] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("High");
  const [message, setMessage] = useState("");
  const [execution, setExecution] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);

  const api = "http://localhost:5000/api";

  const getStatusClass = (status) => {
    if (status === "completed") return "status completed";
    if (status === "rejected") return "status rejected";
    return "status progress";
  };

  const loadWorkflows = async () => {
    try {
      const res = await axios.get(`${api}/workflows`);
      setWorkflows(res.data);

      if (res.data.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(res.data[0]._id);
      }
    } catch (error) {
      console.log("Error loading workflows:", error);
      setMessage("Failed to load workflows");
    }
  };

  const loadExecutions = async () => {
    try {
      const res = await axios.get(`${api}/executions`);
      setExecutions(res.data);
    } catch (error) {
      console.log("Error loading executions:", error);
      setMessage("Failed to load execution history");
    }
  };

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);

  const startWorkflow = async () => {
    if (!selectedWorkflow) {
      setMessage("Please select a workflow");
      return;
    }

    if (!amount || !country || !priority) {
      setMessage("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${api}/executions/start`, {
        workflowId: selectedWorkflow,
        data: {
          amount: Number(amount),
          country,
          department,
          priority,
        },
      });

      setExecution(res.data.execution);
      setMessage("Workflow started successfully");
      await loadExecutions();
    } catch (error) {
      console.log("Error starting workflow:", error);
      setMessage("Failed to start workflow");
    } finally {
      setLoading(false);
    }
  };

  const approveStep = async () => {
    if (!execution?._id) return;

    try {
      setLoading(true);

      const res = await axios.post(`${api}/executions/approve`, {
        executionId: execution._id,
      });

      setExecution(res.data.execution);
      setMessage(res.data.message);
      await loadExecutions();
    } catch (error) {
      console.log("Error approving step:", error);
      setMessage("Failed to approve step");
    } finally {
      setLoading(false);
    }
  };

  const rejectStep = async () => {
    if (!execution?._id) return;

    try {
      setLoading(true);

      const res = await axios.post(`${api}/executions/reject`, {
        executionId: execution._id,
      });

      setExecution(res.data.execution);
      setMessage(res.data.message);
      await loadExecutions();
    } catch (error) {
      console.log("Error rejecting step:", error);
      setMessage("Failed to reject step");
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await loadWorkflows();
    await loadExecutions();
    setMessage("Data refreshed successfully");
  };

  const executionFinished =
    execution?.status === "completed" || execution?.status === "rejected";

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Workflow Control Center</p>
            <h1>Track, approve, and manage workflow executions from one place.</h1>
            <p className="hero-text">
              
                 Rule-based workflow progression is automatically handled based on input conditions.
                 Start new workflows, monitor execution progress, review logs, and manage audit data through one clean dashboard.

            </p>
            <button className="refresh-btn" onClick={refreshAll}>
              Refresh Data
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <h3>{workflows.length}</h3>
              <p>Total Workflows</p>
            </div>

            <div className="stat-card">
              <h3>{executions.length}</h3>
              <p>Total Executions</p>
            </div>

            <div className="stat-card">
              <h3>{executions.filter((e) => e.status === "in_progress").length}</h3>
              <p>Active Runs</p>
            </div>
          </div>
        </section>

        <MessageBox message={message} />

        <div className="dashboard-grid">
          <div className="left-panel">
            <div className="card">
              <div className="section-header">
                <h2>Available Workflows</h2>
                <span className="pill">{workflows.length}</span>
              </div>

              {workflows.length === 0 ? (
                <p className="empty-text">No workflows found.</p>
              ) : (
                workflows.map((workflow) => (
                  <WorkflowCard key={workflow._id} workflow={workflow} />
                ))
              )}
            </div>

            <div className="card">
              <div className="section-header">
                <h2>Start Workflow</h2>
                <span className="pill green">Ready</span>
              </div>

              <label>Choose Workflow</label>
              <select
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
              >
                {workflows.map((workflow) => (
                  <option key={workflow._id} value={workflow._id}>
                    {workflow.name}
                  </option>
                ))}
              </select>

              <label>Amount *</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <label>Country *</label>
              <input
                type="text"
                placeholder="Enter country (example: US)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />

              <label>Department</label>
              <input
                type="text"
                placeholder="Enter department (example: HR)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />

              <label>Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <button
                className="start-btn"
                onClick={startWorkflow}
                disabled={loading}
              >
                {loading ? "Processing..." : "Start Workflow"}
              </button>
            </div>
          </div>

          <div className="right-panel">
            <div className="card">
              <div className="section-header">
                <h2>Execution Details</h2>
                {execution && (
                  <span className={getStatusClass(execution.status)}>
                    {execution.status}
                  </span>
                )}
              </div>

              {!execution ? (
                <p className="empty-text">
                  Start a workflow or click one from history.
                </p>
              ) : (
                <>
                  <div className="detail-grid">
                    <div className="detail-box">
                      <span className="detail-label">Execution ID</span>
                      <span className="detail-value">{execution._id}</span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">Current Step</span>
                      <span className="detail-value">
                        {execution.currentStep?.name || "Not available"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">{execution.data?.amount ?? "-"}</span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">Country</span>
                      <span className="detail-value">{execution.data?.country || "-"}</span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">Department</span>
                      <span className="detail-value">{execution.data?.department || "-"}</span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">Priority</span>
                      <span className="detail-value">{execution.data?.priority || "-"}</span>
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      className="approve-btn"
                      onClick={approveStep}
                      disabled={loading || executionFinished}
                    >
                      Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={rejectStep}
                      disabled={loading || executionFinished}
                    >
                      Reject
                    </button>
                  </div>

                  <h3 className="logs-title">Execution Logs</h3>

                  <div className="logs-box">
                    {execution.logs?.length > 0 ? (
                      <ul>
                        {execution.logs.map((log, index) => (
                          <li key={index}>{log.message}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No logs available.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="card">
              <div className="section-header">
                <h2>Execution History</h2>
                <span className="pill blue">{executions.length}</span>
              </div>

              <div className="history-list">
                {executions.length === 0 ? (
                  <p className="empty-text">No executions found.</p>
                ) : (
                  executions.map((exec) => (
                    <ExecutionCard
                      key={exec._id}
                      exec={exec}
                      active={execution?._id === exec._id}
                      onClick={() => setExecution(exec)}
                      getStatusClass={getStatusClass}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;