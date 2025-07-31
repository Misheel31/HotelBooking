import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "./App.css";
import ActivityLogs from "./pages/Admin/activityLog";
import AdminManage from "./pages/Admin/AdminManage";
import AdminPage from "./pages/Admin/AdminPage";
import BookingList from "./pages/Admin/BookingList";
import CreateHotelRoom from "./pages/Admin/CreateProperty";
import UserList from "./pages/Admin/UserList";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/homePage";
import Hotel from "./pages/hotel";
import HotelDetails from "./pages/hotelDetail";
import LoginPage from "./pages/Login";
import MyBookings from "./pages/MyBooking";
import Profile from "./pages/profile";
import RegisterPage from "./pages/Register";
import SuccessPage from "./pages/Success";
import ForgotPassword from "./pages/UserForgetPassword";
import ResetPassword from "./pages/UserResetPassword";
import VerifyOTPPage from "./pages/verifyOtpPage";
import HotelWishlist from "./pages/Wishlist";

function RequireAuth({ children }) {
  const isAuthenticated = localStorage.getItem("adminToken");
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Unauthorized access. Please login first.");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={2000} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/hotel/:hotelId" element={<HotelDetails />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/hotels" element={<Hotel />} />
        <Route path="/wishlist" element={<HotelWishlist />} />
        <Route path="/my-booking" element={<MyBookings />} />
        <Route path="/sucess" element={<SuccessPage />} />
        <Route path="/resetpassword/:id" element={<ResetPassword />} />

        <Route path="/success" element={<SuccessPage />} />

        {/* Protect admin routes */}
        <Route
          path="/create"
          element={
            <RequireAuth>
              <CreateHotelRoom />
            </RequireAuth>
          }
        />

        <Route
          path="/users"
          element={
            <RequireAuth>
              <UserList />
            </RequireAuth>
          }
        />

        <Route
          path="/BookingList"
          element={
            <RequireAuth>
              <BookingList />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin-manage-hotel/:id"
          element={
            <RequireAuth>
              <AdminManage />
            </RequireAuth>
          }
        />
        <Route
          path="/activity-log"
          element={
            <RequireAuth>
              <ActivityLogs />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}

export default App;
