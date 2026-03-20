import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [amountRequired, setAmountRequired] = useState(true);
  const [countryRequired, setCountryRequired] = useState(true);
  const [departmentRequired, setDepartmentRequired] = useState(false);
  const [priorityRequired, setPriorityRequired] = useState(true);
  const [message, setMessage] = useState("");

  const api = "https://flowpilot-workflow-automation.onrender.com/api";

  const loadWorkflow = async () => {
    if (!id) return;

    try {
      const res = await axios.get(`${api}/workflows`);
      const workflow = res.data.find((item) => item._id === id);

      if (!workflow) {
        setMessage("Workflow not found");
        return;
      }

      setName(workflow.name || "");
      setAmountRequired(workflow.input_schema?.amount?.required ?? true);
      setCountryRequired(workflow.input_schema?.country?.required ?? true);
      setDepartmentRequired(workflow.input_schema?.department?.required ?? false);
      setPriorityRequired(workflow.input_schema?.priority?.required ?? true);
    } catch (error) {
      console.log("Error loading workflow:", error);
      setMessage("Failed to load workflow");
    }
  };

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const saveWorkflow = async () => {
    if (!name.trim()) {
      setMessage("Workflow name is required");
      return;
    }

    const input_schema = {
      amount: { type: "number", required: amountRequired },
      country: { type: "string", required: countryRequired },
      department: { type: "string", required: departmentRequired },
      priority: {
        type: "string",
        required: priorityRequired,
        allowed_values: ["High", "Medium", "Low"],
      },
    };

    const payload = {
      name: name.trim(),
      steps: [],
      input_schema,
      version: 1,
      is_active: true,
      start_step_id: null,
    };

    try {
      if (id) {
        setMessage("updated");
        return;
      } else {
        await axios.post(`${api}/workflows`, payload);
        setMessage("Workflow created successfully");
      }

      setTimeout(() => {
        navigate("/workflows");
      }, 1000);
    } catch (error) {
      console.log("Error saving workflow:", error);
      setMessage("Failed to save workflow");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Workflow Editor</p>
            <h1>{id ? "Edit workflow details" : "Create a new workflow"}</h1>
            <p className="hero-text">
              Configure workflow name and input schema fields for workflow execution.
            </p>
          </div>
        </section>

        {message && <div className="message-box">{message}</div>}

        <div className="card">
          <div className="section-header">
            <h2>{id ? "Edit Workflow" : "Create Workflow"}</h2>
          </div>

          <label>Workflow Name</label>
          <input
            type="text"
            placeholder="Enter workflow name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Input Schema</h3>

          <label>
            <input
              type="checkbox"
              checked={amountRequired}
              onChange={(e) => setAmountRequired(e.target.checked)}
            />{" "}
            Amount Required
          </label>

          <label>
            <input
              type="checkbox"
              checked={countryRequired}
              onChange={(e) => setCountryRequired(e.target.checked)}
            />{" "}
            Country Required
          </label>

          <label>
            <input
              type="checkbox"
              checked={departmentRequired}
              onChange={(e) => setDepartmentRequired(e.target.checked)}
            />{" "}
            Department Required
          </label>

          <label>
            <input
              type="checkbox"
              checked={priorityRequired}
              onChange={(e) => setPriorityRequired(e.target.checked)}
            />{" "}
            Priority Required
          </label>

          <button
            className="start-btn"
            style={{ marginTop: "20px" }}
            onClick={saveWorkflow}
          >
            {id ? "Update Workflow" : "Create Workflow"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkflowEditor;