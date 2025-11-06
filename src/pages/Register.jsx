import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Register(){
  const { register: reg, handleSubmit } = useForm();
  const { register: signUp } = useAuth();
  const nav = useNavigate();

  const onSubmit = async ({ name, email, password }) => {
    try {
      await signUp(email, password, name);
      toast.success("Account created!");
      nav("/profile");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <section className="section">
      <div className="container" style={{maxWidth:480}}>
        <h2>Create account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid" style={{gap:12}}>
          <input placeholder="Full name" {...reg("name", {required:true})}/>
          <input placeholder="Email" type="email" {...reg("email", {required:true})}/>
          <input placeholder="Password" type="password" {...reg("password", {required:true, minLength:6})}/>
          <button className="btn primary">Register</button>
        </form>
        <p style={{marginTop:8}}>Have an account? <Link to="/login">Log in</Link></p>
      </div>
    </section>
  );
}
