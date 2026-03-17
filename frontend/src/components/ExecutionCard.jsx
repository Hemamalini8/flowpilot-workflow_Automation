function ExecutionCard({ exec, active, onClick, getStatusClass }) {
  return (
    <div
      className={`history-card ${active ? "active-history" : ""}`}
      onClick={onClick}
    >
      <div className="history-top">
        <p className="history-id">{exec._id}</p>
        <span className={getStatusClass(exec.status)}>{exec.status}</span>
      </div>

      <p>
        <strong>Current Step:</strong> {exec.currentStep?.name || "Not available"}
      </p>
    </div>
  );
}

export default ExecutionCard;