import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronDown, ArrowLeft, ArrowRight, Loader2,
  Brain, ShieldCheck, BarChart3
} from "lucide-react";

const OPTS = [
  { v: 0, t: "Not at all" },
  { v: 1, t: "Several days" },
  { v: 2, t: "More than half the days" },
  { v: 3, t: "Nearly every day" },
];

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

const EXTRAS = [
  { key: "sleep", label: "Average hours of sleep per night", min: 3, max: 12 },
  { key: "exercisefreq", label: "Exercise frequency per week", min: 0, max: 7 },
  { key: "socialactivity", label: "Social activity (0–10)", min: 0, max: 10 },
  { key: "onlinestress", label: "Online stress (0–10)", min: 0, max: 10 },
  { key: "gpa", label: "GPA (0–10)", min: 0, max: 10 },
  { key: "familysupport", label: "Family support (0 or 1)", min: 0, max: 1 },
  { key: "screentime", label: "Screen time (hrs/day)", min: 0, max: 24 },
  { key: "academicstress", label: "Academic stress (0–10)", min: 0, max: 10 },
  { key: "dietquality", label: "Diet quality (0–10)", min: 0, max: 10 },
  { key: "selfefficiency", label: "Self-efficiency (0–10)", min: 0, max: 10 },
  { key: "peerrelationship", label: "Peer relationships (0–10)", min: 0, max: 10 },
  { key: "financialstress", label: "Financial stress (0–10)", min: 0, max: 10 },
  { key: "sleepquality", label: "Sleep quality (0–10)", min: 0, max: 10 },
];

const sum = (arr) => arr.reduce((a, b) => a + (b ?? 0), 0);
const toForty = (phq, gad) => Math.round(((phq + gad) / 48) * 40);
function severity(score) {
  if (score >= 27) return { label: "High", color: "#EB5A46" };
  if (score >= 14) return { label: "Moderate", color: "#F2A541" };
  return { label: "Low", color: "#1E9E8E" };
}

export default function SelfCheck() {
  const topRef = useRef(null);
  const testRef = useRef(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [serverMessage, setServerMessage] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");

  const [data, setData] = useState({
    phq9: Array(9).fill(null),
    gad7: Array(7).fill(null),
    extras: Object.fromEntries(EXTRAS.map((e) => [e.key, ""])),
  });

  // Debounced saving — prevents micro glitch
  const saveTimeout = useRef(null);
  const saveProgress = useCallback((newData) => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem("ss_selfcheck_v3", JSON.stringify(newData));
    }, 500);
  }, []);

  const updateData = (updater) => {
    setData((prev) => {
      const newData = typeof updater === "function" ? updater(prev) : updater;
      saveProgress(newData);
      return newData;
    });
  };

  const phqScore = useMemo(() => sum(data.phq9.map((x) => x ?? 0)), [data.phq9]);
  const gadScore = useMemo(() => sum(data.gad7.map((x) => x ?? 0)), [data.gad7]);
  const dialScore = useMemo(() => toForty(phqScore, gadScore), [phqScore, gadScore]);
  const sev = severity(dialScore);

  const goToTest = () => {
    setStep(1);
    setTimeout(() => testRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const setRadio = (section, i, v) => {
    updateData((d) => ({
      ...d,
      [section]: d[section].map((x, idx) => (idx === i ? v : x)),
    }));
  };
  const setExtra = (key, val) => {
    updateData((d) => ({ ...d, extras: { ...d.extras, [key]: val } }));
  };

  const submit = async () => {
    setSubmitting(true);
    setLoadingOverlay(true);
    try {
      const payload = { phq9: phqScore, gad7: gadScore, ...data.extras };
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await axios.post(`${apiUrl}/submit-assessment/`, payload, {
        withCredentials: true, // ✅ Required to send cookies
      });
      setServerMessage(res.data.message || "");
      setAiFeedback(res.data.ai_feedback || "");
      setResultScore(dialScore);
      setTimeout(() => {
        setStep(4);
        setLoadingOverlay(false);
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 700); // nice transition delay
    } catch (e) {
      console.error(e);
      alert("Something went wrong, please try again.");
      setLoadingOverlay(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section ref={topRef} className="wellness-intro">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="intro-badges">
            <span className="intro-chip"><Brain size={16}/> PHQ-9</span>
            <span className="intro-chip"><Brain size={16}/> GAD-7</span>
            <span className="intro-chip"><ShieldCheck size={16}/> Lifestyle</span>
          </div>
          <h1>Understand Your Mental Wellness</h1>
          <p>
            This check blends <span className="highlight">mood</span>,{" "}
            <span className="highlight">anxiety</span>, and{" "}
            <span className="highlight">lifestyle</span> to create a balanced picture
            of how you’re doing right now.
          </p>
          <button className="take-test-btn" onClick={goToTest}>
            Take the Test <ChevronRight size={16}/>
          </button>
        </motion.div>
      </section>

      {step >= 1 && step <= 3 && (
        <section ref={testRef} className="bm-section">
          <div className="bm-container">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2>PHQ-9 — Mood Assessment</h2>
                {PHQ9.map((q, i) => (
                  <Question key={i} q={q} section="phq9" i={i} value={data.phq9[i]} onSelect={setRadio}/>
                ))}
              </motion.div>
            )}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2>GAD-7 — Anxiety Assessment</h2>
                {GAD7.map((q, i) => (
                  <Question key={i} q={q} section="gad7" i={i} value={data.gad7[i]} onSelect={setRadio}/>
                ))}
              </motion.div>
            )}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2>Lifestyle & Study Context</h2>
                <div className="bm-grid">
                  {EXTRAS.map((e) => (
                    <InputBox key={e.key} e={e} value={data.extras[e.key]} onChange={setExtra}/>
                  ))}
                </div>
              </motion.div>
            )}
            <div className="wizard-actions">
              {step > 1 && (
                <button className="btn secondary" onClick={back}>
                  <ArrowLeft size={16}/> Back
                </button>
              )}
              {step < 3 && (
                <button className="btn primary" onClick={next}>
                  Next <ArrowRight size={16}/>
                </button>
              )}
              {step === 3 && (
                <button className="btn primary" disabled={submitting} onClick={submit}>
                  {submitting ? <><Loader2 className="spin" size={16}/> Submitting...</> : "Submit"}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <motion.section className="bm-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bm-container">
            <div className="bm-result-wrap">
              <Gauge score={resultScore}/>
              <div>
                <h3 style={{ color: sev.color }}>{sev.label} Stress ({resultScore}/40)</h3>
                <p>{serverMessage}</p>
                <div className="ai-feedback">
                  <h3>AI Insights</h3>
                  <p style={{ whiteSpace: "pre-wrap" }}>{aiFeedback}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Smooth loading overlay */}
      <AnimatePresence>
        {loadingOverlay && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="spin" size={40}/>
            <p>Analyzing your results...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* =================== CHILD COMPONENTS =================== */

const Question = React.memo(({ q, section, i, value, onSelect }) => (
  <div className="bm-qcard">
    <p>{i + 1}. {q}</p>
    <div className="bm-opts">
      {OPTS.map((o) => (
        <label key={o.v} className={`bm-pill ${value === o.v ? "active" : ""}`}>
          <input type="radio" checked={value === o.v} onChange={() => onSelect(section, i, o.v)}/>
          {o.t}
        </label>
      ))}
    </div>
  </div>
));

const InputBox = React.memo(({ e, value, onChange }) => (
  <label className="bm-input">
    <span>{e.label}</span>
    <input
      type="number"
      min={e.min} max={e.max}
      value={value ?? ""}
      onChange={(ev) => onChange(e.key, ev.target.value)}
      onWheel={(ev) => ev.currentTarget.blur()}
    />
  </label>
));

function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx, cy, r, a0, a1) {
  const s = polar(cx, cy, r, a1);
  const e = polar(cx, cy, r, a0);
  const big = a1 - a0 <= 180 ? "0" : "1";
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${big} 0 ${e.x} ${e.y}`;
}

function Gauge({ score }) {
  const min = 0, max = 40, sweep = 300, start = 120;
  const cx = 160, cy = 160, r = 120;
  const angle = start + (score / (max - min)) * sweep;
  const toAngle = (v) => start + (v / (max - min)) * sweep;
  const segments = [
    { from: 0, to: 14, color: "#1E9E8E" },
    { from: 14, to: 27, color: "#F2A541" },
    { from: 27, to: 40, color: "#EB5A46" },
  ];

  return (
    <svg className="bm-gauge" width="320" height="320" viewBox="0 0 320 320">
      <path d={arcPath(cx, cy, r, start, start + sweep)} fill="none" stroke="#e7eef0" strokeWidth="18" />
      {segments.map((s, i) => (
        <path key={i} d={arcPath(cx, cy, r, toAngle(s.from), toAngle(s.to))}
          fill="none" stroke={s.color} strokeWidth="18" />
      ))}
      <circle cx={cx} cy={cy} r="6" fill="#111" />
      {(() => {
        const tip = polar(cx, cy, r - 6, angle);
        return <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#111" strokeWidth="4" />;
      })()}
      <circle cx={cx} cy={cy} r="64" fill="#2c3e46" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="34" fontWeight="800">{score}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#cfe6ea" fontSize="16" fontWeight="700">
        {severity(score).label}
      </text>
    </svg>
  );
}
