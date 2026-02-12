import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(
        "/auth/login",
        new URLSearchParams({
          username: email,      // IMPORTANT: backend expects "username"
          password: password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const token = response.data.access_token;
      localStorage.setItem("token", token);

      // Set token in header for next request
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Get user details
      const userRes = await API.get("/auth/me");
      const role = userRes.data.role;
      localStorage.setItem("role",role);

      // Redirect based on role
      if (role === "patient") navigate("/patient");
      else if (role === "doctor") navigate("/doctor");
      else if (role === "admin") navigate("/admin");

    } catch (error) {
      console.error(error);
      alert("Invalid credentials ❌");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "150px" }}>
      <h2>Smart Queue Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
