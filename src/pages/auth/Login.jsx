import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", role: "tenant" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    login(form.email, form.password, form.role);
    navigate(form.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
  }

  return (
    <div className="auth-page">
      <h1 className="auth-page__heading">Sign in</h1>
      <p className="auth-page__sub">Welcome back to RentGuard.</p>

      <form className="auth-form" onSubmit={handleSubmit} id="login-form">
        <div className="auth-form__group">
          <label htmlFor="login-email" className="auth-form__label">Email</label>
          <input
            id="login-email"
            type="email"
            name="email"
            className="auth-form__input"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className="auth-form__group">
          <label htmlFor="login-password" className="auth-form__label">Password</label>
          <input
            id="login-password"
            type="password"
            name="password"
            className="auth-form__input"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        <div className="auth-form__group">
          <label htmlFor="login-role" className="auth-form__label">I am a</label>
          <select
            id="login-role"
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

        <button type="submit" className="auth-form__submit" id="login-submit">
          Sign In
        </button>
      </form>

      <p className="auth-page__footer">
        Don't have an account?{" "}
        <Link to="/signup" className="auth-page__link">Create one</Link>
      </p>
    </div>
  );
}
