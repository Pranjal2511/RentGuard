import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "tenant" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!form.role) {
      newErrors.role = "Role selection is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError("");

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await signup(form);
      const destination = newUser.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Signup failed:", err);
      setGeneralError("Unable to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <h1 className="auth-page__heading">Create account</h1>
      <p className="auth-page__sub">Start protecting your rental today.</p>

      {generalError && <p className="auth-form__error" role="alert">{generalError}</p>}

      <form className="auth-form" onSubmit={handleSubmit} id="signup-form" noValidate>
        <div className="auth-form__group">
          <label htmlFor="signup-name" className="auth-form__label">
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            name="name"
            className={`auth-form__input ${errors.name ? "auth-form__input--error" : ""}`}
            placeholder="Priya Sharma"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <span id="name-error" className="auth-field-error">
              {errors.name}
            </span>
          )}
        </div>

        <div className="auth-form__group">
          <label htmlFor="signup-email" className="auth-form__label">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            className={`auth-form__input ${errors.email ? "auth-form__input--error" : ""}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <span id="email-error" className="auth-field-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className="auth-form__group">
          <label htmlFor="signup-password" className="auth-form__label">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            name="password"
            className={`auth-form__input ${errors.password ? "auth-form__input--error" : ""}`}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <span id="password-error" className="auth-field-error">
              {errors.password}
            </span>
          )}
        </div>

        <div className="auth-form__group">
          <label htmlFor="signup-role" className="auth-form__label">
            I am a
          </label>
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
          {errors.role && (
            <span id="role-error" className="auth-field-error">
              {errors.role}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="auth-form__submit"
          id="signup-submit"
          disabled={submitting}
        >
          {submitting ? "Creating Account…" : "Create Account"}
        </button>
      </form>

      <p className="auth-page__footer">
        Already have an account?{" "}
        <Link to="/login" className="auth-page__link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
