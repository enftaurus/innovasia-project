import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Login(){
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      toast.success("Welcome back!");
      nav("/profile");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <section className="section">
      <div className="container" style={{maxWidth:480}}>
        <h2>Log in</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid" style={{gap:12}}>
          <input placeholder="Email" type="email" {...register("email", {required:true})}/>
          <input placeholder="Password" type="password" {...register("password", {required:true})}/>
          <button className="btn primary">Log in</button>
        </form>
        <p style={{marginTop:8}}>No account? <Link to="/register">Register</Link></p>
      </div>
    </section>
  );
}
