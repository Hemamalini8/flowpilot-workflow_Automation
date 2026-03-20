function ExecutionCard({ exec, active, onClick, getStatusClass }) {
  const getStepName = () => {
    if (!exec) return "No step";

    if (exec.status === "completed") return "Completed";
    if (exec.status === "rejected") return "Rejected";
    if (exec.status === "canceled") return "Canceled";

    if (typeof exec.currentStep === "object") {
      return exec.currentStep?.name || "Unknown Step";
    }

    return exec.currentStep || "Unknown Step";
  };

  return (
    <div
      className={`history-card ${active ? "active-history" : ""}`}
      onClick={onClick}
    >
      <div className="history-top">
        <p className="history-id">{exec._id}</p>
        <span className={getStatusClass(exec.status)}>
          {exec.status === "in_progress" ? "In progress" : exec.status}
        </span>
      </div>

      <p>
        <strong>Current Step:</strong> {getStepName()}
      </p>

      <p className="muted">
        <strong>Priority:</strong> {exec.data?.priority || "-"}
      </p>
    </div>
  );
}

export default ExecutionCard;