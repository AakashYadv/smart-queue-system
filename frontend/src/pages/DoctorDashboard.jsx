import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchQueue();
      fetchHistory();
    }
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await API.get("/doctor/queue");
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/doctor/queue/history");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const callNext = async () => {
    try {
      await API.post("/doctor/queue/next");
      alert("Next patient called ✅");
      fetchQueue();
    } catch (err) {
      alert("No patients in queue");
    }
  };

  const completeConsultation = async (queueId) => {
    try {
      await API.post(`/doctor/queue/${queueId}/complete`);
      alert("Consultation completed ✅");
      fetchQueue();
      fetchHistory();
    } catch (err) {
      alert("Error completing consultation");
    }
  };

  return (
    <Layout>
    <div style={{ padding: "40px", background: "#f4f6f9", minHeight: "100vh" }}>
      <h1>Doctor Dashboard</h1>
      <hr />

      {/* Waiting Queue */}
      <div style={cardStyle}>
        <h2>Waiting Queue</h2>

        <button style={primaryButton} onClick={callNext}>
          Call Next Patient
        </button>

        <br /><br />

        {queue.length === 0 ? (
          <p>No patients waiting</p>
        ) : (
          <table width="100%" cellPadding="8">
            <thead style={{ background: "#2c3e50", color: "white" }}>
              <tr>
                <th>Queue ID</th>
                <th>Patient ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{item.id}</td>
                  <td>{item.patient_id}</td>
                  <td>{item.status}</td>
                  <td>
                    <button
                      style={successButton}
                      onClick={() => completeConsultation(item.id)}
                    >
                      Complete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* History */}
      <div style={cardStyle}>
        <h2>Completed Consultations</h2>

        {history.length === 0 ? (
          <p>No completed consultations</p>
        ) : (
          <table width="100%" cellPadding="8">
            <thead style={{ background: "#16a085", color: "white" }}>
              <tr>
                <th>Queue ID</th>
                <th>Patient ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{item.id}</td>
                  <td>{item.patient_id}</td>
                  <td>{item.status}</td>
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

const primaryButton = {
  padding: "8px 15px",
  background: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const successButton = {
  padding: "6px 12px",
  background: "#27ae60",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default DoctorDashboard;
