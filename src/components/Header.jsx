import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 🧭 Nav Items
  const navItems = user
    ? [
        { name: "Home", path: "/dashboard" },
        { name: "Self-Check", path: "/selfcheck" },
        { name: "Videos", path: "/videos" },
        { name: "Stories", path: "/stories" },
        { name: "Appointments", path: "/appointments" },
        { name: "Chat", path: "/chat" },
      ]
    : [
        { name: "Home", path: "/" },
        { name: "About", path: "/#about" },
        { name: "Resources", path: "/videos" },
      ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="header">
      <div className="container bar">
        {/* --- Brand / Logo --- */}
        <div className="brand" onClick={() => navigate("/")}>
          <div className="logo">🧠</div>
          <div>
            <strong>Student Sanctuary</strong>
            <p className="tagline">Wellness for students</p>
          </div>
        </div>

        {/* --- Desktop Nav --- */}
        <nav className="nav hidden-mobile">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* --- Auth / Profile Buttons --- */}
        <div className="cta hidden-mobile">
          {user ? (
            <>
              <NavLink to="/profile" className="btn ghost">
                {user.displayName || "Profile"}
              </NavLink>
              <button className="btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn ghost">
                Login
              </NavLink>
              <NavLink to="/register" className="btn primary">
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        {/* --- Mobile Toggle --- */}
        <button
          className="btn ghost show-mobile"
          style={{ padding: "0.4rem 0.7rem" }}
          onClick={() => setOpen(!open)}
        >
          {open ? "✖" : "☰"}
        </button>
      </div>

      {/* --- Mobile Menu --- */}
      {open && (
        <div className="mobile-menu show-mobile">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
          <div className="cta" style={{ marginTop: "10px" }}>
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className="btn ghost"
                  onClick={() => setOpen(false)}
                >
                  {user.displayName || "Profile"}
                </NavLink>
                <button className="btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="btn ghost"
                  onClick={() => setOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="btn primary"
                  onClick={() => setOpen(false)}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
