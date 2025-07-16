import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Header from "../components/Navbar";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");

  const forgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/forgotpassword",
        {
          email,
        }
      );

      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success("OTP sent to your email");
        localStorage.setItem("resetEmail", email);
        navigate("/resetpassword/:id");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
          <h4 className="text-2xl font-semibold text-center mb-4">
            Forgot Password
          </h4>
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}
          <form onSubmit={forgotPassword}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter Email"
                autoComplete="off"
                name="email"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-pink-500 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 cursor-pointer"
            >
              Send OTP
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
