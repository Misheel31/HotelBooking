import axios from "axios";
import { useEffect, useState } from "react";
import AdminSidebar from "../Admin/AdminSideBar";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log(localStorage.getItem("adminToken"));
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/booking/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        setBookings(response.data);
      } catch (err) {
        setError("Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "text-green-600 font-semibold";
      case "Pending":
        return "text-yellow-600 font-semibold";
      case "Cancelled":
        return "text-red-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 p-6 ml-0 md:ml-64 transition-all duration-300">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mb-4 px-3 py-2 bg-blue-600 text-white rounded-md md:hidden"
        >
          {sidebarOpen ? "Close Menu" : "Open Menu"}
        </button>

        <h2 className="text-3xl font-bold mb-6">Booking List</h2>

        {loading && <p>Loading bookings...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && bookings.length === 0 && <p>No bookings found.</p>}

        {!loading && bookings.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">
                    Booking ID
                  </th>
                  <th className="border border-gray-300 px-4 py-2">User</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Hotel Room
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Check-In</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Check-Out
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Guests</th>
                  <th className="border border-gray-300 px-4 py-2">Rooms</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Total Price
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Payment Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {booking._id}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {booking.userId?.name || ""}
                      <br />
                      <small className="text-gray-500">
                        {booking.userId?.email}
                      </small>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {booking.hotelRoomId?.hotelName || "N/A"}
                      <br />
                      <small className="text-gray-500">
                        {booking.hotelRoomId?.title}
                      </small>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {new Date(booking.checkInDate).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {new Date(booking.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {booking.guests}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {booking.rooms}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      ${booking.totalPrice.toFixed(2)}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-2 text-sm ${getStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus || "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingList;
