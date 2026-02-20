import axios from "axios";
import { server } from "../main";
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
      const { data } = await axios.get(`${server}/api/v1/me`, {
        withCredentials: true,
      });
      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      toast.error(error.response.data.message[0]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{ user, isAuth, loading, fetchUser, setIsAuth }}
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
