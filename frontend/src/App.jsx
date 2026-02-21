import Loading from "./Loading";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import { Routes, Route } from "react-router";
import { AppData } from "./context/appContext";

const App = () => {
  const { isAuth, loading } = AppData();
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="bg-gray-950 h-screen w-screen flex items-center justify-center">
          <Routes>
            <Route path="/" element={isAuth ? <Home /> : <Login />} />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route path="/verifyotp" element={isAuth ? <Home /> : <VerifyOtp />} />
          </Routes>
        </div>
      )}
    </>
  );
};

export default App;
