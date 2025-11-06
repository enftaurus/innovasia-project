import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import axios from "axios";

export default function SelfCheck() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    phq9: Array(9).fill(null),
    gad7: Array(7).fill(null),
    sleep: "",
    exercisefreq: "",
    socialactivity: "",
    onlinestress: "",
    gpa: "",
    familysupport: "",
    screentime: "",
    academicstress: "",
    dietquality: "",
    selfefficiency: "",
    peerrelationship: "",
    financialstress: "",
    sleepquality: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  // -------------------- Question sets --------------------
  const PHQ9 = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless",
    "Thoughts that you would be better off dead, or thoughts of hurting yourself",
  ];

  const GAD7 = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it’s hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen",
  ];

  const OPTIONS = [
    { v: 0, t: "Not at all" },
    { v: 1, t: "Several days" },
    { v: 2, t: "More than half the days" },
    { v: 3, t: "Nearly every day" },
  ];

  const EXTRA = [
    { key: "sleep", label: "Average hours of sleep per night (3–12)" },
    { key: "exercisefreq", label: "Exercise frequency per week (0–7)" },
    { key: "socialactivity", label: "Social activity (0–10)" },
    { key: "onlinestress", label: "Online stress (0–10)" },
    { key: "gpa", label: "Current GPA (0–10)" },
    { key: "familysupport", label: "Do you feel family support? (0 or 1)" },
    { key: "screentime", label: "Average screen time (hours per day, 0–24)" },
    { key: "academicstress", label: "Academic stress level (0–10)" },
    { key: "dietquality", label: "Diet quality (0–10)" },
    { key: "selfefficiency", label: "Self-efficiency (0–10)" },
    { key: "peerrelationship", label: "Peer relationships (0–10)" },
    { key: "financialstress", label: "Financial stress (0–10)" },
    { key: "sleepquality", label: "Sleep quality (0–10)" },
  ];

  // -------------------- Handlers --------------------
  const handleRadio = (section, idx, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((v, i) => (i === idx ? value : v)),
    }));
  };

  const handleExtra = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // -------------------- Submit --------------------
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const phq9 = formData.phq9.reduce((a, b) => a + (b ?? 0), 0);
      const gad7 = formData.gad7.reduce((a, b) => a + (b ?? 0), 0);

      const payload = { ...formData, phq9, gad7 };

      // ✅ Send to backend using .env variable
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/submit-assessment`,
        payload
      );

      setServerMessage(res.data.message || "Assessment submitted successfully!");
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting assessment:", err);
      alert("Error submitting assessment — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------- Result Screen --------------------
  if (submitted)
    return (
      <motion.div
        className="form-success"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <CheckCircle2 size={64} color="#22c55e" />
        <h2>Assessment Result</h2>
        <p>{serverMessage || "Assessment submitted successfully!"}</p>
        <a className="btn primary" href="/videos" style={{ marginTop: 20 }}>
          Explore Coping Resources
        </a>
      </motion.div>
    );

  // -------------------- Main UI --------------------
  return (
    <motion.div
      className="selfcheck-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="selfcheck-header">
        <ClipboardCheck size={40} color="#f97316" />
        <div>
          <h2>Wellness Assessment</h2>
          <p>
            These are standardized screening tools for depression (PHQ-9),
            anxiety (GAD-7), and other key well-being factors.
          </p>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="step-indicator">
        <span className={step === 0 ? "active" : ""}>PHQ-9</span>
        <span className={step === 1 ? "active" : ""}>GAD-7</span>
        <span className={step === 2 ? "active" : ""}>Lifestyle</span>
      </div>

      {/* PHQ-9 Section */}
      {step === 0 && (
        <div className="question-grid">
          <h3>PHQ-9 — Depression Screening</h3>
          {PHQ9.map((q, i) => (
            <div key={i} className="question-card">
              <p>
                <strong>{i + 1}.</strong> {q}
              </p>
              <div className="options">
                {OPTIONS.map((o) => (
                  <label key={o.v}>
                    <input
                      type="radio"
                      name={`phq9-${i}`}
                      onChange={() => handleRadio("phq9", i, o.v)}
                    />
                    {o.t}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GAD-7 Section */}
      {step === 1 && (
        <div className="question-grid">
          <h3>GAD-7 — Anxiety Screening</h3>
          {GAD7.map((q, i) => (
            <div key={i} className="question-card">
              <p>
                <strong>{i + 1}.</strong> {q}
              </p>
              <div className="options">
                {OPTIONS.map((o) => (
                  <label key={o.v}>
                    <input
                      type="radio"
                      name={`gad7-${i}`}
                      onChange={() => handleRadio("gad7", i, o.v)}
                    />
                    {o.t}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extra Lifestyle Section */}
      {step === 2 && (
        <div className="extra-grid">
          <h3>Lifestyle & Academic Factors</h3>
          {EXTRA.map((item) => (
            <div className="extra-item" key={item.key}>
              <label>{item.label}</label>
              <input
                type="number"
                value={formData[item.key]}
                onChange={(e) => handleExtra(item.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="nav-buttons">
        {step > 0 && (
          <button className="btn secondary" onClick={back}>
            Back
          </button>
        )}
        {step < 2 && (
          <button className="btn primary" onClick={next}>
            Next
          </button>
        )}
        {step === 2 && (
          <button
            className="btn primary"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit Assessment"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
