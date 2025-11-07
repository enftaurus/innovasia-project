import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import group573 from "../assets/group-573.png";
import group863 from "../assets/group-863.png";
import group1723 from "../assets/group-1723.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* ================= HERO SECTION ================= */}
      <section className="landing-hero">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1>Welcome to <span>Student Sanctuary 🌿</span></h1>
          <p>
            A safe and empowering space where students can assess, understand,
            and improve their mental wellness.  
            Let’s help you find balance, focus, and emotional clarity — because
            your mind matters.
          </p>
          <button
            onClick={() => navigate("/selfcheck")}
            className="btn primary"
          >
            Take Wellness Test
          </button>
        </motion.div>

        <motion.img
          src={group573}
          alt="Student support illustration"
          className="hero-illustration"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        />
      </section>

      {/* ================= ABOUT TEST SECTION ================= */}
      <section className="about-test">
        <motion.img
          src={group863}
          alt="Mental health growth illustration"
          className="about-img"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        />
        <div className="about-text">
          <h2>About the Wellness Test 🧠</h2>
          <p>
            This assessment helps you understand your overall mental health using 
            globally recognized tools like <strong>PHQ-9</strong> and <strong>GAD-7</strong>,
            along with lifestyle factors such as sleep, exercise, diet, and relationships.
          </p>
          <p>
            Each response is scored to create your unique <strong>Wellness Index</strong>, 
            giving you instant insights into your mental balance, stress levels, and 
            areas for improvement.
          </p>
          <div className="about-stats">
            <div>
              <h3>15+</h3>
              <p>Wellness Factors</p>
            </div>
            <div>
              <h3>3 min</h3>
              <p>Quick, Easy Test</p>
            </div>
            <div>
              <h3>100%</h3>
              <p>Instant Personalized Report</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section className="how-it-works">
        <div className="how-text">
          <h2>How It Works ⚙️</h2>
          <ul>
            <li>✔️ Answer simple questions about your emotions and habits.</li>
            <li>✔️ Our model calculates your personalized wellness score.</li>
            <li>✔️ Get clear recommendations for better mental balance.</li>
            <li>✔️ No data stored — your privacy and safety come first.</li>
          </ul>
          <button
            className="btn secondary"
            onClick={() => navigate("/selfcheck")}
          >
            Begin Test
          </button>
        </div>
        <motion.img
          src={group1723}
          alt="Calm mind illustration"
          className="how-img"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="landing-cta">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2>Let’s Begin Your Journey to a Healthier Mind 💬</h2>
          <p>
            It only takes a few minutes to reflect on your wellness and get
            insights that can truly make a difference in your academic and
            personal life.
          </p>
          <button className="btn primary" onClick={() => navigate("/selfcheck")}>
            Start Now
          </button>
        </motion.div>
      </section>
    </div>
  );
}
