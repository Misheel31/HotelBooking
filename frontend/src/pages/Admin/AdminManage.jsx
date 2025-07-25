import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const UpdateHotelRoom = () => {
  const { id } = useParams();

  const [data, setData] = useState({
    title: "",
    description: "",
    hotelName: "",
    location: "",
    image: "",
    pricePerNight: "",
    available: true,
    amenities: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch hotel room details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/hotel/hotel-rooms/${id}`
        );
        const hotelData = response.data;

        setData({
          title: hotelData.title || "",
          description: hotelData.description || "",
          hotelName: hotelData.hotelName || "",
          location: hotelData.location || "",
          image: hotelData.image || "",
          pricePerNight: hotelData.pricePerNight || "",
          available: hotelData.available || true,
          amenities: hotelData.amenities?.join(", ") || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching hotel room details:", error);
        toast.error("Failed to fetch hotel room details.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "amenities") {
        data[key]
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((amenity) => {
            formData.append("amenities[]", amenity);
          });
      } else if (key === "image" && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (key !== "image") {
        formData.append(key, data[key]);
      }
    });

    try {
      const response = await axios.put(
        `http://localhost:3000/api/hotel/hotel-rooms/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        toast.success("Hotel Room Updated Successfully");
        alert("Hotel Room Updated Successfully");
      } else {
        toast.error("Failed to update hotel room. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to update hotel room. Please try again later.");
      console.error(
        "Error updating hotel room:",
        error.response?.data || error.message
      );
    }
  };

  if (loading) {
    return (
      <p className="text-center text-lg font-medium">
        Loading hotel room details...
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* <div className="w-64">
        <AdminSidebar />
      </div> */}
      <h2 className="text-2xl font-semibold text-center mb-6">
        Update Hotel Room
      </h2>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title:
          </label>
          <input
            type="text"
            name="title"
            value={data.title}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description:
          </label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Hotel Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hotel Name:
          </label>
          <input
            type="text"
            name="hotelName"
            value={data.hotelName}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location:
          </label>
          <input
            type="text"
            name="location"
            value={data.location}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Image Preview & Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Image:
          </label>
          {data.image && (
            <img
              src={
                data.image instanceof File
                  ? URL.createObjectURL(data.image)
                  : `http://localhost:3000/hotel_room_images/${data.image}`
              }
              alt="Hotel Room"
              className="w-full h-40 object-cover mb-4 rounded-md"
            />
          )}
          <label className="block text-sm font-medium text-gray-700">
            Upload New Image:
          </label>
          <input
            type="file"
            name="image"
            onChange={(e) => {
              const file = e.target.files[0];
              setData({ ...data, image: file });
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Price Per Night */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price Per Night:
          </label>
          <input
            type="number"
            name="pricePerNight"
            value={data.pricePerNight}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Available:
          </label>
          <select
            name="available"
            value={data.available}
            onChange={(e) =>
              setData({ ...data, available: e.target.value === "true" })
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="true">Available</option>
            <option value="false">Not Available</option>
          </select>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amenities (comma separated):
          </label>
          <input
            type="text"
            name="amenities"
            value={data.amenities}
            placeholder="Amenities"
            className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
        >
          Update Hotel Room
        </button>
      </form>
    </div>
  );
};

export default UpdateHotelRoom;
