import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="hero card">
      <div className="hero-text">
        <h2>Your wellness. Your pace.</h2>
        <p>A private, always-on medtech companion. Screen with PHQ-9 & GAD-7, explore stories, and learn to relax.</p>
        <div className="hero-cta">
          <Link to="/selfcheck" className="btn primary">Start Self-Check</Link>
          <Link to="/videos" className="btn ghost">Watch Videos</Link>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="pulse"></div>
        <div className="orb orb-a"></div>
        <div className="orb orb-b"></div>
        <div className="orb orb-c"></div>
      </div>
    </div>
  );
}
