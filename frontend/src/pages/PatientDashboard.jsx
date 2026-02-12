import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

function PatientDashboard() {
  const [doctorId, setDoctorId] = useState("");
  const [queueStatus, setQueueStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchStatus();
      fetchHistory();
    }
  }, []);

  const joinQueue = async () => {
    if (!doctorId) {
      alert("Please enter Doctor ID");
      return;
    }

    try {
      await API.post("/patient/join-queue", {
        doctor_id: parseInt(doctorId),
      });
      alert("Joined queue successfully ✅");
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.detail || "Error joining queue");
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await API.get("/patient/queue/status");
      setQueueStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelQueue = async () => {
    try {
      await API.delete("/patient/queue/cancel");
      alert("Queue cancelled ❌");
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.detail);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/patient/queue/history");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
    <div style={{ padding: "40px", background: "#f4f6f9", minHeight: "100vh" }}>
      <h1>Patient Dashboard</h1>
      <hr />

      {/* Join Queue Card */}
      <div style={cardStyle}>
        <h2>Join Queue</h2>

        <input
          type="number"
          placeholder="Enter Doctor ID"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          style={inputStyle}
        />

        <button onClick={joinQueue} style={primaryButton}>
          Join Queue
        </button>
      </div>

      {/* Current Status Card */}
      <div style={cardStyle}>
        <h2>Current Status</h2>

        {!queueStatus || queueStatus.message ? (
          <p>You are not in any queue</p>
        ) : (
          <>
            <p><strong>Status:</strong> {queueStatus.status}</p>
            <p><strong>Position:</strong> {queueStatus.position}</p>
            <p>
              <strong>Estimated Wait Time:</strong>{" "}
              {queueStatus.estimated_wait_time_minutes} mins
            </p>

            <button onClick={cancelQueue} style={dangerButton}>
              Cancel Queue
            </button>
          </>
        )}
      </div>

      {/* History Card */}
      <div style={cardStyle}>
        <h2>Queue History</h2>

        {history.length === 0 ? (
          <p>No history found</p>
        ) : (
          <table width="100%" cellPadding="8">
            <thead style={{ background: "#2c3e50", color: "white" }}>
              <tr>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{item.action}</td>
                  <td>
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </Layout>
  );
}

/* ---------- STYLES ---------- */

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "25px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const inputStyle = {
  padding: "8px",
  marginRight: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const primaryButton = {
  padding: "8px 15px",
  background: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const dangerButton = {
  padding: "8px 15px",
  background: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default PatientDashboard;
