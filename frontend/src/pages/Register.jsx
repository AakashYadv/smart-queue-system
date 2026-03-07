import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const SPECIALIZATIONS = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
  "Dermatology", "Ophthalmology", "ENT", "General Physician",
  "Gynecology", "Psychiatry", "Radiology", "Oncology",
  "Urology", "Nephrology", "Gastroenterology", "Pulmonology",
];

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialization: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.role === "doctor" && !form.specialization) {
      setError("Please select your specialization");
      return;
    }

    setLoading(true);
    try {
      await API.post("/users/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        specialization: form.role === "doctor" ? form.specialization : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to server. Please ensure the backend is running.");
      } else {
        setError(err.response?.data?.detail || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      position: "relative",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      {/* Background blobs */}
      <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "-200px", left: "-200px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />

      <div style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "48px",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "52px", height: "52px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem",
            margin: "0 auto 16px",
            boxShadow: "0 8px 20px rgba(99,102,241,0.35)",
          }}>🏨</div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 700, margin: "0 0 6px" }}>Create Account</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Join the Smart Queue System</p>
        </div>

        {/* Success */}
        {success && (
          <div style={{
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.35)",
            borderRadius: "12px",
            padding: "16px 20px",
            textAlign: "center",
            marginBottom: "20px",
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>✅</div>
            <div style={{ color: "#34d399", fontWeight: 600, fontSize: "0.95rem" }}>Registration Successful!</div>
            <div style={{ color: "#6ee7b7", fontSize: "0.8rem", marginTop: "4px" }}>Redirecting to login...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#f87171",
            fontSize: "0.875rem",
            marginBottom: "20px",
          }}>⚠️ {error}</div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>I am a</label>
              <div style={{ display: "flex", gap: "10px" }}>
                {["patient", "doctor"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: r }))}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: `2px solid ${form.role === r ? (r === "doctor" ? "#0ea5e9" : "#10b981") : "rgba(255,255,255,0.08)"}`,
                      background: form.role === r
                        ? (r === "doctor" ? "rgba(14,165,233,0.12)" : "rgba(16,185,129,0.12)")
                        : "rgba(255,255,255,0.03)",
                      color: form.role === r ? "white" : "#64748b",
                      fontSize: "0.9rem",
                      fontWeight: form.role === r ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {r === "doctor" ? "👨‍⚕️" : "🧑"} {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="Dr. John Smith"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Specialization (doctors only) */}
            {form.role === "doctor" && (
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Specialization</label>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="" style={{ background: "#1e293b" }}>Select your specialization...</option>
                  {SPECIALIZATIONS.map(s => (
                    <option key={s} value={s} style={{ background: "#1e293b" }}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  ...inputStyle,
                  borderColor: form.confirmPassword && form.password !== form.confirmPassword
                    ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "4px" }}>Passwords do not match</div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 15px rgba(99,102,241,0.4)",
                transition: "all 0.2s",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>
        )}

        {/* Link to login */}
        <div style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}>
          <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Already have an account? </span>
          <Link to="/" style={{ color: "#818cf8", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "0.78rem",
  fontWeight: 500,
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle = {
  width: "100%",
  padding: "11px 16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

export default Register;
