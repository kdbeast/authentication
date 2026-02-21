import api from "../apiIntercepter";

import { useContext } from "react";
import { toast } from "react-toastify";
import { createContext, useEffect, useState } from "react";

const AppContext = createContext(null);

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/v1/me");
      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      toast.error(error.response.data.message[0]);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/v1/logout");
      setUser(null);
      setIsAuth(false);
      toast.success("Logout successful");
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error.response.data);
    }
  };

  return (
    <AppContext.Provider
      value={{ user, isAuth, loading, fetchUser, setIsAuth, logout }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppData must be used within an AppProvider");
  }
  return context;
};

export default AppProvider;
