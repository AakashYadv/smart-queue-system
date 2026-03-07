import { useState } from "react";

/**
 * Hospital Reception Check-In Page
 * Staff scans patient QR code → shows token info
 * No auth required — public page for hospital kiosk/reception
 */
function CheckIn() {
  const [tokenInput, setTokenInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Parse QR data (JSON string from QR scan)
  const handleCheckIn = () => {
    setError("");
    setResult(null);

    if (!tokenInput.trim()) {
      setError("Please enter or paste the QR code data");
      return;
    }

    try {
      const data = JSON.parse(tokenInput.trim());
      if (!data.token) throw new Error("Invalid QR data");
      setResult(data);
    } catch {
      // Try treating as plain token number
      if (tokenInput.trim().startsWith("TKN-")) {
        setResult({ token: tokenInput.trim(), manual: true });
      } else {
        setError("Invalid QR code data. Please scan a valid Smart Queue QR code.");
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          width: "64px", height: "64px",
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          borderRadius: "18px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2rem",
          margin: "0 auto 16px",
          boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
        }}>🏨</div>
        <h1 style={{ color: "white", fontSize: "1.8rem", fontWeight: 700, margin: "0 0 8px" }}>
          Hospital Check-In
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          Scan or paste QR code data to verify patient token
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "40px",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}>
        {!result ? (
          <>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              QR Code Data / Token Number
            </label>
            <textarea
              rows={4}
              placeholder='Paste QR data here, e.g. {"token":"TKN-001-0001","patient_id":1,...} or just TKN-001-0001'
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "white",
                fontSize: "0.85rem",
                outline: "none",
                resize: "vertical",
                fontFamily: "monospace",
                boxSizing: "border-box",
                marginBottom: "16px",
              }}
            />

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#f87171",
                fontSize: "0.85rem",
                marginBottom: "16px",
              }}>⚠️ {error}</div>
            )}

            <button
              onClick={handleCheckIn}
              style={{
                width: "100%",
                padding: "13px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
              }}
            >
              ✓ Verify & Check In
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "72px", height: "72px",
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem",
              margin: "0 auto 20px",
            }}>✅</div>

            <h2 style={{ color: "white", fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px" }}>
              Check-In Successful!
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "28px" }}>
              Patient verified and checked in
            </p>

            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "20px",
              textAlign: "left",
              marginBottom: "24px",
            }}>
              {[
                { label: "Token Number", value: result.token, mono: true, highlight: true },
                result.patient_id && { label: "Patient ID", value: `#${result.patient_id}` },
                result.doctor_id && { label: "Doctor ID", value: `#${result.doctor_id}` },
                result.patient_email && { label: "Patient Email", value: result.patient_email },
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{item.label}</span>
                  <span style={{
                    color: item.highlight ? "#34d399" : "white",
                    fontWeight: item.highlight ? 700 : 500,
                    fontSize: item.mono ? "1rem" : "0.875rem",
                    fontFamily: item.mono ? "monospace" : "inherit",
                    background: item.highlight ? "rgba(52,211,153,0.1)" : "transparent",
                    padding: item.highlight ? "3px 10px" : "0",
                    borderRadius: item.highlight ? "6px" : "0",
                  }}>{item.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setResult(null); setTokenInput(""); }}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              ← Check In Another Patient
            </button>
          </div>
        )}
      </div>

      <p style={{ color: "#475569", fontSize: "0.75rem", marginTop: "24px" }}>
        Smart Queue System · Hospital Reception Portal
      </p>
    </div>
  );
}

export default CheckIn;
