// import React, { createContext, useContext, useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";

// // Create the Auth Context
// const AuthContext = createContext();

// // Custom hook
// export const useAuth = () => useContext(AuthContext);

// // Fake Auth Provider (mock login)
// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Simulate a loading screen and auto-login
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       // Simulate a logged-in user
//       setUser({
//         displayName: "Demo User",
//         email: "demo@student.com",
//       });
//       setLoading(false);
//     }, 2000); // 2 seconds loading screen
//     return () => clearTimeout(timer);
//   }, []);

//   const login = () => setUser({ displayName: "Demo User" });
//   const logout = () => setUser(null);
//   const register = () => setUser({ displayName: "New User" });

//   const value = { user, login, register, logout };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading ? children : (
//         <div
//           style={{
//             display: "flex",
//             height: "100vh",
//             alignItems: "center",
//             justifyContent: "center",
//             flexDirection: "column",
//             background: "linear-gradient(135deg, #3b82f6, #22c55e)",
//             color: "#fff",
//             fontFamily: "system-ui, sans-serif",
//           }}
//         >
//           <div className="loader"></div>
//           <h2 style={{ marginTop: "1rem" }}>Loading Student Sanctuary...</h2>
//         </div>
//       )}
//     </AuthContext.Provider>
//   );
// }

// // Route Protection — Disabled for now (always allows access)
// export function ProtectedRoute({ children }) {
//   // Skip restriction, always allow
//   return children;
// }




// import React, { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { Navigate } from "react-router-dom";

// // Create Auth Context
// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 🧩 Check cookie and auto-login on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const mail = Cookies.get("user_mail");
//         if (mail) {
//           // Optional: validate cookie from backend
//           setUser({ email: mail, displayName: mail.split("@")[0] });
//         } else {
//           setUser(null);
//         }
//       } catch (err) {
//         console.error("Auth check failed:", err);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   // 🧠 Login function (sets cookie already handled by backend)
//   const login = async (mail, password) => {
//     try {
//       const res = await axios.post(
//         "http://localhost:8000/login/",
//         { mail, password },
//         { withCredentials: true }
//       );
//       if (res.data.message === "login successful") {
//         Cookies.set("user_mail", mail, { expires: 0.5 }); // 12 hrs approx
//         setUser({ email: mail, displayName: mail.split("@")[0] });
//         return { success: true };
//       }
//       return { success: false, message: res.data.detail || "Login failed" };
//     } catch (err) {
//       console.error("Login error:", err);
//       return {
//         success: false,
//         message: err.response?.data?.detail || "Server error",
//       };
//     }
//   };

//   // 🚪 Logout (clears cookie + local state)
//   const logout = async () => {
//     try {
//       Cookies.remove("user_mail");
//       setUser(null);
//     } catch (err) {
//       console.error("Logout error:", err);
//     }
//   };

//   const value = { user, login, logout, loading, isAuthenticated: !!user };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading ? (
//         children
//       ) : (
//         <div
//           style={{
//             display: "flex",
//             height: "100vh",
//             alignItems: "center",
//             justifyContent: "center",
//             flexDirection: "column",
//             background: "linear-gradient(135deg, #3b82f6, #22c55e)",
//             color: "#fff",
//             fontFamily: "system-ui, sans-serif",
//           }}
//         >
//           <div className="loader"></div>
//           <h2 style={{ marginTop: "1rem" }}>Loading Student Sanctuary...</h2>
//         </div>
//       )}
//     </AuthContext.Provider>
//   );
// }

// // ✅ Protect specific routes
// export function ProtectedRoute({ children }) {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading)
//     return (
//       <div
//         style={{
//           display: "flex",
//           height: "100vh",
//           alignItems: "center",
//           justifyContent: "center",
//           flexDirection: "column",
//           background: "linear-gradient(135deg, #3b82f6, #22c55e)",
//           color: "#fff",
//           fontFamily: "system-ui, sans-serif",
//         }}
//       >
//         <div className="loader"></div>
//         <h2 style={{ marginTop: "1rem" }}>Verifying your session...</h2>
//       </div>
//     );

//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   return children;
// }





// import React, { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { Navigate } from "react-router-dom";

// // Create Auth Context
// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 🧩 Auto-login using cookie on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const mail = Cookies.get("user_mail");
//         if (mail) {
//           setUser({ email: mail, displayName: mail.split("@")[0] });
//         } else {
//           setUser(null);
//         }
//       } catch (err) {
//         console.error("Auth check failed:", err);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   // 🧠 Login function (handles first-click issue)
//   const login = async (mail, password) => {
//     try {
//       const res = await axios.post(
//         "http://localhost:8000/login/",
//         { mail, password },
//         {
//           withCredentials: true,
//           maxRedirects: 0, // 🚫 Prevent FastAPI redirect (fixes first click error)
//           validateStatus: (status) => status < 400, // Treat 307 or 405 as handled
//         }
//       );

//       if (res.data.message === "login successful") {
//         Cookies.set("user_mail", mail, { expires: 0.5 }); // 12 hours session
//         setUser({ email: mail, displayName: mail.split("@")[0] });
//         return { success: true };
//       }

//       return { success: false, message: res.data.detail || "Login failed" };
//     } catch (err) {
//       console.error("Login error:", err);
//       return {
//         success: false,
//         message: err.response?.data?.detail || "Server error. Please try again.",
//       };
//     }
//   };

//   // 🚪 Logout function — clears cookie and resets user
//   const logout = async () => {
//     try {
//       Cookies.remove("user_mail");
//       setUser(null);
//     } catch (err) {
//       console.error("Logout error:", err);
//     }
//   };

//   const value = {
//     user,
//     login,
//     logout,
//     loading,
//     isAuthenticated: !!user,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading ? (
//         children
//       ) : (
//         <div
//           style={{
//             display: "flex",
//             height: "100vh",
//             alignItems: "center",
//             justifyContent: "center",
//             flexDirection: "column",
//             background: "linear-gradient(135deg, #3b82f6, #22c55e)",
//             color: "#fff",
//             fontFamily: "system-ui, sans-serif",
//           }}
//         >
//           <div className="loader"></div>
//           <h2 style={{ marginTop: "1rem" }}>Loading Student Sanctuary...</h2>
//         </div>
//       )}
//     </AuthContext.Provider>
//   );
// }

// // ✅ ProtectedRoute — redirect unauthenticated users
// export function ProtectedRoute({ children }) {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading)
//     return (
//       <div
//         style={{
//           display: "flex",
//           height: "100vh",
//           alignItems: "center",
//           justifyContent: "center",
//           flexDirection: "column",
//           background: "linear-gradient(135deg, #3b82f6, #22c55e)",
//           color: "#fff",
//           fontFamily: "system-ui, sans-serif",
//         }}
//       >
//         <div className="loader"></div>
//         <h2 style={{ marginTop: "1rem" }}>Verifying your session...</h2>
//       </div>
//     );

//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   return children;
// }



import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧩 Auto-detect login via cookie
  useEffect(() => {
    const mail = Cookies.get("user_mail");
    if (mail) {
      setUser({ email: mail, displayName: mail.split("@")[0] });
    }
    setLoading(false);
  }, []);

  // 🧠 Login function (final fixed version)
  const login = async (mail, password) => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/login/",
        { mail, password },
        {
          withCredentials: true, // ✅ crucial for cookies
          maxRedirects: 0,       // ✅ prevents redirect loops
        }
      );

      console.log("🟢 Backend Response:", res);

      // ✅ Handle successful login
      if (res?.data?.message === "login successful") {
        Cookies.set("user_mail", mail, { expires: 0.5 }); // 12-hour session
        setUser({ email: mail, displayName: mail.split("@")[0] });
        return { success: true };
      }

      // ⚠️ Unexpected response
      return {
        success: false,
        message: res.data?.detail || "Unexpected response from server.",
      };
    } catch (err) {
      console.error("❌ Login error caught:", err);

      // 🔍 Detailed error handling
      if (err.response) {
        console.log("🔴 Error response:", err.response);
        return {
          success: false,
          message: err.response.data?.detail || "Invalid credentials.",
        };
      } else if (err.request) {
        console.log("🔴 No response received:", err.request);
        return { success: false, message: "No response from server." };
      } else {
        console.log("🔴 Unknown error:", err.message);
        return { success: false, message: "Server error. Please try again." };
      }
    }
  };

  // 🚪 Logout (clears cookie + state)
  const logout = () => {
    Cookies.remove("user_mail");
    setUser(null);
  };

  const value = { user, login, logout, loading, isAuthenticated: !!user };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        children
      ) : (
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

// 🔒 Protect routes for logged-in users only
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
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
        <h2 style={{ marginTop: "1rem" }}>Verifying your session...</h2>
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
