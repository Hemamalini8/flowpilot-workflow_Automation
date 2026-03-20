import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import WorkflowList from "./pages/WorkflowList";
import WorkflowEditor from "./pages/WorkflowEditor";
import StepManager from "./pages/StepManager";
import RuleEditor from "./pages/ruleEditor";
import AuditLog from "./pages/auditlog";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workflows" element={<WorkflowList />} />
        <Route path="/workflow-editor" element={<WorkflowEditor />} />
        <Route path="/workflow-editor/:id" element={<WorkflowEditor />} />
        <Route path="/steps/:workflowId" element={<StepManager />} />
        <Route path="/rules/:workflowId/:stepId" element={<RuleEditor />} />
        <Route path="/rules/:workflowId" element={<ruleEditor />} />
        <Route path="/audit-log" element={<auditLog />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;