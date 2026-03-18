import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/Components.css";

function StepManager() {
  const { id } = useParams();

  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [newStep, setNewStep] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const api = "https://flowpilot-workflow-automation.onrender.com";
  const sanitizedSteps = useMemo(() => {
    return (steps || [])
      .map((step) => String(step).trim())
      .filter((step) => step.length > 0);
  }, [steps]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api}/workflows/${id}`);
      setWorkflow(res.data);
      setSteps(Array.isArray(res.data.steps) ? res.data.steps : []);
      setMessage("");
    } catch (error) {
      console.log("Error loading workflow steps:", error);
      setMessage("Failed to load steps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadWorkflow();
    }
  }, [id]);

  const addStep = () => {
    const trimmed = newStep.trim();

    if (!trimmed) {
      setMessage("Please enter a step name");
      return;
    }

    const alreadyExists = sanitizedSteps.some(
      (step) => step.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      setMessage("This step already exists");
      return;
    }

    setSteps([...sanitizedSteps, trimmed]);
    setNewStep("");
    setMessage("");
  };

  const removeStep = (indexToRemove) => {
    const updatedSteps = sanitizedSteps.filter((_, index) => index !== indexToRemove);
    setSteps(updatedSteps);
    setMessage("");
  };

  const saveSteps = async () => {
    if (!workflow) return;

    try {
      setSaving(true);

      await axios.put(`${api}/workflows/${id}`, {
        ...workflow,
        steps: sanitizedSteps,
      });

      setMessage("Steps updated successfully");
      await loadWorkflow();
    } catch (error) {
      console.log("Error saving steps:", error);
      setMessage("Failed to save steps");
    } finally {
      setSaving(false);
    }
  };

  const handleEnterAdd = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addStep();
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="hero">
          <div className="hero-left">
            <p className="mini-title">Step Manager</p>
            <h1>Manage workflow steps</h1>
            <p className="hero-text">
              Add, remove, reorder visually, and save workflow steps for this workflow.
            </p>
          </div>
        </section>

        {message && <div className="message-box">{message}</div>}

        <div className="card">
          <div className="section-header">
            <h2>
              Workflow: {loading ? "Loading..." : workflow?.name || "Unknown Workflow"}
            </h2>
            <span className="pill blue">{sanitizedSteps.length}</span>
          </div>

          <label>Add New Step</label>
          <div className="step-input-row">
            <input
              type="text"
              placeholder="Enter step name"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={handleEnterAdd}
              className="step-input"
            />

            <button
              className="edit-btn"
              onClick={addStep}
              type="button"
            >
              Add
            </button>
          </div>

          <h3 className="step-section-title">Current Steps</h3>

          {loading ? (
            <p className="empty-text">Loading steps...</p>
          ) : sanitizedSteps.length === 0 ? (
            <p className="empty-text">No steps added yet.</p>
          ) : (
            <div className="step-list">
              {sanitizedSteps.map((step, index) => (
                <div key={`${step}-${index}`} className="step-row">
                  <div className="step-left">
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{step}</span>
                  </div>

                  <button
                    className="step-remove-btn"
                    onClick={() => removeStep(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className="start-btn"
            style={{ marginTop: "20px" }}
            onClick={saveSteps}
            disabled={saving || loading}
            type="button"
          >
            {saving ? "Saving..." : "Save Steps"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StepManager;