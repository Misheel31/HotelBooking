import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSideBar";

const AdminPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch hotels from the backend
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/hotel/hotel-rooms`
        );
        setHotels(response.data);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        toast.error("Failed to fetch hotels.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  // Handle hotel deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/hotel/hotel-rooms/${id}`);
      setHotels((prevHotels) => prevHotels.filter((hotel) => hotel._id !== id));
      toast.success("Hotel deleted successfully");
    } catch (error) {
      console.error("Error deleting hotel:", error);
      toast.error("Failed to delete the hotel.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64">
        <AdminSidebar />
      </div>

      {/* Main content aligned to right side */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md ml-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Hotel Management
        </h2>

        {loading ? (
          <div className="text-center py-20">Loading hotels...</div>
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/AdminManageHotelDetails/${hotel._id}`}>
                  <img
                    src={`http://localhost:3000/hotel_room_images/${hotel.image}`}
                    alt={hotel.title}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-1">{hotel.title}</h3>
                  <p className="text-gray-600 mb-2">
                    Location: {hotel.location || "Unknown"}
                  </p>
                  <p className="text-lg font-bold mb-4">
                    Price per Night: ${hotel.pricePerNight}
                  </p>

                  <div className="flex justify-between">
                    <Link to={`/admin-manage-hotel/${hotel._id}`}>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(hotel._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No hotels available.</div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
