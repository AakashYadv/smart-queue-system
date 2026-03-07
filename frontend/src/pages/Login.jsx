import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await API.post(
        "/auth/login",
        new URLSearchParams({ username: email, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const userRes = await API.get("/auth/me");
      const { role, name, id } = userRes.data;
      localStorage.setItem("role", role);
      localStorage.setItem("name", name || "");
      localStorage.setItem("userId", id || "");

      if (role === "patient") navigate("/patient");
      else if (role === "doctor") navigate("/doctor");
      else if (role === "admin") navigate("/admin");
    } catch (err) {
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Connection timed out. Make sure the backend server is running on port 8000.");
      } else if (!err.response) {
        setError("Cannot connect to server. Please ensure the backend is running at http://127.0.0.1:8000");
      } else if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(`Error: ${err.response?.data?.detail || err.message}`);
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
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", bottom: "-200px", left: "-200px",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />

      {/* Left panel */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px",
        maxWidth: "520px",
      }}>
        <div style={{ marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "12px",
            padding: "10px 16px",
            marginBottom: "32px",
          }}>
            <span style={{ fontSize: "1.5rem" }}>🏨</span>
            <span style={{ color: "#a5b4fc", fontWeight: 600, fontSize: "0.9rem" }}>Smart Queue System</span>
          </div>

          <h1 style={{
            fontSize: "2.8rem",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
            marginBottom: "16px",
          }}>
            Welcome back
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6 }}>
            Sign in to manage your queue efficiently. Streamlined healthcare for everyone.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { icon: "⚡", text: "Real-time queue updates" },
            { icon: "🔒", text: "Secure role-based access" },
            { icon: "📊", text: "Live analytics dashboard" },
          ].map((f) => (
            <div key={f.text} style={{
              display: "flex", alignItems: "center", gap: "12px",
              color: "#94a3b8", fontSize: "0.875rem",
            }}>
              <span style={{
                width: "32px", height: "32px",
                background: "rgba(99,102,241,0.1)",
                borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem",
              }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "48px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}>
          <h2 style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
            Sign in
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "32px" }}>
            Enter your credentials to continue
          </p>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#f87171",
              fontSize: "0.875rem",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

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
                transition: "all 0.2s ease",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Don't have an account? </span>
            <Link to="/register" style={{ color: "#818cf8", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
