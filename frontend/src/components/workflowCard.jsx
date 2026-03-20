function WorkflowCard({ workflow }) {
  const stepCount = Array.isArray(workflow?.steps) ? workflow.steps.length : 0;

  return (
    <div className="workflow-card">
      <div className="workflow-top">
        <h3>{workflow?.name || "Untitled Workflow"}</h3>
        <span className="pill small">v{workflow?.version || 1}</span>
      </div>

      <p className="muted">Steps: {stepCount}</p>
    </div>
  );
}

export default WorkflowCard;