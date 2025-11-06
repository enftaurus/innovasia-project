import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// Create the Auth Context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Fake Auth Provider (mock login)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate a loading screen and auto-login
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate a logged-in user
      setUser({
        displayName: "Demo User",
        email: "demo@student.com",
      });
      setLoading(false);
    }, 2000); // 2 seconds loading screen
    return () => clearTimeout(timer);
  }, []);

  const login = () => setUser({ displayName: "Demo User" });
  const logout = () => setUser(null);
  const register = () => setUser({ displayName: "New User" });

  const value = { user, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div
          style={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            background: "linear-gradient(135deg, #3b82f6, #22c55e)",
            color: "#fff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div className="loader"></div>
          <h2 style={{ marginTop: "1rem" }}>Loading Student Sanctuary...</h2>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// Route Protection — Disabled for now (always allows access)
export function ProtectedRoute({ children }) {
  // Skip restriction, always allow
  return children;
}
