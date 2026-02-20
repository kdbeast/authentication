import axios from "axios";
import { useState } from "react";
import { server } from "../main";
import { toast } from "react-toastify";
import { Link } from "react-router";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/v1/verify`,
        {
          email,
          otp,
        },
        { withCredentials: true },
      );
      toast.success(data.message);
      localStorage.clear("email");
    } catch (error) {
      toast.error(error.response.data.message[0]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="text-gray-500 body-font">
      <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">
        <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
          <h1 className="title-font font-medium text-3xl text-white">
            Slow-carb next level shoindcgoitch ethical authentic, poko scenester
          </h1>
          <p className="leading-relaxed mt-4">
            Poke slow-carb mixtape knausgaard, typewriter street art gentrify
            hammock starladder roathse. Craies vegan tousled etsy austin.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="lg:w-2/6 md:w-1/2 bg-gray-200 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0"
        >
          <h2 className="text-gray-900 text-lg font-medium title-font mb-5">
            Verify using OTP
          </h2>
          <div className="relative mb-4">
            <label htmlFor="otp" className="leading-7 text-sm text-gray-600">
              OTP
            </label>
            <input
              required
              id="otp"
              name="otp"
              value={otp}
              type="number"
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="text-white bg-indigo-600 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-700 rounded-2xl text-lg font-medium cursor-pointer"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          <Link to="/login" className="text-xs text-gray-500 mt-3">
            Go back to {" "}
            <span className="text-indigo-500 hover:text-indigo-600">
              Login
            </span>
          </Link>
        </form>
      </div>
    </section>
  );
};

export default VerifyOtp;
