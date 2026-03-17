import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-content">
          <p className="mini-title">Rule-Based Workflow Automation</p>
          <h1>Manage approvals with clarity, speed, and smart routing.</h1>
          <p className="home-description">
            This system allows users to start workflows, approve or reject steps,
            track logs, and manage rule-based step transitions in a clean dashboard.
          </p>

          <div className="home-buttons">
            <Link to="/dashboard" className="primary-btn">
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Core Features</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Workflow Engine</h3>
            <p>Create and manage multi-step approval workflows with structured execution flow.</p>
          </div>

          <div className="feature-card">
            <h3>Rule-Based Routing</h3>
            <p>Automatically move to the next step based on input conditions like amount, priority, and country.</p>
          </div>

          <div className="feature-card">
            <h3>Execution Tracking</h3>
            <p>Track workflow status, current step, input data, and decision logs in real time.</p>
          </div>

          <div className="feature-card">
            <h3>Audit Visibility</h3>
            <p>Monitor execution history through a clean audit log interface for review and compliance.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;