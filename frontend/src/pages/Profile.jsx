import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch user details from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.email) return;
        const res = await axios.get(
          `http://127.0.0.1:8000/profile/${user.email}`,
          { withCredentials: true }
        );
        setProfile(res.data);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          background: "linear-gradient(135deg, #3b82f6, #22c55e)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div className="loader"></div>
        <h2 style={{ marginTop: "1rem" }}>Loading your profile...</h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <section className="section">
        <div className="container text-center" style={{ maxWidth: 640 }}>
          <h2>Profile Not Found</h2>
          <p>We couldn’t load your details. Please log in again.</p>
          <button className="btn" onClick={logout}>
            Log out
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div
        className="container"
        style={{
          maxWidth: 720,
          marginTop: "2rem",
          background: "#f9fafb",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#2563eb",
            marginBottom: "1rem",
          }}
        >
          👤 Student Profile
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.mail}
          </p>
          <p>
            <strong>Age:</strong> {profile.age}
          </p>
          <p>
            <strong>Gender:</strong> {profile.gender}
          </p>
          <p>
            <strong>Date of Birth:</strong> {profile.dob}
          </p>
          <p>
            <strong>Place:</strong> {profile.place}
          </p>
          <p>
            <strong>Phone:</strong> {profile.phone}
          </p>
          <p>
            <strong>Education:</strong> {profile.education}
          </p>
          <p>
            <strong>Institution:</strong> {profile.institution}
          </p>
        </div>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <Link to="/appointments" className="btn">
            📅 Book Appointment
          </Link>
          <button className="btn" onClick={logout}>
            🚪 Log Out
          </button>
        </div>
      </div>
    </section>
  );
}
