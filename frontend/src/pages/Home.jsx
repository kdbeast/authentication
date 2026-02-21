import { AppData } from "../context/appContext";

const Home = () => {
  const { logout } = AppData();
  return (
    <div className="text-white flex items-center justify-center h-screen w-screen">
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
