// import React from "react";
// import { useForm } from "react-hook-form";
// import { useAuth } from "../hooks/useAuth";
// import toast from "react-hot-toast";
// import { useNavigate, Link } from "react-router-dom";

// export default function Login(){
//   const { register, handleSubmit } = useForm();
//   const { login } = useAuth();
//   const nav = useNavigate();

//   const onSubmit = async ({ email, password }) => {
//     try {
//       await login(email, password);
//       toast.success("Welcome back!");
//       nav("/profile");
//     } catch (e) {
//       toast.error(e.message);
//     }
//   };

//   return (
//     <section className="section">
//       <div className="container" style={{maxWidth:480}}>
//         <h2>Log in</h2>
//         <form onSubmit={handleSubmit(onSubmit)} className="grid" style={{gap:12}}>
//           <input placeholder="Email" type="email" {...register("email", {required:true})}/>
//           <input placeholder="Password" type="password" {...register("password", {required:true})}/>
//           <button className="btn primary">Log in</button>
//         </form>
//         <p style={{marginTop:8}}>No account? <Link to="/register">Register</Link></p>
//       </div>
//     </section>
//   );
// }



import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import "../style.css";

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ mail: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { mail, password } = form;

    const res = await login(mail, password);
    setLoading(false);

    if (res.success) {
      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/chat";
      }, 1000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="login-wrapper">
      <header className="register-header">🌿 Student Sanctuary — Login</header>

      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <p className="subtext">Sign in to continue your journey 🌱</p>

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
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="switch-text">
            Don’t have an account?{" "}
            <a href="/register" className="highlight-link">
              Register here
            </a>
          </p>
        </form>
      </div>

      <footer className="register-footer">
        <p>© 2025 Student Sanctuary — All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
