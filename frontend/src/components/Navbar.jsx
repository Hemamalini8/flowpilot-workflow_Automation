import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">FlowPilot</div>

      <div className="navbar-links">
        <Link
          to="/"
          className={location.pathname === "/" ? "nav-link active-link" : "nav-link"}
        >
          Home
        </Link>

        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "nav-link active-link" : "nav-link"}
        >
          Dashboard
        </Link>

        <Link
          to="/workflows"
          className={location.pathname === "/workflows" ? "nav-link active-link" : "nav-link"}
        >
          Workflows
        </Link>

        <Link
          to="/audit-log"
          className={location.pathname === "/audit-log" ? "nav-link active-link" : "nav-link"}
        >
          Audit Log
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;