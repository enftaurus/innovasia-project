import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Calendar,
  ChevronRight,
  MessageSquare,
  Smile,
  TrendingUp,
  Award,
  BookOpen,
  PlayCircle,
  Zap,
  Sun,
  CloudRain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function Home() {
  const navigate = useNavigate();

  /* ------------------------------ STATE ------------------------------ */
  const [quote, setQuote] = useState("");
  const [weather, setWeather] = useState({ icon: "☀️", temp: "29°C" });
  const [mood, setMood] = useState("Happy");
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete today's self-check", done: false },
    { id: 2, text: "Watch mindfulness video", done: false },
    { id: 3, text: "Book next counseling slot", done: false },
  ]);
  const [streak, setStreak] = useState(3);
  const [progress, setProgress] = useState(62);

  /* ------------------------------ MOCK DATA ------------------------------ */
  const videos = [
    {
      id: 1,
      title: "5-Minute Breathing Reset",
      thumb:
        "https://images.unsplash.com/photo-1532768641073-503a250f9754?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Guided Meditation for Focus",
      thumb:
        "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Evening Relaxation Stretch",
      thumb:
        "https://images.unsplash.com/photo-1594737625785-c0b19bf1b9e9?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const resources = [
    { icon: <BookOpen size={22} />, label: "Mindfulness" },
    { icon: <Smile size={22} />, label: "Positivity" },
    { icon: <Award size={22} />, label: "Achievements" },
    { icon: <Activity size={22} />, label: "Self-Check" },
    { icon: <Calendar size={22} />, label: "Appointments" },
  ];

  const colors = ["#ffe8cc", "#fff5e6", "#fef3c7", "#ecfccb", "#dbeafe"];

  /* ------------------------------ EFFECTS ------------------------------ */
  useEffect(() => {
    const q = [
      "Breathe in courage, breathe out doubt.",
      "Progress is built one mindful step at a time.",
      "You’re doing better than you think.",
      "Even the smallest pause is a victory.",
      "Peace begins with a single breath.",
    ];
    setQuote(q[Math.floor(Math.random() * q.length)]);
  }, []);

  /* ------------------------------ HANDLERS ------------------------------ */
  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  /* ------------------------------ COMPONENTS ------------------------------ */

  const Section = ({ title, children, icon }) => (
    <div className="home-section">
      <div className="section-head">
        <h3>
          {icon && <span className="icon-wrap">{icon}</span>} {title}
        </h3>
        <ChevronRight className="chev" />
      </div>
      <div>{children}</div>
    </div>
  );

  /* ------------------------------ RENDER ------------------------------ */

  return (
    <motion.div
      className="home-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ===== HEADER STRIP ===== */}
      <header className="home-header">
        <div>
          <h2>Good {new Date().getHours() < 12 ? "morning" : "evening"}, Student 👋</h2>
          <p className="sub">
            {format(new Date(), "eeee, MMM d")} · {weather.icon} {weather.temp}
          </p>
        </div>
        <button className="btn primary" onClick={() => navigate("/chat")}>
          <MessageSquare size={18} /> Talk to AI
        </button>
      </header>

      {/* ===== STATS ROW ===== */}
      <section className="stats-row">
        <div className="stat-card gradient-peach">
          <TrendingUp size={24} />
          <div>
            <h4>{progress}%</h4>
            <p>Monthly Wellness Progress</p>
          </div>
        </div>
        <div className="stat-card gradient-sky">
          <Calendar size={24} />
          <div>
            <h4>Next session</h4>
            <p>Wed, 3:00 PM</p>
          </div>
        </div>
        <div className="stat-card gradient-lime">
          <Award size={24} />
          <div>
            <h4>{streak}-day streak</h4>
            <p>Keep it going 🔥</p>
          </div>
        </div>
      </section>

      {/* ===== MOOD TRACKER ===== */}
      <Section title="Today’s Check-In" icon={<Smile />}>
        <div className="mood-grid">
          {["Happy", "Calm", "Tired", "Anxious", "Excited"].map((m) => (
            <motion.button
              whileTap={{ scale: 0.9 }}
              key={m}
              className={`mood-btn ${mood === m ? "active" : ""}`}
              onClick={() => setMood(m)}
            >
              {m}
            </motion.button>
          ))}
        </div>
        <p className="mood-caption">You feel {mood.toLowerCase()} today 💫</p>
      </Section>

      {/* ===== DAILY TASKS ===== */}
      <Section title="Daily Wellness Plan" icon={<Zap />}>
        <ul className="task-list">
          {tasks.map((t) => (
            <motion.li
              key={t.id}
              whileHover={{ scale: 1.02 }}
              className={t.done ? "done" : ""}
              onClick={() => toggleTask(t.id)}
            >
              <input type="checkbox" checked={t.done} readOnly />
              <span>{t.text}</span>
            </motion.li>
          ))}
        </ul>
      </Section>

      {/* ===== RESOURCES ===== */}
      <Section title="Explore Resources" icon={<BookOpen />}>
        <div className="res-grid">
          {resources.map((r, i) => (
            <motion.div
              whileHover={{ y: -4 }}
              className="res-card"
              key={r.label}
              style={{ background: colors[i % colors.length] }}
              onClick={() => navigate("/videos")}
            >
              {r.icon}
              <h4>{r.label}</h4>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ===== VIDEOS ===== */}
      <Section title="Recommended Videos" icon={<PlayCircle />}>
        <div className="video-row">
          {videos.map((v) => (
            <motion.div
              whileHover={{ scale: 1.03 }}
              key={v.id}
              className="video-thumb"
              onClick={() => navigate("/videos")}
            >
              <img src={v.thumb} alt={v.title} />
              <h5>{v.title}</h5>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ===== QUOTE ===== */}
      <Section title="Daily Motivation" icon={<Sun />}>
        <blockquote className="quote">{quote}</blockquote>
      </Section>

      {/* ===== FOOT STRIP ===== */}
      <footer className="home-footer">
        <p>Made with 💛 by Student Sanctuary</p>
      </footer>
    </motion.div>
  );
}
