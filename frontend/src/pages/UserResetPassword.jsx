import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // For password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthVisible, setPasswordStrengthVisible] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("Email not found.");
      toast.error("Email not found.");
    }
  }, []);

  useEffect(() => {
    if (newPassword.length > 0) {
      const result = zxcvbn(newPassword);
      setPasswordStrength(result.score);
      setPasswordStrengthVisible(true);
    } else {
      setPasswordStrengthVisible(false);
    }
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is missing.");
      toast.error("Email not found.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/resetpassword",
        {
          email,
          otp,
          newPassword,
        }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.success);
        setError("");
        toast.success(response.data.success);
        localStorage.removeItem("resetEmail");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else if (response.data.error) {
        if (
          response.data.error ===
          "New password can't be the same as the old password."
        ) {
          setError("New password can't be the same as the old password.");
          toast.error("New password can't be the same as the old password.");
        } else {
          setError(response.data.error);
        }
        setSuccessMessage("");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
      setSuccessMessage("");
    }
  };

  const PasswordStrengthBar = ({ score }) => {
    const getColor = () => {
      switch (score) {
        case 0:
          return "bg-red-500";
        case 1:
          return "bg-orange-500";
        case 2:
          return "bg-yellow-500";
        case 3:
          return "bg-blue-500";
        case 4:
          return "bg-green-500";
        default:
          return "bg-gray-300";
      }
    };

    const getLabel = () => {
      switch (score) {
        case 0:
          return "Very Weak";
        case 1:
          return "Weak";
        case 2:
          return "Fair";
        case 3:
          return "Good";
        case 4:
          return "Strong";
        default:
          return "";
      }
    };

    return (
      <div className="mt-2">
        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className={`h-2 rounded ${getColor()}`}
            style={{ width: `${(score + 1) * 20}%` }}
          ></div>
        </div>
        <p className="text-sm mt-1">{getLabel()}</p>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h4 className="text-2xl font-semibold text-center mb-4">
          Reset Password
        </h4>
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}
        {successMessage && (
          <div className="text-green-500 text-sm text-center mb-4">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mb-4 w-full p-3 border border-gray-300 rounded-md"
            required
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 pr-10 border border-gray-300 rounded-md"
              required
            />
            <div
              className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-orange-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </div>
            {passwordStrengthVisible && (
              <PasswordStrengthBar score={passwordStrength} />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
