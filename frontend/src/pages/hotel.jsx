import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const Hotel = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/hotel/hotel-rooms`
        );
        setHotels(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch hotels.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Loading hotels...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-14">
        <h1 className="text-3xl font-bold mb-6">All Hotels</h1>
        {hotels.length === 0 ? (
          <div className="text-gray-600">No hotels found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
              >
                <img
                  src={`${
                    import.meta.env.VITE_API_BASE_URL
                  }/hotel_room_images/${hotel.image}`}
                  alt={hotel.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-1">{hotel.title}</h2>
                  <p className="text-gray-600 text-sm mb-2">{hotel.location}</p>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {hotel.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-bold">
                      ${hotel.pricePerNight}/night
                    </span>
                    <button className="bg-blue-200 text-white px-3 py-1 rounded hover:bg-blue-400 transition text-sm cursor-pointer">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Hotel;
