import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Profile(){
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <section className="section">
      <div className="container" style={{maxWidth:640}}>
        <h2>Profile</h2>
        <div className="feature">
          <p><strong>Name:</strong> {user.displayName || "Anonymous"}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <div className="cta" style={{marginTop:12}}>
          <Link to="/appointments" className="btn">Book appointment</Link>
          <button className="btn" onClick={logout}>Log out</button>
        </div>
      </div>
    </section>
  );
}
