import Navbar from "../components/Navbar"; 

const HomePage = () => {
  const properties = [
    { name: "Bali", image: "../src/assets/regImage.png" },
    { name: "Cornwall", image: "../src/assets/roomImg2.png" },
    { name: "London", image: "../src/assets/roomImg4.png" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-100 to-blue-300 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-blue-900 max-w-lg">
              <h1 className="text-4xl font-bold leading-tight mb-6">
                Book your dream hotel, anywhere, anytime
              </h1>
              <p className="text-lg mb-8">
                Discover top-rated hotels, budget stays, and luxurious resorts —
                all in one place.
              </p>
              <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
                Explore Hotels
              </button>
            </div>

            <div className="w-[500px] h-auto">
              <img
                src="../src/assets/heroImage.png"
                alt="Featured Hotel"
                className="rounded-[25px] shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Popular Locations */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">
            Popular Hotel Destinations
          </h2>
          <div className="relative">
            <div className="flex justify-center gap-8 overflow-x-auto py-4">
              {properties.map((hotel) => (
                <div
                  key={hotel.name}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-full h-full overflow-hidden rounded-lg mb-2 group-hover:shadow-lg">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-gray-700 font-medium text-lg">
                    {hotel.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">
            Why Choose HotelBooking?
          </h2>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="bg-white rounded-xl shadow-md p-6 max-w-sm mb-4 transform -rotate-3">
                <p className="text-gray-800 font-medium">Verified Hotels</p>
                <p className="text-gray-600">
                  Only listings verified by our team are displayed.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 max-w-sm ml-8 transform rotate-3">
                <p className="text-gray-800 font-medium">24/7 Support</p>
                <p className="text-gray-600">
                  Get assistance anytime from our friendly support staff.
                </p>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                  Trusted & Convenient
                </span>
                <h2 className="text-3xl font-bold mt-2 text-gray-800">
                  Your stay, your way
                </h2>
              </div>

              <p className="text-xl text-gray-600 leading-relaxed">
                From short business trips to long vacations, find your perfect
                stay effortlessly and securely with HotelBooking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
