import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [_id, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUsername = localStorage.getItem("username");
    const savedUserId = localStorage.getItem("ID");

    if (token) {
      setIsLoggedIn(true);
      setUsername(savedUsername || "");
      setUserId(savedUserId || null);
    }
  }, []);

  const login = (token, username, userId) => {
    if (token && username && userId) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", username);
      localStorage.setItem("ID", userId);
      setIsLoggedIn(true);
      setUsername(username);
      setUserId(userId);
    } else {
      console.error("Missing token, username, or userId");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    localStorage.removeItem("ID");
    setIsLoggedIn(false);
    setUsername("");
    setUserId(null);
  };

  const updateUsername = (newUsername) => {
    if (newUsername) {
      localStorage.setItem("username", newUsername);
      setUsername(newUsername);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, username, login, logout, updateUsername, _id }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
