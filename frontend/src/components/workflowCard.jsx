function WorkflowCard({ workflow }) {
  return (
    <div className="workflow-card">
      <div className="workflow-top">
        <h3>{workflow.name}</h3>
        <span className="sub-pill">v{workflow.version}</span>
      </div>
      <p className="muted">Steps: {workflow.steps.length}</p>
    </div>
  );
}

export default WorkflowCard;