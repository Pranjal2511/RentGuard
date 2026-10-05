import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "tenant" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    // Mock signup — just log in with the mock user
    login(form.email, form.password, form.role);
    navigate(form.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
  }

  return (
    <div className="auth-page">
      <h1 className="auth-page__heading">Create account</h1>
      <p className="auth-page__sub">Start protecting your rental today.</p>

      <form className="auth-form" onSubmit={handleSubmit} id="signup-form">
        <div className="auth-form__group">
          <label htmlFor="signup-name" className="auth-form__label">Full Name</label>
          <input
            id="signup-name"
            type="text"
            name="name"
            className="auth-form__input"
            placeholder="Priya Sharma"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="auth-form__group">
          <label htmlFor="signup-email" className="auth-form__label">Email</label>
          <input
            id="signup-email"
            type="email"
            name="email"
            className="auth-form__input"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="auth-form__group">
          <label htmlFor="signup-password" className="auth-form__label">Password</label>
          <input
            id="signup-password"
            type="password"
            name="password"
            className="auth-form__input"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div className="auth-form__group">
          <label htmlFor="signup-role" className="auth-form__label">I am a</label>
          <select
            id="signup-role"
            name="role"
            className="auth-form__input"
            value={form.role}
            onChange={handleChange}
          >
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
        </div>

        {error && <p className="auth-form__error">{error}</p>}

        <button type="submit" className="auth-form__submit" id="signup-submit">
          Create Account
        </button>
      </form>

      <p className="auth-page__footer">
        Already have an account?{" "}
        <Link to="/login" className="auth-page__link">Sign in</Link>
      </p>
    </div>
  );
}
