import React, { useState } from "react";
import axios from "axios";
import "../style.css";

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "male",
    age: "",
    mail: "",
    place: "",
    phone: "",
    education: "",
    institution: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Ensure proper DOB format YYYY-MM-DD
      const cleanForm = {
        ...form,
        dob: form.dob,
        phone: form.phone.trim(),
      };

      const res = await axios.post("http://localhost:8000/register/", cleanForm);
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.detail) setError(err.response.data.detail);
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/register/validate", {
        mail: form.mail,
        otp: parseInt(otp),
      });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.detail) setError(err.response.data.detail);
      else setError("Invalid OTP or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <header className="register-header">🌿 Student Sanctuary — Register</header>

      <div className="register-container">
        {step === 1 && (
          <form className="register-form" onSubmit={handleRegister}>
            <h2>Create Your Account</h2>

            {/* Row 1 */}
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="form-grid">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Age"
                  min="10"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="mail"
                  value={form.mail}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="1234567890"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="form-grid">
              <div className="form-group">
                <label>Place</label>
                <input
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  placeholder="City / Town"
                  required
                />
              </div>

              <div className="form-group">
                <label>Education</label>
                <input
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  placeholder="B.Tech / B.E / B.Sc"
                  required
                />
              </div>

              <div className="form-group">
                <label>Institution</label>
                <input
                  name="institution"
                  value={form.institution}
                  onChange={handleChange}
                  placeholder="College / University"
                  required
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Choose a strong password"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Register"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="register-form" onSubmit={handleValidateOtp}>
            <h2>Verify Your Email</h2>
            <p className="otp-info">
              We’ve sent a 6-digit OTP to <strong>{form.mail}</strong>.
            </p>

            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter your OTP"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => setStep(1)}
            >
              ← Back to Registration
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="success-section">
            <h2>🎉 Registration Successful!</h2>
            <p>You can now log in with your registered email and password.</p>
            <button
              className="primary-btn"
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default Register;
