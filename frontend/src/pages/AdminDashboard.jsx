import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [dashRes, queueRes, perfRes] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/queues/status"),
        API.get("/admin/doctors/performance"),
      ]);
      setStats(dashRes.data);
      setQueueStatus(queueRes.data);
      setDoctorPerformance(perfRes.data);
    } catch (err) {
      console.error("Admin data error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
        <p style={{ color: "var(--gray)", marginTop: "16px" }}>Loading dashboard...</p>
      </div>
    </Layout>
  );

  const totalQueue = (queueStatus?.waiting || 0) + (queueStatus?.in_progress || 0) + (queueStatus?.done || 0);

  return (
    <Layout>
      <div style={{ padding: "32px 36px", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <div style={{
              width: "40px", height: "40px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem",
            }}>📊</div>
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--dark)", margin: 0 }}>Admin Dashboard</h1>
              <p style={{ color: "var(--gray)", fontSize: "0.85rem", margin: 0 }}>System overview & analytics</p>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <SectionTitle>User Statistics</SectionTitle>
        <div style={gridStyle}>
          <StatCard icon="👥" label="Total Users" value={stats?.users?.total ?? 0} color="#6366f1" bg="#e0e7ff" />
          <StatCard icon="🧑‍⚕️" label="Patients" value={stats?.users?.patients ?? 0} color="#10b981" bg="#d1fae5" />
          <StatCard icon="👨‍⚕️" label="Doctors" value={stats?.users?.doctors ?? 0} color="#0ea5e9" bg="#e0f2fe" />
        </div>

        {/* Queue Stats */}
        <SectionTitle>Queue Summary</SectionTitle>
        <div style={gridStyle}>
          <StatCard icon="⏳" label="Waiting" value={queueStatus?.waiting ?? 0} color="#f59e0b" bg="#fef3c7" />
          <StatCard icon="🔄" label="In Progress" value={queueStatus?.in_progress ?? 0} color="#3b82f6" bg="#dbeafe" />
          <StatCard icon="✅" label="Completed" value={queueStatus?.done ?? 0} color="#10b981" bg="#d1fae5" />
        </div>

        {/* Queue Progress Bar */}
        {totalQueue > 0 && (
          <div style={{ ...cardStyle, marginBottom: "28px" }}>
            <h3 style={cardTitleStyle}>Queue Distribution</h3>
            <div style={{ display: "flex", height: "12px", borderRadius: "999px", overflow: "hidden", gap: "2px", marginBottom: "12px" }}>
              <div style={{ flex: queueStatus?.waiting || 0, background: "#f59e0b", transition: "flex 0.5s" }} />
              <div style={{ flex: queueStatus?.in_progress || 0, background: "#3b82f6", transition: "flex 0.5s" }} />
              <div style={{ flex: queueStatus?.done || 0, background: "#10b981", transition: "flex 0.5s" }} />
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
              {[
                { label: "Waiting", color: "#f59e0b", val: queueStatus?.waiting },
                { label: "In Progress", color: "#3b82f6", val: queueStatus?.in_progress },
                { label: "Done", color: "#10b981", val: queueStatus?.done },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--gray)" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
                  {item.label}: <strong style={{ color: "var(--dark)" }}>{item.val ?? 0}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Performance */}
        <SectionTitle>Doctor Performance</SectionTitle>
        <div style={cardStyle}>
          {doctorPerformance.length === 0 ? (
            <EmptyState icon="👨‍⚕️" message="No doctor performance data available" />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    {["Doctor", "Specialization", "Status", "Total Patients", "Completed", "Pending", "Completion Rate"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doctorPerformance.map((doc, i) => {
                    const rate = doc.total_patients > 0 ? Math.round((doc.completed / doc.total_patients) * 100) : 0;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "34px", height: "34px",
                              background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                              borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.9rem",
                            }}>👨‍⚕️</div>
                            <span style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--dark)" }}>
                              Dr. {doc.doctor_name || doc.doctor_email}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "var(--dark)" }}>
                          {doc.specialization || "General Physician"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ 
                            background: doc.is_available ? "#d1fae5" : "#fee2e2", 
                            color: doc.is_available ? "#065f46" : "#991b1b", 
                            padding: "3px 10px", 
                            borderRadius: "999px", 
                            fontSize: "0.8rem", 
                            fontWeight: 600 
                          }}>
                            {doc.is_available ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "var(--dark)", fontWeight: 600 }}>{doc.total_patients}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ background: "#d1fae5", color: "#065f46", padding: "3px 10px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600 }}>{doc.completed}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600 }}>{doc.pending}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                              <div style={{ width: `${rate}%`, height: "100%", background: rate > 70 ? "#10b981" : rate > 40 ? "#f59e0b" : "#ef4444", borderRadius: "999px" }} />
                            </div>
                            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--gray)", minWidth: "36px" }}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ---- Sub-components ---- */

function SectionTitle({ children }) {
  return <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--dark)", marginBottom: "14px", marginTop: "4px" }}>{children}</h2>;
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "var(--radius)",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
      border: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      <div style={{
        width: "52px", height: "52px",
        background: bg,
        borderRadius: "14px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.5rem",
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: "2rem", fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--gray)", fontWeight: 500, marginTop: "2px" }}>{label}</div>
      </div>
    </div>
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

/* ---- Styles ---- */
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  marginBottom: "28px",
};

const cardStyle = {
  background: "white",
  borderRadius: "var(--radius)",
  padding: "24px",
  boxShadow: "var(--shadow-sm)",
  border: "1px solid var(--border)",
};

const cardTitleStyle = {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "var(--dark)",
  marginBottom: "16px",
};

const loadingStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "3px solid var(--border)",
  borderTop: "3px solid var(--primary)",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

export default AdminDashboard;
