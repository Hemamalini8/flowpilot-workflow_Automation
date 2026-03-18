# 🚀 FlowPilot - Workflow Automation Engine

## 📌 Overview

FlowPilot is a full-stack workflow automation system that allows users to design workflows, define rules, execute processes, and track execution logs in real-time.

This project simulates real-world business automation systems like approvals, notifications, and decision-based workflows.
Project_Video Link : https://drive.google.com/file/d/1DCgLerSIWnHXcXRcXk8XYks5gfCzXM_G/view?usp=sharing

---

## 🧠 Features

### 🔹 Workflow Management

* Create and manage workflows
* Each workflow contains multiple steps
* Supports versioning

### 🔹 Step Types

* Task (automated)
* Approval (manual decision)
* Notification (alerts/messages)

### 🔹 Rule Engine

* Dynamic rule evaluation
* Supports:

  * `>`, `<`, `==`, `!=`
  * `&&`, `||`
  * String functions (contains, startsWith)
* Priority-based rule execution
* Default fallback rule

### 🔹 Workflow Execution

* Start workflow with input data
* Step-by-step execution
* Approval / Reject actions
* Real-time status tracking

### 🔹 Execution Logs

* Tracks:

  * Step execution
  * Rule evaluation
  * Decisions taken
* Shows execution history

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Axios
* CSS (Custom UI)

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

---

## 📁 Project Structure

```
workflow-engine/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone <your-repo-link>
cd workflow-engine
```

### 2️⃣ Backend setup

```bash
cd backend
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_connection_string
```

Run backend:

```bash
npx nodemon server.js
```

---

### 3️⃣ Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

Backend runs on:

```
http://localhost:5000
```

---

## 🔗 API Endpoints

### Workflows

* `GET /workflows` → Get all workflows
* `POST /workflows` → Create workflow

### Executions

* `GET /executions` → Get execution history
* `POST /executions/start` → Start workflow
* `POST /executions/approve` → Approve step
* `POST /executions/reject` → Reject step

---

## 🧪 Sample Workflow

**Expense Approval Flow**

```
Start → Manager Approval → Finance Approval → Completed
```

### Example Input:

```json
{
  "amount": 50000,
  "country": "India",
  "department": "HR",
  "priority": "High"
}
```

---

## 📊 UI Features

* Dashboard with live stats
* Workflow selection dropdown
* Execution tracking panel
* Approval / Reject buttons
* Execution history timeline

---

## 🧠 What I Built (Interview Explanation)

* Designed a rule-based workflow engine
* Implemented dynamic decision-making logic
* Built REST APIs for workflow execution
* Integrated MongoDB for persistence
* Created responsive React dashboard
* Handled async state and API integration

---

## 🚀 Future Enhancements

* Drag-and-drop workflow builder
* Real-time updates (WebSockets)
* Role-based authentication
* Email / Slack notifications
* Advanced analytics dashboard

---

## 👨‍💻 Author

Hemamalini

---
