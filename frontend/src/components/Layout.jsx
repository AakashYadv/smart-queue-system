import { useNavigate, useLocation } from "react-router-dom";

const navItems = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: "📊" },
  ],
  doctor: [
    { label: "Dashboard", path: "/doctor", icon: "🩺" },
  ],
  patient: [
    { label: "Dashboard", path: "/patient", icon: "🏥" },
  ],
};

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const items = navItems[role] || [];

  const roleColors = {
    admin: { accent: "#6366f1", light: "#e0e7ff", label: "Administrator" },
    doctor: { accent: "#0ea5e9", light: "#e0f2fe", label: "Doctor" },
    patient: { accent: "#10b981", light: "#d1fae5", label: "Patient" },
  };

  const theme = roleColors[role] || roleColors.patient;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{
        width: "260px",
        background: "var(--dark)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 100,
        boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
      }}>
        {/* Logo */}
        <div style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              width: "36px", height: "36px",
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>🏨</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}>Smart Queue</div>
              <div style={{ color: "var(--gray-light)", fontSize: "0.7rem" }}>Management System</div>
            </div>
          </div>

          {/* Role badge */}
          <div style={{
            background: `${theme.accent}22`,
            border: `1px solid ${theme.accent}44`,
            borderRadius: "8px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <div style={{
              width: "8px", height: "8px",
              borderRadius: "50%",
              background: theme.accent,
              boxShadow: `0 0 6px ${theme.accent}`,
            }} />
            <span style={{ color: theme.accent, fontSize: "0.8rem", fontWeight: 600 }}>{theme.label}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <div style={{ color: "var(--gray)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 12px", marginBottom: "8px" }}>
            Navigation
          </div>
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  background: isActive ? `${theme.accent}22` : "transparent",
                  color: isActive ? theme.accent : "var(--gray-light)",
                  border: isActive ? `1px solid ${theme.accent}33` : "1px solid transparent",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 400,
                  marginBottom: "4px",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--gray-light)"; }}}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 14px",
              borderRadius: "10px",
              background: "rgba(239,68,68,0.1)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.2)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: "260px",
        minHeight: "100vh",
        background: "var(--bg)",
        overflow: "auto",
      }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
