import axios from "axios";
import { useState } from "react";
import AdminSidebar from "../Admin/AdminSideBar";

const CreateHotelRoom = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hotelName: "",
    location: "",
    pricePerNight: "",
    amenities: "",
    image: null,
  });

  const [roomTypes, setRoomTypes] = useState([
    {
      type: "",
      name: "",
      price: "",
      size: "",
      capacity: "",
      beds: "",
      bathroomCount: "",
      maxGuests: "",
      features: "",
    },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleRoomTypeChange = (index, e) => {
    const { name, value } = e.target;
    const newRoomTypes = [...roomTypes];
    newRoomTypes[index][name] = value;
    setRoomTypes(newRoomTypes);
  };

  const addRoomType = () => {
    setRoomTypes((prev) => [
      ...prev,
      {
        type: "",
        name: "",
        price: "",
        size: "",
        capacity: "",
        beds: "",
        bathroomCount: "",
        maxGuests: "",
        features: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("hotelName", formData.hotelName);
    data.append("location", formData.location);
    data.append("pricePerNight", formData.pricePerNight);

    const amenitiesArr = formData.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    data.append("amenities", JSON.stringify(amenitiesArr));

    const parsedRoomTypes = roomTypes.map((rt) => ({
      ...rt,
      price: Number(rt.price),
      capacity: Number(rt.capacity),
      bathroomCount: Number(rt.bathroomCount),
      maxGuests: Number(rt.maxGuests),
      features: rt.features
        ? rt.features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : [],
    }));
    data.append("roomTypes", JSON.stringify(parsedRoomTypes));

    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await axios.post(
       `${import.meta.env.VITE_API_BASE_URL}/api/hotel/hotel-rooms/create`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Hotel room created successfully!");
    } catch (error) {
      console.error(
        "Error creating hotel room:",
        error.response?.data || error.message
      );
      alert("Failed to create hotel room");
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 p-8 ml-64">
        {!sidebarOpen && (
          <button
            className="mb-4 px-4 py-2 bg-gray-800 text-white rounded md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            Open Sidebar
          </button>
        )}

        <div className="max-w-3xl mx-auto mt-0 my-8 font-sans">
          <h2 className="text-2xl font-bold text-center mb-8">
            Create Hotel Room
          </h2>

          <form onSubmit={handleSubmit}>
            <section className="border border-gray-300 p-4 mb-6 rounded-md bg-gray-50">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                required
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                rows={4}
                className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                required
              />
              <input
                type="text"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleChange}
                placeholder="Hotel Name"
                className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                required
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                required
              />
              <input
                type="number"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleChange}
                placeholder="Price Per Night"
                className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                required
              />
              <input
                type="text"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="Amenities (comma separated, e.g. WiFi, Pool)"
                className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
              />
            </section>

            {/* Images */}
            <section className="border border-gray-300 p-4 mb-6 rounded-md bg-gray-50">
              <label className="block mb-2 font-medium">Upload Image</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              {formData.image && (
                <p className="text-sm text-gray-600">
                  {formData.image.name} selected
                </p>
              )}
            </section>

            {/* Room Types */}
            <section className="border border-gray-300 p-4 mb-6 rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Room Types</h3>
              {roomTypes.map((room, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 p-4 mb-4 rounded-md bg-white"
                >
                  <input
                    type="text"
                    name="type"
                    value={room.type}
                    onChange={(e) => handleRoomTypeChange(idx, e)}
                    placeholder="Type (e.g., Deluxe)"
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                    required
                  />
                  <input
                    type="text"
                    name="name"
                    value={room.name}
                    onChange={(e) => handleRoomTypeChange(idx, e)}
                    placeholder="Name"
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                    required
                  />
                  <input
                    type="number"
                    name="price"
                    value={room.price}
                    onChange={(e) => handleRoomTypeChange(idx, e)}
                    placeholder="Price"
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                    required
                  />
                  <input
                    type="text"
                    name="size"
                    value={room.size}
                    onChange={(e) => handleRoomTypeChange(idx, e)}
                    placeholder="Size"
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    name="capacity"
                    value={room.capacity}
                    onChange={(e) => handleRoomTypeChange(idx, e)}
                    placeholder="Capacity"
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    name="beds"
                    value={room.beds}
                    onChange={(e) => handleRoomTypeChange(idx, e)}
                    placeholder="Beds"
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    name="bathroomCount"
                    value={room.bathroomCount}
                    onChange={(e) => handleRoomTypeChange(idx, e)}
                    placeholder="Bathroom Count"
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    name="maxGuests"
                    value={room.maxGuests}
                    onChange={(e) => handleRoomTypeChange(idx, e)}
                    placeholder="Max Guests"
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    name="features"
                    value={room.features}
                    onChange={(e) => handleRoomTypeChange(idx, e)}
                    placeholder="Features (comma separated, e.g. Sea view, Balcony)"
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addRoomType}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Add Room Type
              </button>
            </section>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              Create Hotel Room
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateHotelRoom;
