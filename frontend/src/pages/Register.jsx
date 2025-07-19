import axios from "axios";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  Star,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [data, setData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthVisible, setPasswordStrengthVisible] = useState(false);

  useEffect(() => {
    setPasswordMatch(
      data.password === data.confirmPassword || data.confirmPassword === ""
    );
  }, [data.password, data.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "password") {
      if (value.length > 0) {
        const result = zxcvbn(value);
        setPasswordStrength(result.score);
        setPasswordStrengthVisible(true);
      } else {
        setPasswordStrengthVisible(false);
      }
    }
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          username: data.username,
          email: data.email,
          phone: data.phone,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }
      );

      setSuccess("Registration successful!");
      setLoading(false);

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Error during registration:", error.message, error.stack);
      setError(
        error.response?.data?.error || "An error occurred during registration."
      );
      setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50 px-4 py-10">
      <div className="flex w-full max-w-6xl bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
        {/* Left Image Section */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10"></div>
          <div
            className="h-full w-full bg-cover bg-center transform scale-105 hover:scale-110 transition-transform duration-700"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23bg)' /%3E%3C/svg%3E\")",
              clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
            }}
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <div className="flex justify-center gap-1 mb-4">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Join Our Community</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Exclusive member rates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Free room upgrades</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span>Priority booking access</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span>Loyalty rewards program</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-10 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Start your luxury travel journey with us
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center mb-4">
              {success}
            </div>
          )}

          <form onSubmit={registerUser} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                name="username"
                value={data.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/80 outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Username"
                required
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/80 outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Email address"
                required
              />
            </div>

            <div className="relative group">
              <Phone className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="tel"
                name="phone"
                value={data.phone}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/80 outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Phone number"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={data.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/80 outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Password"
                required
              />
              <div
                className="absolute right-4 top-3.5 cursor-pointer text-gray-400 hover:text-blue-500 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </div>
              {passwordStrengthVisible && (
                <PasswordStrengthBar score={passwordStrength} />
              )}
            </div>

            <div className="relative group">
              <Shield className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3.5 border ${
                  !passwordMatch && data.confirmPassword
                    ? "border-red-300 bg-red-50/50"
                    : "border-gray-200 bg-white/50"
                } rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/80 outline-none transition-all duration-200 placeholder-gray-400`}
                placeholder="Confirm Password"
                required
              />
              <div
                className="absolute right-4 top-3.5 cursor-pointer text-gray-400 hover:text-blue-500 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </div>
            </div>

            {!passwordMatch && data.confirmPassword && (
              <p className="text-red-500 text-sm -mt-2 ml-1">
                Passwords do not match
              </p>
            )}

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                required
              />
              <label className="text-sm text-gray-600 leading-relaxed">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={!passwordMatch || loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors"
              >
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
