import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Dashboard() {
  return <h2 style={{ textAlign: "center" }}>Dashboard</h2>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/patient" element={<PatientDashboard />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route
  path="/doctor"
  element={
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DoctorDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/patient"
  element={
    <ProtectedRoute allowedRoles={["patient"]}>
      <PatientDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

    </Routes>
  );
}

export default App;
