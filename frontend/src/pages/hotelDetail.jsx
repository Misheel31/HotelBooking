import axios from "axios";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  MapPin,
  Shield,
  Star,
  Tv,
  Users,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { useAuth } from "../Context/AuthContext";

const HotelDetails = () => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("standard");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [success, setSuccess] = useState("");

  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { _id, token } = useAuth();

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/hotel/hotel-rooms/${hotelId}`
        );
        const data = res.data;

        if (!data.roomTypes || data.roomTypes.length === 0) {
          data.roomTypes = [
            {
              type: "standard",
              name: "Standard Room",
              price: data.pricePerNight || 199,
              size: "320 sq ft",
              capacity: data.maxGuests || 2,
              beds: `${data.bedCount || 1} Bed(s)`,
              features: ["Free Wi-Fi", "Air Conditioning", "City View"],
            },
            {
              type: "deluxe",
              name: "Deluxe Room",
              price: (data.pricePerNight || 199) + 100,
              size: "450 sq ft",
              capacity: data.maxGuests || 3,
              beds: `${data.bedCount || 1} King Bed + Sofa`,
              features: ["Smart TV", "Mini Bar", "Work Desk"],
            },
          ];
        }

        if (!data.amenities || data.amenities.length === 0) {
          data.amenities = [
            { icon: <Wifi className="w-5 h-5" />, name: "Free Wi-Fi" },
            { icon: <Car className="w-5 h-5" />, name: "Parking" },
            { icon: <Dumbbell className="w-5 h-5" />, name: "Gym" },
            { icon: <Waves className="w-5 h-5" />, name: "Pool" },
            { icon: <Tv className="w-5 h-5" />, name: "TV" },
            { icon: <Wind className="w-5 h-5" />, name: "A/C" },
          ];
        }

        data.images =
          data.images && data.images.length > 0
            ? data.images.map(
                (img) => `http://localhost:3000/hotel_room_images/${img}`
              )
            : [`http://localhost:3000/hotel_room_images/${data.image}`];

        setHotel(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error fetching hotel details.");
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  const selectedRoomData = hotel?.roomTypes.find(
    (room) => room.type === selectedRoom
  );
  const totalPrice = selectedRoomData ? selectedRoomData.price * roomCount : 0;

  const handleBooking = async () => {
    if (!_id) {
      alert("Please login to book a room.");
      return;
    }
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    try {
      const bookingData = {
        userId: _id,
        hotelRoomId: hotel._id,
        checkInDate,
        checkOutDate,
        guests: guestCount,
        rooms: roomCount,
        totalPrice: totalPrice + Math.round(totalPrice * 0.15),
      };
      console.log("Booking data:", bookingData);
      console.log("Token from context:", token);
      await axios.post(
        "http://localhost:3000/api/booking/create",
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Booking successful!");
      toast.success("Booking successful!");
      // navigate("/my-booking");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Booking failed. Please try again.");
      toast.error("Booking failed. Please try again.");
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === hotel.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? hotel.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading hotel details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!hotel) return null;

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: <Wifi className="w-5 h-5" />,
      parking: <Car className="w-5 h-5" />,
      gym: <Dumbbell className="w-5 h-5" />,
      pool: <Waves className="w-5 h-5" />,
      tv: <Tv className="w-5 h-5" />,
      ac: <Wind className="w-5 h-5" />,
    };
    return icons[amenity.toLowerCase()] || <Wifi className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="relative mb-8 rounded-2xl overflow-hidden bg-gray-900">
          <div className="relative h-[500px]">
            <img
              src={hotel.images[currentImageIndex]}
              alt={hotel.title || hotel.hotelName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Hotel Info */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{hotel.location}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {hotel.title || hotel.hotelName}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(hotel.rating || 4.5)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 font-semibold">{hotel.rating || 4.5}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">About this hotel</h2>
              <p className="text-gray-700 leading-relaxed">
                {hotel.description}
              </p>
            </div>
            {/* Room Types */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Room Types</h2>
              <div className="space-y-4">
                {hotel.roomTypes.map((room) => (
                  <div
                    key={room.type}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRoom === room.type
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedRoom(room.type)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{room.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {room.size} • {room.beds}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Up to {room.capacity} guests
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {room.features.map((feature, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ${room.price}
                        </div>
                        <div className="text-sm text-gray-500">per night</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                {hotel.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="text-blue-600">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600">
                  ${totalPrice}
                </div>
                <div className="text-gray-600">
                  total for {roomCount} room(s)
                </div>
              </div>

              <div className="space-y-4">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Guests & Rooms */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Guests
                    </label>
                    <div className="flex items-center border p-3 rounded-lg">
                      <button
                        onClick={() =>
                          setGuestCount(Math.max(1, guestCount - 1))
                        }
                        className="px-2"
                      >
                        -
                      </button>
                      <span className="mx-3">{guestCount}</span>
                      <button
                        onClick={() =>
                          setGuestCount(Math.min(8, guestCount + 1))
                        }
                        className="px-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rooms
                    </label>
                    <div className="flex items-center border p-3 rounded-lg">
                      <button
                        onClick={() => setRoomCount(Math.max(1, roomCount - 1))}
                        className="px-2"
                      >
                        -
                      </button>
                      <span className="mx-3">{roomCount}</span>
                      <button
                        onClick={() => setRoomCount(Math.min(5, roomCount + 1))}
                        className="px-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      ${selectedRoomData?.price} x {roomCount}
                    </span>
                    <span>${selectedRoomData?.price * roomCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & fees</span>
                    <span>${Math.round(totalPrice * 0.15)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>${totalPrice + Math.round(totalPrice * 0.15)}</span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700"
                >
                  Book Now
                </button>

                <div className="text-center text-sm text-gray-500 mt-2">
                  <Shield className="w-4 h-4 inline" /> Free cancellation within
                  24 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
