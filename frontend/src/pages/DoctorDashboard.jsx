import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [callingNext, setCallingNext] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("queue");
  const [lastCalled, setLastCalled] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvail, setTogglingAvail] = useState(false);

  const doctorName = localStorage.getItem("name") || "Doctor";

  useEffect(() => {
    fetchQueue();
    fetchHistory();
    // Fetch doctor's current availability
    API.get("/auth/me").then(res => {
      if (res.data.is_available !== undefined) setIsAvailable(res.data.is_available);
    }).catch(() => {});
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await API.get("/doctor/queue");
      setQueue(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/doctor/queue/history");
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const toggleAvailability = async () => {
    setTogglingAvail(true);
    try {
      const res = await API.patch("/doctor/availability");
      setIsAvailable(res.data.is_available);
    } catch (err) { console.error(err); }
    finally { setTogglingAvail(false); }
  };

  const callNext = async () => {
    setCallingNext(true);
    try {
      const res = await API.post("/doctor/queue/next");
      if (res.data.message === "No patients in queue") {
        alert("No patients in queue");
      } else {
        setLastCalled(res.data);
      }
      fetchQueue();
    } catch (err) {
      console.log("Call next error:", err.message);
      // Silent fail - refresh to get latest state
    } finally {
      setCallingNext(false);
      fetchQueue();
    }
  };

  const completeConsultation = async (queueId) => {
    setCompletingId(queueId);
    try {
      await API.post(`/doctor/queue/${queueId}/complete`);
      fetchQueue();
      fetchHistory();
      if (lastCalled?.queue_id === queueId) setLastCalled(null);
    } catch (err) {
      console.log("Complete consultation error:", err.message);
      // Silent fail - refresh to get latest state
    } finally {
      setCompletingId(null);
      fetchQueue();
      fetchHistory();
    }
  };

  const inProgressPatients = queue.filter(q => q.status === "in_progress");
  const waitingPatients = queue.filter(q => q.status === "waiting");

  return (
    <Layout>
      <div style={{ padding: "32px 36px", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px", height: "48px",
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              borderRadius: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem",
            }}>🩺</div>
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--dark)", margin: 0 }}>
                Dr. {doctorName}
              </h1>
              <p style={{ color: "var(--gray)", fontSize: "0.85rem", margin: 0 }}>Doctor Dashboard</p>
            </div>
          </div>

          {/* Availability Toggle */}
          <button
            onClick={toggleAvailability}
            disabled={togglingAvail}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 18px",
              background: isAvailable ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
              color: isAvailable ? "#10b981" : "#ef4444",
              border: `1px solid ${isAvailable ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: togglingAvail ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{
              width: "8px", height: "8px",
              borderRadius: "50%",
              background: isAvailable ? "#10b981" : "#ef4444",
              boxShadow: isAvailable ? "0 0 6px #10b981" : "none",
            }} />
            {togglingAvail ? "Updating..." : isAvailable ? "Available" : "Unavailable"}
          </button>

          <button
            onClick={callNext}
            disabled={callingNext || waitingPatients.length === 0}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 24px",
              background: (callingNext || waitingPatients.length === 0)
                ? "#e2e8f0"
                : "linear-gradient(135deg, #0ea5e9, #0284c7)",
              color: (callingNext || waitingPatients.length === 0) ? "var(--gray)" : "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: (callingNext || waitingPatients.length === 0) ? "not-allowed" : "pointer",
              boxShadow: (callingNext || waitingPatients.length === 0) ? "none" : "0 4px 12px rgba(14,165,233,0.35)",
              transition: "all 0.2s",
            }}
          >
            {callingNext ? "⏳ Calling..." : "📢 Call Next Patient"}
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <MiniStat icon="⏳" label="Waiting" value={waitingPatients.length} color="#f59e0b" bg="#fef3c7" />
          <MiniStat icon="🔄" label="In Progress" value={inProgressPatients.length} color="#3b82f6" bg="#dbeafe" />
          <MiniStat icon="✅" label="Completed" value={history.length} color="#10b981" bg="#d1fae5" />
        </div>

        {/* Last Called Notification */}
        {lastCalled && (
          <div style={{
            background: "linear-gradient(135deg, #fef3c7, #fde68a22)",
            border: "1px solid #fcd34d",
            borderRadius: "var(--radius)",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.5rem" }}>📢</span>
              <div>
                <div style={{ fontWeight: 600, color: "#92400e", fontSize: "0.9rem" }}>
                  Called: {lastCalled.patient_name} — Token <strong>{lastCalled.token_number}</strong>
                </div>
                <div style={{ color: "#b45309", fontSize: "0.8rem" }}>Notification sent to patient's email</div>
              </div>
            </div>
            <button onClick={() => setLastCalled(null)} style={{ background: "none", border: "none", color: "#b45309", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
          </div>
        )}

        {/* In Progress Alert */}
        {inProgressPatients.length > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #dbeafe, #e0f2fe)",
            border: "1px solid #93c5fd",
            borderRadius: "var(--radius)",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.3rem" }}>🔄</span>
              <div>
                <div style={{ fontWeight: 600, color: "#1e40af", fontSize: "0.9rem" }}>
                  {inProgressPatients[0].patient_name} is currently in consultation
                </div>
                <div style={{ color: "#3b82f6", fontSize: "0.8rem" }}>
                  Token: <strong>{inProgressPatients[0].token_number}</strong> · Queue ID: #{inProgressPatients[0].id}
                </div>
              </div>
            </div>
            <button
              onClick={() => completeConsultation(inProgressPatients[0].id)}
              disabled={completingId === inProgressPatients[0].id}
              style={{
                padding: "8px 18px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
              }}
            >
              {completingId === inProgressPatients[0].id ? "Completing..." : "✓ Complete"}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
          {[
            { key: "queue", label: `⏳ Waiting Queue (${waitingPatients.length})` },
            { key: "history", label: `✅ History (${history.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                background: activeTab === tab.key ? "white" : "transparent",
                color: activeTab === tab.key ? "var(--dark)" : "var(--gray)",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: "pointer",
                boxShadow: activeTab === tab.key ? "var(--shadow-sm)" : "none",
                transition: "all 0.15s",
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Queue Table */}
        {activeTab === "queue" && (
          <div style={cardStyle}>
            {waitingPatients.length === 0 ? (
              <EmptyState icon="🎉" message="No patients waiting — queue is clear!" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      {["Position", "Token", "Patient", "Status", "Action"].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {waitingPatients.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={tdStyle}>
                          <span style={{
                            width: "28px", height: "28px",
                            background: "#e0e7ff",
                            color: "#4f46e5",
                            borderRadius: "50%",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.8rem", fontWeight: 700,
                          }}>{item.position}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            background: "#f0fdf4",
                            color: "#059669",
                            padding: "3px 10px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            fontFamily: "monospace",
                          }}>{item.token_number || `#${item.id}`}</span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{
                              width: "32px", height: "32px",
                              background: "#f0fdf4",
                              borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "1rem",
                            }}>🧑</div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{item.patient_name}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--gray)" }}>{item.patient_email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}><StatusBadge status={item.status} /></td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => completeConsultation(item.id)}
                            disabled={completingId === item.id}
                            style={{
                              padding: "6px 14px",
                              background: completingId === item.id ? "#e2e8f0" : "#10b981",
                              color: completingId === item.id ? "var(--gray)" : "white",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: completingId === item.id ? "not-allowed" : "pointer",
                            }}
                          >
                            {completingId === item.id ? "..." : "✓ Complete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* History Table */}
        {activeTab === "history" && (
          <div style={cardStyle}>
            {history.length === 0 ? (
              <EmptyState icon="📋" message="No completed consultations yet" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      {["Token", "Patient", "Status", "Date"].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={tdStyle}>
                          <span style={{
                            background: "#f0fdf4", color: "#059669",
                            padding: "3px 10px", borderRadius: "6px",
                            fontSize: "0.8rem", fontWeight: 700, fontFamily: "monospace",
                          }}>{item.token_number || `#${item.id}`}</span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "1rem" }}>🧑</span>
                            <span style={{ fontWeight: 500 }}>{item.patient_name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}><StatusBadge status={item.status} /></td>
                        <td style={{ ...tdStyle, color: "var(--gray)", fontSize: "0.8rem" }}>
                          {item.created_at ? new Date(item.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

/* ---- Sub-components ---- */
function MiniStat({ icon, label, value, color, bg }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "var(--radius)",
      padding: "20px",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      display: "flex", alignItems: "center", gap: "14px",
    }}>
      <div style={{ width: "44px", height: "44px", background: bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "1.8rem", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--gray)", fontWeight: 500, marginTop: "2px" }}>{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    waiting: { bg: "#fef3c7", color: "#92400e", label: "Waiting" },
    in_progress: { bg: "#dbeafe", color: "#1e40af", label: "In Progress" },
    done: { bg: "#d1fae5", color: "#065f46", label: "Done" },
    cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#64748b", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--gray)" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{icon}</div>
      <p style={{ fontSize: "0.9rem" }}>{message}</p>
    </div>
  );
}

const cardStyle = {
  background: "white",
  borderRadius: "var(--radius)",
  padding: "24px",
  boxShadow: "var(--shadow-sm)",
  border: "1px solid var(--border)",
};

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--gray)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "0.875rem",
  color: "var(--dark)",
};

export default DoctorDashboard;
