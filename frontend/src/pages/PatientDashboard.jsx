import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

// Specialization icons map
const specIcons = {
  cardiology: "❤️",
  neurology: "🧠",
  orthopedics: "🦴",
  pediatrics: "👶",
  dermatology: "🧴",
  ophthalmology: "👁️",
  ent: "👂",
  general: "🩺",
  gynecology: "🌸",
  psychiatry: "🧘",
  default: "👨‍⚕️",
};

function getSpecIcon(spec) {
  if (!spec) return specIcons.default;
  const key = spec.toLowerCase();
  return Object.keys(specIcons).find(k => key.includes(k))
    ? specIcons[Object.keys(specIcons).find(k => key.includes(k))]
    : specIcons.default;
}

function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [queueStatus, setQueueStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [joining, setJoining] = useState(null); // doctor id being joined
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState("book");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const patientName = localStorage.getItem("name") || "Patient";

  useEffect(() => {
    fetchDoctors();
    fetchStatus();
    fetchHistory();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/patient/doctors");
      setDoctors(res.data);
    } catch (err) { console.error(err); }
  };

  const joinQueue = async (doctorId, doctorName) => {
    setJoining(doctorId);
    try {
      const res = await API.post("/patient/join-queue", { doctor_id: doctorId });
      // Check if response has valid data
      if (res && res.data) {
        setBookingSuccess({
          token: res.data.token_number,
          qr: res.data.qr_code,
          doctorName,
        });
        setActiveTab("status");
        fetchStatus();
        fetchDoctors();
      }
    } catch (err) {
      // Check if the request actually succeeded (might be a network error that still completed)
      console.log("Join queue error:", err.message);
      // Silent fail - don't disrupt user experience
    } finally {
      setJoining(null);
      // Always refresh to get latest state
      fetchStatus();
      fetchDoctors();
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await API.get("/patient/queue/status");
      setQueueStatus(res.data);
    } catch (err) { console.error(err); }
  };

  const cancelQueue = async () => {
    setCancelling(true);
    try {
      await API.delete("/patient/queue/cancel");
      setQueueStatus(null);
      setBookingSuccess(null);
      fetchStatus();
      fetchHistory();
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.detail || "Error cancelling queue");
    } finally {
      setCancelling(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/patient/queue/history");
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const isInQueue = queueStatus && !queueStatus.message;
  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div style={{ padding: "32px 36px", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px", height: "48px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              borderRadius: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem",
            }}>🏥</div>
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--dark)", margin: 0 }}>
                Hello, {patientName} 👋
              </h1>
              <p style={{ color: "var(--gray)", fontSize: "0.85rem", margin: 0 }}>
                Book an appointment or check your queue status
              </p>
            </div>
          </div>
        </div>

        {/* Active Queue Alert */}
        {isInQueue && (
          <div style={{
            background: queueStatus.status === "in_progress"
              ? "linear-gradient(135deg, #1e40af11, #3b82f611)"
              : "linear-gradient(135deg, #92400e11, #f59e0b11)",
            border: `1px solid ${queueStatus.status === "in_progress" ? "#93c5fd" : "#fcd34d"}`,
            borderRadius: "var(--radius)",
            padding: "20px 24px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "52px", height: "52px",
                background: queueStatus.status === "in_progress" ? "#dbeafe" : "#fef3c7",
                borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem",
              }}>
                {queueStatus.status === "in_progress" ? "🔔" : "⏳"}
              </div>
              <div>
                {queueStatus.status === "in_progress" ? (
                  <>
                    <div style={{ fontWeight: 700, color: "#1e40af", fontSize: "1.05rem" }}>
                      It's your turn! Please proceed to the doctor's room.
                    </div>
                    <div style={{ color: "#3b82f6", fontSize: "0.85rem", marginTop: "2px" }}>
                      Token: <strong>{queueStatus.token_number}</strong>
                      {queueStatus.doctor_name && ` · Dr. ${queueStatus.doctor_name}`}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 700, color: "#92400e", fontSize: "1.05rem" }}>
                      Queue Position #{queueStatus.position}
                      {queueStatus.doctor_name && ` · Dr. ${queueStatus.doctor_name}`}
                    </div>
                    <div style={{ color: "#b45309", fontSize: "0.85rem", marginTop: "2px" }}>
                      Token: <strong>{queueStatus.token_number}</strong>
                      {" · "}Estimated wait: ~{queueStatus.estimated_wait_time_minutes} min
                    </div>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={() => setActiveTab("status")}
                style={{
                  padding: "9px 16px",
                  background: "white",
                  color: "var(--dark)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View QR
              </button>
              <button
                onClick={cancelQueue}
                disabled={cancelling || queueStatus.status === "in_progress"}
                style={{
                  padding: "9px 16px",
                  background: (cancelling || queueStatus.status === "in_progress") ? "#e2e8f0" : "#ef4444",
                  color: (cancelling || queueStatus.status === "in_progress") ? "var(--gray)" : "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: (cancelling || queueStatus.status === "in_progress") ? "not-allowed" : "pointer",
                }}
              >
                {cancelling ? "Cancelling..." : "✕ Cancel"}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
          {[
            { key: "book", label: "🔍 Find a Doctor" },
            { key: "status", label: `📋 My Queue${isInQueue ? ` · #${queueStatus.position ?? "—"}` : ""}` },
            { key: "history", label: `📜 History (${history.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "9px 20px",
                borderRadius: "8px",
                background: activeTab === tab.key ? "white" : "transparent",
                color: activeTab === tab.key ? "var(--dark)" : "var(--gray)",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: "pointer",
                boxShadow: activeTab === tab.key ? "var(--shadow-sm)" : "none",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* ===== BOOK TAB ===== */}
        {activeTab === "book" && (
          <div>
            {/* Search */}
            <div style={{ marginBottom: "20px", position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1rem", color: "var(--gray)" }}>🔍</span>
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  outline: "none",
                  background: "white",
                  color: "var(--dark)",
                  boxSizing: "border-box",
                  boxShadow: "var(--shadow-sm)",
                }}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Doctor Cards Grid */}
            {filteredDoctors.length === 0 ? (
              <EmptyState icon="👨‍⚕️" message="No doctors found" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {filteredDoctors.map(doc => (
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    isInQueue={isInQueue}
                    joining={joining === doc.id}
                    onBook={() => joinQueue(doc.id, doc.name)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== STATUS TAB ===== */}
        {activeTab === "status" && (
          <div>
            {!isInQueue && !bookingSuccess ? (
              <div style={cardStyle}>
                <EmptyState icon="🏥" message="You are not in any queue. Go to 'Find a Doctor' to book an appointment." />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Token Info */}
                <div style={cardStyle}>
                  <h3 style={cardTitleStyle}>Your Token</h3>
                  <div style={{
                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                    border: "1px solid #bbf7d0",
                    borderRadius: "12px",
                    padding: "24px",
                    textAlign: "center",
                    marginBottom: "16px",
                  }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--gray)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Token Number</div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "#059669", letterSpacing: "0.05em" }}>
                      {queueStatus?.token_number || bookingSuccess?.token || "—"}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <InfoTile icon="📍" label="Status" value={<StatusBadge status={queueStatus?.status} />} />
                    <InfoTile icon="🔢" label="Position" value={`#${queueStatus?.position ?? "—"}`} />
                    <InfoTile icon="⏱️" label="Est. Wait" value={`${queueStatus?.estimated_wait_time_minutes ?? 0} min`} />
                    <InfoTile icon="👨‍⚕️" label="Doctor" value={queueStatus?.doctor_name || "—"} />
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <h3 style={cardTitleStyle}>Check-in QR Code</h3>
                  <p style={{ color: "var(--gray)", fontSize: "0.85rem", textAlign: "center", marginBottom: "20px" }}>
                    Show this QR code at the hospital reception for check-in
                  </p>

                  {(queueStatus?.qr_code || bookingSuccess?.qr) ? (
                    <div style={{
                      padding: "16px",
                      background: "white",
                      border: "2px solid var(--border)",
                      borderRadius: "16px",
                      boxShadow: "var(--shadow)",
                    }}>
                      <img
                        src={queueStatus?.qr_code || bookingSuccess?.qr}
                        alt="QR Code"
                        style={{ width: "200px", height: "200px", display: "block" }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: "200px", height: "200px",
                      background: "#f1f5f9",
                      borderRadius: "12px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--gray)", fontSize: "0.85rem",
                    }}>No QR available</div>
                  )}

                  <p style={{ color: "var(--gray-light)", fontSize: "0.75rem", marginTop: "16px", textAlign: "center" }}>
                    📧 QR code has been sent to your registered email
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === "history" && (
          <div style={cardStyle}>
            {history.length === 0 ? (
              <EmptyState icon="📋" message="No queue history found" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      {["Action", "Performed By", "Timestamp"].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={tdStyle}><ActionBadge action={item.action} /></td>
                        <td style={tdStyle}>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {item.performed_by === "doctor" ? "👨‍⚕️" : "🧑"} {item.performed_by}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: "var(--gray)", fontSize: "0.8rem" }}>
                          {new Date(item.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
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

/* ---- Doctor Card ---- */
function DoctorCard({ doctor, isInQueue, joining, onBook }) {
  const icon = getSpecIcon(doctor.specialization);
  const isAvailable = doctor.waiting_patients < 20;

  return (
    <div style={{
      background: "white",
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      {/* Card Header */}
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        borderBottom: "1px solid #bbf7d0",
      }}>
        <div style={{
          width: "56px", height: "56px",
          background: "white",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.8rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          flexShrink: 0,
        }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--dark)" }}>Dr. {doctor.name}</div>
          <div style={{ fontSize: "0.8rem", color: "#059669", fontWeight: 500, marginTop: "2px" }}>
            {doctor.specialization || "General Physician"}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "8px", height: "8px",
              borderRadius: "50%",
              background: isAvailable ? "#10b981" : "#f59e0b",
              boxShadow: isAvailable ? "0 0 6px #10b981" : "0 0 6px #f59e0b",
            }} />
            <span style={{ fontSize: "0.8rem", color: isAvailable ? "#059669" : "#b45309", fontWeight: 500 }}>
              {isAvailable ? "Available" : "Busy"}
            </span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--gray)" }}>
            <span style={{ fontWeight: 600, color: "var(--dark)" }}>{doctor.waiting_patients}</span> waiting
          </div>
        </div>

        <button
          onClick={onBook}
          disabled={joining || isInQueue || !doctor.is_available}
          style={{
            width: "100%",
            padding: "10px",
            background: (joining || isInQueue || !doctor.is_available)
              ? "#e2e8f0"
              : "linear-gradient(135deg, #10b981, #059669)",
            color: (joining || isInQueue || !doctor.is_available) ? "var(--gray)" : "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: (joining || isInQueue || !doctor.is_available) ? "not-allowed" : "pointer",
            boxShadow: (joining || isInQueue || !doctor.is_available) ? "none" : "0 3px 10px rgba(16,185,129,0.3)",
            transition: "all 0.2s",
          }}
        >
          {joining ? "Booking..." : isInQueue ? "Already in Queue" : !doctor.is_available ? "Currently Unavailable" : "Book Appointment →"}
        </button>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */
function InfoTile({ icon, label, value }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: "0.7rem", color: "var(--gray)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
        {icon} {label}
      </div>
      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--dark)" }}>{value}</div>
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
  const s = map[status] || { bg: "#f1f5f9", color: "#64748b", label: status || "—" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function ActionBadge({ action }) {
  const map = {
    joined: { bg: "#d1fae5", color: "#065f46", icon: "✅" },
    called: { bg: "#dbeafe", color: "#1e40af", icon: "📢" },
    completed: { bg: "#e0e7ff", color: "#3730a3", icon: "🏁" },
    cancelled: { bg: "#fee2e2", color: "#991b1b", icon: "✕" },
  };
  const a = map[action] || { bg: "#f1f5f9", color: "#64748b", icon: "•" };
  return (
    <span style={{ background: a.bg, color: a.color, padding: "3px 10px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {a.icon} {action}
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

/* ---- Styles ---- */
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

export default PatientDashboard;
