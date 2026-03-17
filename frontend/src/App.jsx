import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AuditLog from "./pages/auditlog";
import WorkflowList from "./pages/workflowList";
import WorkflowEditor from "./pages/workflowEditor";
import StepManager from "./pages/stepManger";
import RuleEditor from "./pages/ruleEditor";
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/workflows" element={<WorkflowList />} />
        <Route path="/workflow-editor" element={<WorkflowEditor />} />
        <Route path="/workflow-editor/:id" element={<WorkflowEditor />} /> 
        <Route path="/workflow-steps/:workflowId" element={<StepManager />} />
        <Route path="/workflow-rules/:workflowId/:stepId" element={<RuleEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;