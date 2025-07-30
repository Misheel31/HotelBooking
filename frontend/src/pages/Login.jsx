import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff, Lock, Mail, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";

const LoginPage = () => {
  const savedEmail = localStorage.getItem("rememberedEmail") || "";
  const [data, setData] = useState({ email: savedEmail, password: "" });
  const [rememberMe, setRememberMe] = useState(!!savedEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", data.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  }, [rememberMe, data.email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        data
      );

      const { token } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
        const decoded = jwtDecode(token);
        const role = decoded.role;
        console.log("Decoded user role:", role);

        toast.success("Login successful!");

        if (role === "admin") {
          localStorage.setItem("adminToken", token);
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (err) {
      console.log("Login error:", err.response?.status, err.response?.data);
      setError(err.response?.data?.error || "Login failed. Please try again.");
      toast.error(
        err.response?.data?.error || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
                // Note: Use relative URL or import images for production
                'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Cdefs%3E%3ClinearGradient id="bg" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="600" fill="url(%23bg)" /%3E%3C/svg%3E\')',
              clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
            }}
          />

          <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <h3 className="text-xl font-bold mb-2">
                Luxury Hotel Experience
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Premium locations worldwide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to continue your booking journey
            </p>
            <div className="flex justify-center gap-1 mt-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            </div>
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

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/80 outline-none transition-all duration-200 placeholder-gray-400"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={data.password}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                  required
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/80 outline-none transition-all duration-200 placeholder-gray-400"
                />
                <div
                  className="absolute right-4 top-3.5 cursor-pointer text-gray-400 hover:text-blue-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <a
                  href="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center text-gray-600 text-sm">
                New to our platform?{" "}
                <a
                  href="/register"
                  className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors"
                >
                  Create an account
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
