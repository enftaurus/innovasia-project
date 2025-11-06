import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <section className="landing">
      {/* HERO SECTION */}
      <div className="hero-landing">
        <div className="overlay">
          <div className="container">
            <h1>
              Welcome to <span>Student Sanctuary</span>
            </h1>
            <p>
              Empowering students with mental wellness tools, self-assessments,
              and guided support for a balanced, healthier mind.
            </p>
            <div className="cta">
              <button className="btn primary" onClick={() => navigate("/login")}>
                Get Started
              </button>
              <button className="btn ghost" onClick={() => navigate("/videos")}>
                Explore Resources
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div className="section fade-section">
        <div className="container grid grid-2">
          <div>
            <h2>Why Student Sanctuary?</h2>
            <p>
              We know student life can be stressful — with classes, exams, and
              social challenges. Our platform helps you track your emotional
              well-being, practice mindfulness, and connect to support when you
              need it most.
            </p>
            <ul>
              <li>✔ Scientifically validated self-check tools (PHQ-9 & GAD-7)</li>
              <li>✔ AI-guided chat for stress & motivation</li>
              <li>✔ Counselor appointments and progress tracking</li>
            </ul>
          </div>
          <img
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80"
            alt="Happy students"
            style={{ borderRadius: "14px", boxShadow: "var(--shadow-soft)" }}
          />
        </div>
      </div>

      {/* GALLERY SECTION */}
      <div className="section fade-section">
        <div className="container">
          <h2>Discover Wellness in Motion</h2>
          <div className="grid grid-3">
            {[
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
              "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
              "https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=1200&q=80",
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="wellness"
                style={{
                  borderRadius: "16px",
                  boxShadow: "var(--shadow-soft)",
                  width: "100%",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA JOIN SECTION */}
      <div className="cta-banner fade-section">
        <div className="container">
          <h2>Take the first step toward a calmer, stronger you</h2>
          <button className="btn primary" onClick={() => navigate("/register")}>
            Join Now
          </button>
        </div>
      </div>
    </section>
  );
}
