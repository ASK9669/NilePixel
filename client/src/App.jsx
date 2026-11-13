
import { useEffect, useState } from "react";
import {
  saveReport,
  getReports,
  updateLocalReport,
} from "./db/database";

import { synchronizeReports } from "./services/sync";

import {
  LayoutDashboard,
  PlusCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  ClipboardList,
} from "lucide-react";

import "./index.css";

const API = "http://localhost:5000/api/reports";

function App() {
  const [reports, setReports] = useState([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    category: "Water",
    description: "",
    location: "",
    priority: "Medium",
  });

  async function loadReports() {
    const data = await getReports();
    setReports(data.sort(
      (a, b) =>
        new Date(b.reportedAt) - new Date(a.reportedAt)
    ));
  }

  async function sync() {
    setLoading(true);
    await synchronizeReports();
    await loadReports();
    setLoading(false);
  }

  useEffect(() => {
  async function initialize() {
    await loadReports();

    if (navigator.onLine) {
      await synchronizeReports();
      await loadReports();
    }
  }

  initialize();

    const handleOnline = () => {
      setOnline(true);
      synchronizeReports().then(loadReports);
    };

    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function createReport(e) {
    e.preventDefault();

    const report = {
      ...form,
      clientId: crypto.randomUUID(),
      status: "Draft",
      syncState: "Pending",
      reportedAt: new Date().toISOString(),
      activity: [
        {
          action: "CREATED",
          details: "Report saved locally.",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await saveReport(report);

    setForm({
      category: "Water",
      description: "",
      location: "",
      priority: "Medium",
    });

    await loadReports();
    setView("reports");

    if (navigator.onLine) {
      await synchronizeReports();
      await loadReports();
    }
  }

  

  async function updateStatus(report, status) {
    let reason = "";

    // Ask for a reason if the coordinator rejects a report
    if (status === "Rejected") {
      reason = window.prompt(
        "Enter the reason for rejecting this report:"
      );

      if (!reason || reason.trim().length < 5) {
        alert("A rejection reason of at least 5 characters is required.");
        return;
      }
    }

    try {
      const response = await fetch(
        `${API}/${report.serverId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, reason }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update report.");
      }

      await updateLocalReport({
        ...report,
        status: data.report.status,
        activity: [
          ...report.activity,
          {
            action: "STATUS_CHANGED",
            details:
              status === "Rejected"
                ? `Report rejected: ${reason}`
                : `Status changed to ${status}`,
            timestamp: new Date().toISOString(),
          },
        ],
      });

      await loadReports();

      alert("Report status updated successfully!");
    } catch (error) {
      alert(error.message);
    }
  }


  const pending = reports.filter(
    (r) => r.syncState === "Pending"
  ).length;

  const failed = reports.filter(
    (r) => r.syncState === "Failed"
  ).length;

  const synchronized = reports.filter(
    (r) => r.syncState === "Synchronized"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>FieldTrack</h2>
        <p className="brand-subtitle">Infrastructure monitoring</p>

        <button onClick={() => setView("dashboard")}>
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button onClick={() => setView("reports")}>
          <ClipboardList size={18} />
          All Reports
        </button>

        <button onClick={() => setView("create")}>
          <PlusCircle size={18} />
          New Report
        </button>

        <div className="connection">
          {online ? <Wifi /> : <WifiOff />}
          {online ? "Online" : "Offline"}
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>
              {view === "dashboard"
                ? "Dashboard"
                : view === "create"
                ? "Create Report"
                : "Issue Reports"}
            </h1>
            <p>Monitor and manage infrastructure issues.</p>
          </div>

          <button
            className="sync-button"
            onClick={sync}
            disabled={loading || !online}
          >
            <RefreshCw size={17} />
            {loading ? "Syncing..." : "Sync Now"}
          </button>
        </header>

        {view === "dashboard" && (
          <>
            <section className="stats">
              <Stat title="Total Reports" value={reports.length} />
              <Stat title="Pending" value={pending} />
              <Stat title="Synchronized" value={synchronized} />
              <Stat title="Failed" value={failed} />
            </section>

            <section className="panel">
              <h2>Recent Reports</h2>
              <ReportList
                reports={reports.slice(0, 5)}
                onUpdate={updateStatus}
              />
            </section>
          </>
        )}

        {view === "create" && (
          <section className="panel">
            <h2>Report an Infrastructure Issue</h2>

            <form onSubmit={createReport}>
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
              >
                {[
                  "Water",
                  "Equipment",
                  "Service Interruption",
                  "Safety",
                  "Maintenance",
                  "Other",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <label>Description</label>
              <textarea
                required
                minLength={10}
                maxLength={2000}
                value={form.description}
                placeholder="Describe the infrastructure problem..."
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />

              <label>Location</label>
              <input
                required
                maxLength={200}
                value={form.location}
                placeholder="Enter location"
                onChange={(e) =>
                  setForm({
                    ...form,
                    location: e.target.value,
                  })
                }
              />

              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value,
                  })
                }
              >
                {["Low", "Medium", "High", "Critical"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  )
                )}
              </select>

              <button className="primary" type="submit">
                Save Report
              </button>

              <p className="hint">
                Reports are saved locally and synchronized
                when internet connectivity returns.
              </p>
            </form>
          </section>
        )}

        {view === "reports" && (
          <section className="panel">
            <h2>All Reports</h2>
            <ReportList
              reports={reports}
              onUpdate={updateStatus}
            />
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function ReportList({ reports, onUpdate }) {
  if (!reports.length) {
    return <p>No reports available yet.</p>;
  }

  return (
    <div className="report-list">
      {reports.map((report) => (
        <article className="report" key={report.clientId}>
          <div className="report-heading">
            <h3>{report.category}</h3>
            <span className={`priority ${report.priority.toLowerCase()}`}>
              {report.priority}
            </span>
          </div>

          <p>{report.description}</p>
          <p>📍 {report.location}</p>

          <div className="report-meta">
            <span>Status: {report.status}</span>
            <span>Sync: {report.syncState}</span>
          </div>

          {report.lastError && (
            <p className="error-text">
              Sync error: {report.lastError}
            </p>
          )}

          {report.syncState === "Synchronized" && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onUpdate(report, e.target.value);
                }
              }}
            >
              <option value="">Coordinator: Update status</option>
              {(
                report.status === "Submitted"
                  ? ["Assigned", "Rejected"]
                  : report.status === "Assigned"
                  ? ["In Progress", "Rejected"]
                  : report.status === "In Progress"
                  ? ["Resolved"]
                  : []
              ).map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          )}

          <details>
            <summary>Activity history</summary>
            {report.activity.map((item, index) => (
              <p key={index}>
                {item.action} — {item.details}
              </p>
            ))}
          </details>
        </article>
      ))}
    </div>
  );
}

export default App;
