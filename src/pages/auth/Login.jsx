import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "", role: "tenant" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
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
      const loggedUser = await login(form.email, form.password, form.role);
      const destination =
        location.state?.from?.pathname ||
        (loggedUser.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setGeneralError("Unable to sign in. Please verify your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <h1 className="auth-page__heading">Sign in</h1>
      <p className="auth-page__sub">Welcome back to RentGuard.</p>

      {generalError && <p className="auth-form__error" role="alert">{generalError}</p>}

      <form className="auth-form" onSubmit={handleSubmit} id="login-form" noValidate>
        <div className="auth-form__group">
          <label htmlFor="login-email" className="auth-form__label">
            Email
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="auth-form__label">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            className={`auth-form__input ${errors.password ? "auth-form__input--error" : ""}`}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
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
          <label htmlFor="login-role" className="auth-form__label">
            I am a
          </label>
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

        <button
          type="submit"
          className="auth-form__submit"
          id="login-submit"
          disabled={submitting}
        >
          {submitting ? "Signing In…" : "Sign In"}
        </button>
      </form>

      <p className="auth-page__footer">
        Don't have an account?{" "}
        <Link to="/signup" className="auth-page__link">
          Create one
        </Link>
      </p>
    </div>
  );
}
