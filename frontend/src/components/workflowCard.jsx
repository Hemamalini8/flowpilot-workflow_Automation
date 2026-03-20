function WorkflowCard({ workflow }) {
  return (
    <div className="workflow-card">
      <div className="workflow-top">
        <h3>{workflow.name}</h3>
        <span className="sub-pill">v{workflow.version}</span>
      </div>

      <p className="muted">
        Steps: {Array.isArray(workflow.steps) ? workflow.steps.length : 0}
      </p>
    </div>
  );
}

export default WorkflowCard;