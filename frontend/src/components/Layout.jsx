import { useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ color: "white" }}>Smart Queue</h2>
        <hr />

        {role === "admin" && (
          <>
            <button style={menuButton} onClick={() => navigate("/admin")}>
              Dashboard
            </button>
          </>
        )}

        {role === "doctor" && (
          <>
            <button style={menuButton} onClick={() => navigate("/doctor")}>
              Dashboard
            </button>
          </>
        )}

        {role === "patient" && (
          <>
            <button style={menuButton} onClick={() => navigate("/patient")}>
              Dashboard
            </button>
          </>
        )}

        <button style={logoutButton} onClick={logout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px", background: "#f4f6f9" }}>
        {children}
      </div>
    </div>
  );
}

const sidebarStyle = {
  width: "220px",
  background: "#2c3e50",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
};

const menuButton = {
  margin: "10px 0",
  padding: "10px",
  background: "#34495e",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const logoutButton = {
  marginTop: "auto",
  padding: "10px",
  background: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default Layout;
