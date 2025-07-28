import { useEffect, useState } from "react";
import AdminSidebar from "../Admin/AdminSideBar";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/activity-log/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setLogs(data.logs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  if (loading) return <p>Loading activity logs...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex h-screen">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mb-4 px-3 py-2 bg-blue-600 text-white rounded-md md:hidden"
        >
          {sidebarOpen ? "Close Menu" : "Open Menu"}
        </button>

        <h2 className="text-2xl font-semibold mb-6">Activity Logs</h2>
        {logs.length === 0 ? (
          <p>No activity logs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Action
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    User
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    IP Address
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="even:bg-white odd:bg-gray-50 hover:bg-gray-200"
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      {log.action}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {log.userId && typeof log.userId === "object"
                        ? log.userId.username || log.userId.email || "Unknown"
                        : "System/Unknown"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {log.ipAddress || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
