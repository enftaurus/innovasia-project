import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

/** ========= Utility bits ========= */

const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);

// Slot labels mapping
const SLOT_LABELS = {
  slot1: "09:00 - 10:00",
  slot2: "10:00 - 11:00",
  slot3: "11:00 - 12:00",
  slot4: "14:00 - 15:00",
  slot5: "15:00 - 16:00",
};

/** ========= Validation ========= */

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  problem: z.string().min(10, "Tell us about your problem (min 10 characters)"),
  why_stressed: z.string().min(10, "Tell us why you are stressed (min 10 characters)"),
  counsellor_id: z.string().min(1, "Please select a counsellor"),
  date: z.string().min(1, "Pick a date"),
  slot: z.string().min(1, "Pick a time slot"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please accept consent to proceed" }),
  }),
});

/** ========= Component ========= */

export default function Appointments() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [counsellors, setCounsellors] = useState([]);
  const [loadingCounsellors, setLoadingCounsellors] = useState(true);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: user?.displayName || "",
      email: user?.email || "",
      phone: "",
      problem: "",
      why_stressed: "",
      counsellor_id: "",
      date: fmtDate(new Date(Date.now() + 24 * 3600 * 1000)),
      slot: "",
      consent: false,
    },
  });

  const values = watch();

  // Fetch counsellors on mount
  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/appointments/counsellors", {
          withCredentials: true,
        });
        setCounsellors(res.data.counsellors || []);
      } catch (err) {
        console.error("Error fetching counsellors:", err);
        // Fallback to hardcoded counsellors
        setCounsellors([
          {
            id: "cns-elena",
            name: "AKASH",
            mail: "akash@example.com",
            specialization: ["Anxiety", "Sleep", "Study Stress"],
            credentials: "M.Sc, RCI",
            img: "https://sdbeqzvabcggpkmicvlk.supabase.co/storage/v1/object/public/counsellor%20pics/prem.jpeg",
          },
          {
            id: "cns-faisal",
            name: "DHANUSH",
            mail: "dhanush@example.com",
            specialization: ["Depression", "Motivation", "Panic"],
            credentials: "Ph.D., Clinical Psych.",
            img: "https://sdbeqzvabcggpkmicvlk.supabase.co/storage/v1/object/public/counsellor%20pics/dhanush.jpeg",
          },
          {
            id: "cns-nat",
            name: "PREM",
            mail: "prem@example.com",
            specialization: ["Relationships", "Time Management", "Study Stress"],
            credentials: "M.Phil, CBT",
            img: "https://sdbeqzvabcggpkmicvlk.supabase.co/storage/v1/object/public/counsellor%20pics/akash.jpeg",
          },
        ]);
      } finally {
        setLoadingCounsellors(false);
      }
    };
    fetchCounsellors();
  }, []);

  // Fetch slots when counsellor and date are selected (on step 3 or 4)
  useEffect(() => {
    if (values.counsellor_id && values.date && (step === 3 || step === 4)) {
      fetchSlots(values.counsellor_id, values.date);
    }
  }, [values.counsellor_id, values.date, step]);

  const fetchSlots = async (counsellorId, date) => {
    if (!counsellorId || !date) {
      setAvailableSlots(null);
      return;
    }
    setLoadingSlots(true);
    setAvailableSlots(null); // Clear previous slots
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/appointments/slots/${counsellorId}/${date}`,
        { withCredentials: true }
      );
      if (res.data?.available_slots) {
        setAvailableSlots(res.data.available_slots);
      } else {
        toast.error("No slots data received");
        setAvailableSlots(null);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      toast.error(err.response?.data?.detail || "Failed to load available slots");
      setAvailableSlots(null);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Update selected counsellor when counsellor_id changes
  useEffect(() => {
    if (values.counsellor_id) {
      const counsellor = counsellors.find((c) => c.id === values.counsellor_id);
      setSelectedCounsellor(counsellor);
    }
  }, [values.counsellor_id, counsellors]);

  /** ---------- Submit ---------- */
  const onSubmit = async (data) => {
    if (!selectedCounsellor) {
      toast.error("Please select a counsellor");
      return;
    }

    const payload = {
      name: data.name,
      mail: data.email,
      phone: data.phone,
      counsellor_id: data.counsellor_id,
      counsellor_name: selectedCounsellor.name,
      counsellor_mail: selectedCounsellor.mail,
      date: data.date,
      focus_goals: [data.problem], // Using problem as focus goal
      work_problem: data.why_stressed,
      slot: data.slot,
      consent: data.consent,
    };

    try {
      const res = await axios.post("http://127.0.0.1:8000/appointments/book", payload, {
        withCredentials: true,
      });
      toast.success("Appointment booked successfully!");
      setSubmitted(res.data);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.detail || "Failed to book appointment");
    }
  };

  /** ---------- Helpers ---------- */
  const next = () => {
    // Validate current step before proceeding
    if (step === 0) {
      if (!values.name || !values.email || !values.phone || !values.problem || !values.why_stressed) {
        toast.error("Please fill all required fields");
        return;
      }
    }
    if (step === 1) {
      if (!values.counsellor_id) {
        toast.error("Please select a counsellor");
        return;
      }
    }
    if (step === 2) {
      if (!values.date) {
        toast.error("Please select a date");
        return;
      }
      // Fetch slots when moving to step 4 (slot selection)
      if (values.counsellor_id && values.date) {
        fetchSlots(values.counsellor_id, values.date);
      }
    }
    if (step === 3) {
      if (!values.slot) {
        toast.error("Please select a time slot");
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  /** ---------- UI ---------- */

  // Step 1: Basic Details
  const Step1 = (
    <div className="appt-card">
      <h3 className="appt-h3">Your Details</h3>
      <div className="form">
        <label className="full">
          Full Name
          <input {...register("name")} placeholder="Enter your full name" />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </label>
        <label className="full">
          Email
          <input type="email" {...register("email")} placeholder="your.email@example.com" />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </label>
        <label className="full">
          Phone
          <input {...register("phone")} placeholder="+91 98 76 54 321" />
          {errors.phone && <span className="error">{errors.phone.message}</span>}
        </label>
        <label className="full">
          What is your problem? *
          <textarea
            {...register("problem")}
            rows={4}
            placeholder="Describe what you're struggling with..."
          />
          {errors.problem && <span className="error">{errors.problem.message}</span>}
        </label>
        <label className="full">
          Why are you stressed? *
          <textarea
            {...register("why_stressed")}
            rows={4}
            placeholder="Tell us what's causing your stress..."
          />
          {errors.why_stressed && <span className="error">{errors.why_stressed.message}</span>}
        </label>
      </div>
    </div>
  );

  // Step 2: Select Counsellor
  const Step2 = (
    <div className="appt-card">
      <h3 className="appt-h3">Select a Counsellor</h3>
      <p className="text-muted mb-3">
        Based on your problem, we recommend these counsellors:
      </p>
      {loadingCounsellors ? (
        <div className="text-center">Loading counsellors...</div>
      ) : (
        <div className="counselor-grid">
          {counsellors.map((c) => {
            const on = values.counsellor_id === c.id;
            return (
              <label key={c.id} className={`c-card ${on ? "on" : ""}`}>
                <input
                  type="radio"
                  value={c.id}
                  {...register("counsellor_id")}
                  className="hidden"
                />
                {c.img && <img src={c.img} alt={c.name} />}
                <div className="c-meta">
                  <strong>{c.name}</strong>
                  {c.credentials && <span className="badge">{c.credentials}</span>}
                  {c.specialization && (
                    <div className="c-tags">
                      {c.specialization.map((t) => (
                        <span className="mini-tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}
      {errors.counsellor_id && (
        <div className="error mt-2">{errors.counsellor_id.message}</div>
      )}
    </div>
  );

  // Step 3: Select Date
  const Step3 = (
    <div className="appt-card">
      <h3 className="appt-h3">Select Date</h3>
      <div className="form">
        <label className="full">
          Preferred Date
          <input
            type="date"
            min={fmtDate(new Date())}
            {...register("date")}
            onChange={(e) => {
              setValue("slot", ""); // Clear slot when date changes
              setAvailableSlots(null); // Clear slots when date changes
              register("date").onChange(e);
            }}
          />
          {errors.date && <span className="error">{errors.date.message}</span>}
        </label>
        {selectedCounsellor && (
          <div className="alert info mt-3">
            <strong>Selected Counsellor:</strong> {selectedCounsellor.name}
          </div>
        )}
      </div>
    </div>
  );

  // Step 4: Select Slot
  const Step4 = (
    <div className="appt-card">
      <h3 className="appt-h3">Select Time Slot</h3>
      {!values.counsellor_id || !values.date ? (
        <div className="alert warn">Please select a counsellor and date first</div>
      ) : loadingSlots ? (
        <div className="text-center">Loading available slots...</div>
      ) : availableSlots ? (
        <div className="slot-grid">
          {Object.entries(availableSlots).map(([slotKey, isAvailable]) => {
            const on = values.slot === slotKey;
            return (
              <button
                key={slotKey}
                type="button"
                className={`slot ${on ? "on" : ""} ${!isAvailable ? "disabled" : ""}`}
                onClick={() => {
                  if (isAvailable) {
                    setValue("slot", slotKey, { shouldValidate: true });
                  } else {
                    toast.error("This slot is already booked");
                  }
                }}
                disabled={!isAvailable}
              >
                {SLOT_LABELS[slotKey] || slotKey}
                {!isAvailable && " (Booked)"}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="alert warn">
          No slots available. Please try selecting the date again or choose a different date.
        </div>
      )}
      {errors.slot && <div className="error mt-2">{errors.slot.message}</div>}
    </div>
  );

  // Step 5: Consent & Submit
  const Step5 = (
    <div className="appt-card">
      <h3 className="appt-h3">Review & Consent</h3>
      <div className="card mb-3">
        <h4>Appointment Summary</h4>
        <ul className="kv">
          <li>
            <span>Name</span>
            <strong>{values.name}</strong>
          </li>
          <li>
            <span>Email</span>
            <strong>{values.email}</strong>
          </li>
          <li>
            <span>Phone</span>
            <strong>{values.phone}</strong>
          </li>
          <li>
            <span>Counsellor</span>
            <strong>{selectedCounsellor?.name}</strong>
          </li>
          <li>
            <span>Date</span>
            <strong>{values.date}</strong>
          </li>
          <li>
            <span>Time Slot</span>
            <strong>{SLOT_LABELS[values.slot] || values.slot}</strong>
          </li>
        </ul>
      </div>
      <label className="row items-center gap-2">
        <input type="checkbox" {...register("consent")} />
        <span>
          I consent to share my mental health assessment data with the counsellor (if available)
        </span>
      </label>
      {errors.consent && <div className="error mt-2">{errors.consent.message}</div>}
    </div>
  );

  // Step 6: Confirmation
  const Step6 = submitted ? (
    <div className="appt-card">
      <h3 className="appt-h3">Appointment Booked Successfully! ✅</h3>
      <p className="text-muted">
        You'll receive an email confirmation shortly. Your appointment details:
      </p>
      <div className="card mt-3">
        <ul className="kv">
          <li>
            <span>Counsellor</span>
            <strong>{selectedCounsellor?.name}</strong>
          </li>
          <li>
            <span>Date</span>
            <strong>{values.date}</strong>
          </li>
          <li>
            <span>Time Slot</span>
            <strong>{SLOT_LABELS[values.slot] || values.slot}</strong>
          </li>
        </ul>
      </div>
      <div className="row gap-3 mt-3">
        <button className="btn primary" onClick={() => window.location.reload()}>
          Book Another Appointment
        </button>
      </div>
    </div>
  ) : null;

  /** ---------- Render ---------- */

  return (
    <section className="section">
      <div className="container">
        {/* Stepper */}
        <div className="stepper">
          {["Details", "Counsellor", "Date", "Time", "Review", "Done"].map((t, i) => (
            <div key={t} className={`stp ${step === i ? "is-here" : step > i ? "is-done" : ""}`}>
              <div className="dot">{i + 1}</div>
              <div className="txt">{t}</div>
            </div>
          ))}
          <div className="bar" style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }} />
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 0 && Step1}
          {step === 1 && Step2}
          {step === 2 && Step3}
          {step === 3 && Step4}
          {step === 4 && Step5}
          {step === 5 && Step6}

          {/* Actions */}
          {step < 5 && (
            <div className="row justify-between mt-3">
              <div className="row gap-2">
                {step > 0 && (
                  <button type="button" className="btn soft" onClick={back}>
                    ← Back
                  </button>
                )}
              </div>
              <div className="row gap-2">
                {step < 4 && (
                  <button type="button" className="btn primary" onClick={next}>
                    Next →
                  </button>
                )}
                {step === 4 && (
                  <button
                    className="btn primary"
                    type="submit"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? "Booking..." : "Book Appointment"}
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
