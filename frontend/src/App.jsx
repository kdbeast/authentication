import Home from "./pages/Home";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import { Routes, Route } from "react-router";

const App = () => {
  return (
    <div className="bg-gray-950 h-screen w-screen flex items-center justify-center">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verifyotp" element={<VerifyOtp />} />
      </Routes>
    </div>
  );
};

export default App;
