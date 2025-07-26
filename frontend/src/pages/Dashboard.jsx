import axios from "axios";
import {
  Car,
  Coffee,
  DollarSign,
  Filter,
  Heart,
  MapPin,
  Search,
  Utensils,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [location, setLocation] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError("");
        const url = `${
          import.meta.env.VITE_API_BASE_URL
        }/api/hotel/hotel-rooms`;

        const response = await axios.get(url);
        setHotels(response.data);
      } catch (err) {
        setError("Error fetching hotel rooms.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleLocationChange = (e) => setLocation(e.target.value);
  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) =>
      name === "min" ? [Number(value), prev[1]] : [prev[0], Number(value)]
    );
  };

  const toggleFavorite = async (hotelId) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("Please login to use wishlist.");
        return;
      }

      if (favorites.has(hotelId)) {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/wishlist/${hotelId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFavorites((prev) => {
          const newFavs = new Set(prev);
          newFavs.delete(hotelId);
          return newFavs;
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/wishlist/`,
          { hotelRoomId: hotelId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Added to wishlist!");
        setFavorites((prev) => new Set(prev).add(hotelId));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to wishlist!");

      // alert("Failed to update wishlist. Please try again.");
    }
  };

  const goToHotelDetails = (hotelId) => {
    navigate(`/hotel/${hotelId}`);
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: <Wifi className="w-4 h-4" />,
      parking: <Car className="w-4 h-4" />,
      restaurant: <Utensils className="w-4 h-4" />,
      spa: <Coffee className="w-4 h-4" />,
    };
    return icons[amenity] || <Coffee className="w-4 h-4" />;
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.location.toLowerCase().includes(location.toLowerCase()) &&
      (hotel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      hotel.pricePerNight >= priceRange[0] &&
      hotel.pricePerNight <= priceRange[1]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Finding amazing hotels for you...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="sticky top-20 z-40 bg-white shadow-md">
          <div className="w-full flex items-center justify-between px-4 py-3">
            <div className="flex justify-end w-full px-4">
              <div className="flex items-center max-w-xs bg-gray-100 rounded-full px-2 py-1">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hotels..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-100 px-2 py-1 focus:outline-none rounded-full text-sm text-gray-700"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full ml-4 transition-colors"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg px-6 py-4 mb-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Filter Hotels
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" /> Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={handleLocationChange}
                    placeholder="Enter location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" /> Min Price
                  </label>
                  <input
                    type="number"
                    name="min"
                    value={priceRange[0]}
                    onChange={handlePriceRangeChange}
                    placeholder="Min price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" /> Max Price
                  </label>
                  <input
                    type="number"
                    name="max"
                    value={priceRange[1]}
                    onChange={handlePriceRangeChange}
                    placeholder="Max price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* HotelsGrid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pt-12 pb-6">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <div
                key={hotel._id}
                className="relative bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 overflow-hidden max-w-sm mx-auto border border-gray-200"
              >
                {/* Wishlist Icon */}
                <button
                  onClick={() => toggleFavorite(hotel._id)}
                  className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow ${
                    favorites.has(hotel._id)
                      ? "text-red-500 hover:bg-gray-100"
                      : "text-gray-600 hover:bg-red-500 hover:text-white"
                  } transition-colors`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.has(hotel._id)
                        ? "text-red-500"
                        : "text-gray-600"
                    }`}
                    fill={favorites.has(hotel._id) ? "currentColor" : "none"}
                  />
                </button>

                {/* Hotel Image */}
                <img
                  src={`${
                    import.meta.env.VITE_API_BASE_URL
                  }/hotel_room_images/${hotel.image}`}
                  alt={hotel.title}
                  className="w-full h-60 object-cover cursor-pointer"
                  onClick={() => goToHotelDetails(hotel._id)}
                />

                {/* Hotel Info */}
                <div className="p-4 text-center">
                  <h3 className="text-xl font-bold mb-1">{hotel.title}</h3>
                  <p className="text-gray-500 mb-2">{hotel.location}</p>
                  <p className="text-gray-600 mb-4">
                    {hotel.description?.length > 70
                      ? hotel.description.substring(0, 70) + "..."
                      : hotel.description || "No description available."}
                  </p>
                  <p className="text-green-600 font-bold text-lg mb-4">
                    ${hotel.pricePerNight}/night
                  </p>
                  <button
                    onClick={() => goToHotelDetails(hotel._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🏨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Hotels Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
