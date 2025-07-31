import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem("pendingUserId");
    if (!userId) {
      toast.error("User ID not found. Please login again.");
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-login-otp`,
        { userId, otp }
      );

      const { token, user } = response.data;

      login(token, user.username, user._id); 

      toast.success("Login successful!");
      localStorage.removeItem("pendingUserId");

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.log("OTP verification error:", err.response?.data);
      toast.error(
        err.response?.data?.error || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleVerifyOTP}
        className="bg-white p-8 rounded-lg shadow-md w-96 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default VerifyOTPPage;
