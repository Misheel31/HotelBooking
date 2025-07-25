import axios from "axios";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSideBar";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/user/");
        console.log("Fetched users:", response.data);
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Error fetching users.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="ml-64 p-8">Loading users...</div>;
  if (error) return <div className="ml-64 p-8">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 ml-64 p-8">
        <h2 className="text-3xl font-bold mb-4">Registered Users</h2>

        {users.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md"
              >
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserList;
