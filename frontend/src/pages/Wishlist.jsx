import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import Header from "../components/Navbar";
import { useAuth } from "../Context/AuthContext";

const HotelWishlist = () => {
  const [wishlistHotels, setWishlistHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { _id, token } = useAuth();

  useEffect(() => {
    if (!_id) {
      alert("Please log in to view your wishlist.");
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wishlist/${_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setWishlistHotels(data);
        } else {
          console.error("Expected array, got:", data);
          setWishlistHotels([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch wishlist:", error);
        alert("Failed to load wishlist. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [_id, token]);

  const handleRemove = async (hotel) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/wishlist/${hotel._id}`,
        {
          method: "DELETE",
        }
      );

      setWishlistHotels((prev) =>
        prev.filter((item) => item._id !== hotel._id)
      );
      toast.success("Remove from wishlist!");

      // alert("Removed from wishlist");
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      alert("Failed to remove the hotel from wishlist. Please try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex justify-center items-center">
          <p>Loading wishlist...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pb-24">
        <div className="relative w-full h-[180px] bg-white flex items-center justify-center pb-6">
          <h1 className="text-4xl font-bold text-gray-800">My Wishlist</h1>
        </div>

        {/* Wishlist Cards */}
        <div className="px-4 sm:px-10 -mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistHotels.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">
              No wishlist items found.
            </div>
          ) : (
            wishlistHotels.map((item) => {
              const hotel = item.hotelRoomId;
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative w-full aspect-[4/3] bg-gray-100">
                    <img
                      src={`${
                        import.meta.env.VITE_API_BASE_URL
                      }/hotel_room_images/${hotel.image}`}
                      alt={hotel.title}
                      className="w-full h-full object-cover"
                    />
                    <FaHeart
                      className="absolute top-3 right-3 text-red-500 text-xl cursor-pointer hover:scale-110 transition"
                      onClick={() => handleRemove(item)}
                      title="Remove from Wishlist"
                    />
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {hotel.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {hotel.location}
                      </p>
                      <p className="text-sm text-gray-700 mt-2 font-medium">
                        ${hotel.pricePerNight} / night
                      </p>
                    </div>
                    <button
                      className="mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md font-semibold transition"
                      onClick={() => alert("Navigate to hotel detail (todo)")}
                    >
                      View Hotel
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default HotelWishlist;
