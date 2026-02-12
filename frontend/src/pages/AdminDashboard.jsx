import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const dashboardRes = await API.get("/admin/dashboard");
      const queueRes = await API.get("/admin/queues/status");
      const performanceRes = await API.get("/admin/doctors/performance");

      setStats(dashboardRes.data);
      setQueueStatus(queueRes.data);
      setDoctorPerformance(performanceRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Admin data error:", error);
      setLoading(false);
    }
  };

  if (loading)
    return (
      <h2 style={{ textAlign: "center", marginTop: "100px" }}>
        Loading Dashboard...
      </h2>
    );

  return (
    <Layout>
    <div style={{ padding: "40px", background: "#f4f6f9", minHeight: "100vh" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 15px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Logout
        </button>
      </div>

      <hr />

      {/* ================= USER CARDS ================= */}
      <h2>User Statistics</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <Card title="Total Users" value={stats.users.total} color="#3498db" />
        <Card title="Total Patients" value={stats.users.patients} color="#2ecc71" />
        <Card title="Total Doctors" value={stats.users.doctors} color="#9b59b6" />
      </div>

      {/* ================= QUEUE CARDS ================= */}
      <h2>Queue Summary</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        <Card title="Waiting" value={queueStatus.waiting} color="#f39c12" />
        <Card title="In Progress" value={queueStatus.in_progress} color="#e67e22" />
        <Card title="Completed" value={queueStatus.done} color="#27ae60" />
      </div>

      {/* ================= DOCTOR PERFORMANCE ================= */}
      <h2>Doctor Performance</h2>

      {doctorPerformance.length === 0 ? (
        <p>No data available</p>
      ) : (
        <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
          <table width="100%" cellPadding="10">
            <thead style={{ background: "#2c3e50", color: "white" }}>
              <tr>
                <th align="left">Doctor</th>
                <th align="left">Total Patients</th>
                <th align="left">Completed</th>
                <th align="left">Pending</th>
              </tr>
            </thead>
            <tbody>
              {doctorPerformance.map((doc, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{doc.doctor_email || doc.doctor || "N/A"}</td>
                  <td>{doc.total_patients}</td>
                  <td>{doc.completed}</td>
                  <td>{doc.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </Layout>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        background: color,
        padding: "20px",
        borderRadius: "10px",
        color: "white",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3>{title}</h3>
      <h1>{value}</h1>
    </div>
  );
}

export default AdminDashboard;
