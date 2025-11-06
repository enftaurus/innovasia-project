import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { postAppointment } from "../services/api";
import { useAuth } from "../hooks/useAuth";

/** ========= Utility bits ========= */

const FOCUS_AREAS = [
  "Anxiety",
  "Sleep",
  "Depression",
  "Study Stress",
  "Relationships",
  "Motivation",
  "Panic",
  "Time Management",
  "Other",
];

const COUNSELORS = [
  {
    id: "cns-elena",
    name: "Elena Rao",
    creds: "M.Sc, RCI",
    focus: ["Anxiety", "Sleep", "Study Stress"],
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "cns-faisal",
    name: "Faisal Ahmed",
    creds: "Ph.D., Clinical Psych.",
    focus: ["Depression", "Motivation", "Panic"],
    img: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "cns-nat",
    name: "Natalie Chen",
    creds: "M.Phil, CBT",
    focus: ["Relationships", "Time Management", "Study Stress"],
    img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=600&q=80",
  },
];

const slotTemplate = [
  "09:30",
  "10:15",
  "11:00",
  "11:45",
  "14:00",
  "14:45",
  "15:30",
  "16:15",
  "17:00",
];

// Return YYYY-MM-DD
const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);

const combineDateTimeToISO = (dateStr, timeStr) => {
  // timeStr like "14:45"
  const [h, m] = timeStr.split(":").map(Number);
  const dt = new Date(dateStr);
  dt.setHours(h);
  dt.setMinutes(m);
  dt.setSeconds(0);
  dt.setMilliseconds(0);
  return dt.toISOString();
};

const ticketId = () =>
  "APT-" + Math.random().toString(36).slice(2, 7).toUpperCase();

/** ========= Validation ========= */

const schema = z
  .object({
    firstName: z.string().min(2, "Enter your first name"),
    lastName: z.string().min(2, "Enter your last name"),
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .optional()
      .refine((v) => !v || /^[0-9+\-\s()]{7,}$/.test(v), "Invalid phone"),
    focusAreas: z.array(z.string()).min(1, "Pick at least one area"),
    goal: z
      .string()
      .min(4, "Tell us your primary goal")
      .max(220, "Keep it short (<=220 chars)"),
    date: z.string().min(1, "Pick a date"),
    time: z.string().min(1, "Pick a time slot"),
    counselorId: z.string().min(1, "Choose a counselor preference"),
    shareScores: z.boolean().optional(),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Please accept privacy & consent" }),
    }),
  })
  .refine(
    (data) => {
      // same-day bookings allowed if 2h in future
      const iso = combineDateTimeToISO(data.date, data.time);
      return new Date(iso).getTime() > Date.now() + 60 * 60 * 1000;
    },
    { message: "Please select a time at least 1 hour from now.", path: ["time"] }
  );

/** ========= Component ========= */

export default function Appointments() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(null); // confirmation payload
  const [offline, setOffline] = useState(!navigator.onLine);

  // Draft restore
  const DRAFT_KEY = "ss:apptDraft:v2";

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: user?.displayName?.split(" ")[0] || "",
      lastName:
        user?.displayName?.split(" ").slice(1).join(" ") ||
        (user?.displayName ? "" : ""),
      email: user?.email || "",
      phone: "",
      focusAreas: [],
      goal: "",
      date: fmtDate(new Date(Date.now() + 24 * 3600 * 1000)),
      time: "",
      counselorId: COUNSELORS[0].id,
      shareScores: true,
      consent: false,
    },
  });

  const values = watch();

  /** ---------- Offline banner ---------- */
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  /** ---------- Autosave draft ---------- */
  useEffect(() => {
    const save = () => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    };
    const t = setTimeout(save, 350);
    return () => clearTimeout(t);
  }, [values]);

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        reset({ ...values, ...draft });
        toast("Draft restored", { icon: "📝" });
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---------- Slots for selected date ---------- */
  const slots = useMemo(() => {
    const d = new Date(values.date);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    // Closed Sundays
    if (day === 0) return [];
    // Friday half day
    const template = day === 5 ? slotTemplate.slice(0, 6) : slotTemplate;
    // Make "past" slots unavailable if booking same day
    const todayStr = fmtDate(new Date());
    if (values.date === todayStr) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      return template.filter((t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m > nowMin + 60; // keep >1h
      });
    }
    return template;
  }, [values.date]);

  /** ---------- Scores (optional share) ---------- */
  const lastResult = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("mindmate:lastResult") || "null");
    } catch {
      return null;
    }
  }, []);

  /** ---------- Submit ---------- */
  const onSubmit = async (data) => {
    const iso = combineDateTimeToISO(data.date, data.time);
    const counselor = COUNSELORS.find((c) => c.id === data.counselorId);
    const payload = {
      ...data,
      when: iso,
      counselor,
      ticket: ticketId(),
      createdAt: new Date().toISOString(),
      scores:
        data.shareScores && lastResult
          ? {
              phq: lastResult.phqScore,
              gad: lastResult.gadScore,
              risk: lastResult.risk,
            }
          : undefined,
    };

    try {
      await postAppointment(payload);
      toast.success("Appointment request sent");
    } catch {
      // graceful offline / mock
      const outbox = JSON.parse(localStorage.getItem("ss:outbox") || "[]");
      outbox.push({ type: "appointment", payload });
      localStorage.setItem("ss:outbox", JSON.stringify(outbox));
      toast("Saved to Outbox (offline demo)", { icon: "📦" });
    }
    localStorage.removeItem(DRAFT_KEY);
    setSubmitted(payload);
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** ---------- Helpers ---------- */
  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  /** ---------- Export JSON ---------- */
  const exportJson = (obj, name = "appointment.json") => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** ---------- UI ---------- */

  // Step content blocks (kept inline for clarity)
  const Step1 = (
    <div className="appt-card">
      <h3 className="appt-h3">Your details</h3>
      <div className="form">
        <label>
          First name
          <input {...register("firstName")} />
          {errors.firstName && <span className="error">{errors.firstName.message}</span>}
        </label>
        <label>
          Last name
          <input {...register("lastName")} />
          {errors.lastName && <span className="error">{errors.lastName.message}</span>}
        </label>
        <label className="full">
          Email
          <input type="email" {...register("email")} />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </label>
        <label className="full">
          Phone (optional)
          <input placeholder="+91 98 76 54 321" {...register("phone")} />
          {errors.phone && <span className="error">{errors.phone.message}</span>}
          <div className="help">We’ll only call if we can’t reach you by email.</div>
        </label>
      </div>
    </div>
  );

  const Step2 = (
    <div className="appt-card">
      <h3 className="appt-h3">Focus & goals</h3>
      <div className="grid-3">
        {FOCUS_AREAS.map((k) => {
          const on = values.focusAreas?.includes(k);
          return (
            <button
              type="button"
              key={k}
              className={`pill appt-pill ${on ? "on" : ""}`}
              onClick={() => {
                const set = new Set(values.focusAreas || []);
                set.has(k) ? set.delete(k) : set.add(k);
                setValue("focusAreas", Array.from(set), { shouldValidate: true });
              }}
            >
              {on ? "✅" : "◻️"} {k}
            </button>
          );
        })}
      </div>
      {errors.focusAreas && (
        <div className="error mt-2">{errors.focusAreas.message}</div>
      )}

      <label className="full mt-4">
        In one sentence, what would you like to work on first?
        <input placeholder="e.g., reduce exam anxiety & sleep better" {...register("goal")} />
        <div className="help">
          This helps your counselor start strong on the first session.
        </div>
        {errors.goal && <span className="error">{errors.goal.message}</span>}
      </label>
    </div>
  );

  const Step3 = (
    <div className="appt-card">
      <h3 className="appt-h3">Pick date & time</h3>

      <div className="grid-2">
        <label>
          Preferred date
          <input
            type="date"
            min={fmtDate(new Date())}
            {...register("date")}
            onChange={(e) => {
              setValue("time", "", { shouldValidate: true });
              register("date").onChange(e);
            }}
          />
          {errors.date && <span className="error">{errors.date.message}</span>}
        </label>

        <div>
          <div className="help mb-2">Available slots (local time)</div>
          <div className="slot-grid">
            {slots.length ? (
              slots.map((t) => {
                const on = values.time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`slot ${on ? "on" : ""}`}
                    onClick={() => setValue("time", t, { shouldValidate: true })}
                  >
                    {t}
                  </button>
                );
              })
            ) : (
              <div className="alert warn">Closed on Sundays — please pick another day.</div>
            )}
          </div>
          {errors.time && <span className="error">{errors.time.message}</span>}
        </div>
      </div>

      <div className="mt-4">
        <div className="help">
          Sessions are 45 minutes on Google Meet. You’ll receive a calendar invite.
        </div>
      </div>
    </div>
  );

  const Step4 = (
    <div className="appt-card">
      <h3 className="appt-h3">Counselor preference</h3>
      <div className="counselor-grid">
        {COUNSELORS.map((c) => {
          const on = values.counselorId === c.id;
          return (
            <label key={c.id} className={`c-card ${on ? "on" : ""}`}>
              <input
                type="radio"
                value={c.id}
                {...register("counselorId")}
                className="hidden"
              />
              <img src={c.img} alt={c.name} />
              <div className="c-meta">
                <strong>{c.name}</strong>
                <span className="badge">{c.creds}</span>
                <div className="c-tags">
                  {c.focus.map((t) => (
                    <span className="mini-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      {errors.counselorId && (
        <div className="error mt-2">{errors.counselorId.message}</div>
      )}

      <div className="mt-4 grid-2">
        <label>
          <span className="row items-center gap-2">
            <input type="checkbox" {...register("shareScores")} />
            Share my latest PHQ-9 / GAD-7 results (optional)
          </span>
          <div className="help">
            {lastResult
              ? `Will share PHQ-9 ${lastResult.phqScore}, GAD-7 ${lastResult.gadScore} (${lastResult.risk}).`
              : "No results found yet."}
          </div>
        </label>

        <label className="row items-center gap-2">
          <input type="checkbox" {...register("consent")} />
          <span>
            I understand this is not emergency care and agree to the{" "}
            <a href="#" onClick={(e)=>e.preventDefault()}>privacy & consent</a>.
          </span>
        </label>
      </div>
      {errors.consent && <div className="error mt-2">{errors.consent.message}</div>}
    </div>
  );

  const Review = (
    <div className="appt-card">
      <h3 className="appt-h3">Request sent ✅</h3>
      <p className="text-muted">
        You’ll receive an email confirmation with a Meet link. Save or print this summary.
      </p>

      <div className="grid-2 mt-3">
        <div className="card">
          <h4>Booking</h4>
          <ul className="kv">
            <li><span>Ticket</span><strong>{submitted?.ticket}</strong></li>
            <li><span>Date</span><strong>{submitted?.date}</strong></li>
            <li><span>Time</span><strong>{submitted?.time}</strong></li>
            <li><span>When (local)</span><strong>{new Date(submitted?.when).toLocaleString()}</strong></li>
          </ul>
        </div>
        <div className="card">
          <h4>Counselor</h4>
          <div className="row items-center gap-3">
            <img
              src={submitted?.counselor?.img}
              alt={submitted?.counselor?.name}
              style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }}
            />
            <div>
              <strong>{submitted?.counselor?.name}</strong>
              <div className="text-muted">{submitted?.counselor?.creds}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <h4>Focus & goal</h4>
        <div className="row wrap gap-2 mt-2">
          {submitted?.focusAreas?.map((t) => (
            <span className="mini-tag" key={t}>{t}</span>
          ))}
        </div>
        <p className="mt-2">{submitted?.goal}</p>
      </div>

      {submitted?.scores && (
        <div className="alert info mt-3">
          <strong>Shared scores:</strong>&nbsp; PHQ-9 {submitted.scores.phq}, GAD-7 {submitted.scores.gad} — {submitted.scores.risk}
        </div>
      )}

      <div className="row gap-3 mt-3">
        <button className="btn soft" onClick={() => exportJson(submitted, `${submitted.ticket}.json`)}>
          Download JSON
        </button>
        <button className="btn primary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>
    </div>
  );

  /** ---------- Render ---------- */

  return (
    <section className="section">
      <div className="container">
        {/* Offline banner */}
        {offline && (
          <div className="alert warn mb-3">
            <strong>Offline:</strong>&nbsp; We’ll queue your request and send it when you’re online.
          </div>
        )}

        {/* Stepper */}
        <div className="stepper">
          {["You", "Focus", "Schedule", "Preference", "Done"].map((t, i) => (
            <div key={t} className={`stp ${step === i ? "is-here" : step > i ? "is-done" : ""}`}>
              <div className="dot">{i + 1}</div>
              <div className="txt">{t}</div>
            </div>
          ))}
          <div className="bar" style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }} />
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 0 && Step1}
          {step === 1 && Step2}
          {step === 2 && Step3}
          {step === 3 && Step4}
          {step === 4 && Review}

          {/* Actions */}
          {step < 4 && (
            <div className="row justify-between mt-3">
              <div className="row gap-2">
                {step > 0 && (
                  <button type="button" className="btn soft" onClick={back}>
                    ← Back
                  </button>
                )}
              </div>
              <div className="row gap-2">
                {step < 3 && (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => {
                      // lightweight validation gate for current step
                      if (step === 0) {
                        if (!values.firstName || !values.lastName || !values.email) {
                          toast.error("Please fill your basic details");
                          return;
                        }
                      }
                      if (step === 1) {
                        if (!values.focusAreas?.length || !values.goal) {
                          toast.error("Pick focus & write your first goal");
                          return;
                        }
                      }
                      if (step === 2) {
                        if (!values.date || !values.time) {
                          toast.error("Choose a date and a time slot");
                          return;
                        }
                      }
                      next();
                    }}
                  >
                    Next →
                  </button>
                )}
                {step === 3 && (
                  <button className="btn primary" type="submit" disabled={isSubmitting || !isValid}>
                    {isSubmitting ? "Sending…" : "Request Appointment"}
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Tiny footer line */}
        {step < 4 && (
          <p className="fs-14 text-muted mt-3">
            Private by default. Your draft autosaves locally and can be cleared anytime.
          </p>
        )}
      </div>
    </section>
  );
}
