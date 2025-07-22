import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { useAuth } from "../Context/AuthContext";

const stripePromise = loadStripe(
  "pk_test_51RmBZJFwQ8tk2DXixUr4UuvfkdS0AUkoo8D77THE1kgvc8kOBIsO7SIU9pWQfH2HDfnz2t2oXTcqlBP1V5HAw8vj00Mg90XtKR"
);

const MyBookings = () => {
  const { token, _id } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchBookings = async () => {
    if (!_id) return;

    try {
      const res = await axios.get(`http://localhost:3000/api/booking/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Bookings fetched:", res.data);
      setBookings(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [_id, token]);

  const handleCheckout = async (booking) => {
    setProcessingId(booking._id);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/booking/create-checkout-session",
        {
          totalPrice: booking.totalPrice,
          bookingId: booking._id,
          title: booking.hotelRoomId?.title || "Booking Payment",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Checkout session response:", res.data);

      const sessionId = res.data.id;

      if (!sessionId) {
        alert("Failed to create payment session. Please try again.");
        setProcessingId(null);
        return;
      }

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        setError("Payment failed. Please try again.");
        toast.error("Payment failed. Please try again.");
        console.error("Stripe error:", error);
      } else {
        setSuccess("Booking Confirmed!");
        toast.success("Booking confirmed!");
        fetchBookings();
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("Failed to start payment. Try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await axios.delete(`http://localhost:3000/api/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Booking canceled.");
      toast.success("Booking canceled.");
      fetchBookings();
    } catch (err) {
      console.error(err);
      setError("Failed to cancel booking.");
      toast.error("Failed to cancel booking.");
    }
  };

  if (!_id)
    return (
      <div className="text-center mt-10">
        Please log in to see your bookings.
      </div>
    );
  if (loading)
    return <div className="text-center mt-10">Loading your bookings...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (bookings.length === 0)
    return <div className="text-center mt-10">You have no bookings yet.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <Navbar />
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        My Bookings
      </h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {bookings.map((booking) => (
          <li
            key={booking._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            <div className="w-full h-48 bg-gray-100">
              {booking.hotelRoomId?.image ? (
                <img
                  src={`http://localhost:3000/hotel_room_images/${booking.hotelRoomId.image}`}
                  alt={booking.hotelRoomId.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center text-gray-400 italic">
                  No image available
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {booking.hotelRoomId?.title || "Hotel"}
                </h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Check-in:</span>{" "}
                  {new Date(booking.checkInDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Check-out:</span>{" "}
                  {new Date(booking.checkOutDate).toLocaleDateString()}
                </p>
                <p className="text-gray-800 font-semibold mt-3">
                  Total Price: ${booking.totalPrice.toFixed(2)}
                </p>
              </div>

              <div className="mt-6 flex space-x-4">
                {booking.paymentStatus === "Paid" ? (
                  <button
                    className="flex-1 bg-gray-400 text-white py-2 rounded-md font-semibold cursor-not-allowed"
                    disabled
                  >
                    Paid
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(booking)}
                    disabled={processingId === booking._id}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2 rounded-md font-semibold transition"
                  >
                    {processingId === booking._id
                      ? "Processing..."
                      : "Checkout"}
                  </button>
                )}

                <button
                  onClick={() => handleCancel(booking._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyBookings;
