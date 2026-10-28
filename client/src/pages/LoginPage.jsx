import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) {
    return (
      <Navigate
        to={currentUser.role === 'Vendor' ? '/vendor/dashboard' : '/shop'}
        replace
      />
    );
  }

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.password) nextErrors.password = 'Enter your password.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await login(form.email, form.password);
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    const destination =
      result.user.role === 'Vendor'
        ? '/vendor/dashboard'
        : location.state?.from || '/shop';
    navigate(destination, { replace: true });
  };

  return (
    <section className="auth-page section-space">
      <div className="container auth-layout">
        <div className="auth-intro">
          <p className="eyebrow">Welcome back</p>
          <h1>Good to see you again.</h1>
          <p>Sign in to keep discovering thoughtful products from MarketHub sellers.</p>
        </div>
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-card-heading">
            <h2>Log in</h2>
            <p>Use your demo account credentials.</p>
          </div>
          {location.state?.message && (
            <p className="auth-success">{location.state.message}</p>
          )}
          <label className="form-field">
            <span>Email address</span>
            <input
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={(event) => updateField('email', event.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <small className="field-error">{errors.email}</small>}
          </label>
          <label className="form-field">
            <span>Password</span>
            <span className="password-input">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                value={form.password}
                autoComplete="current-password"
                onChange={(event) => updateField('password', event.target.value)}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                {isPasswordVisible ? 'Hide' : 'Show'}
              </button>
            </span>
            {errors.password && <small className="field-error">{errors.password}</small>}
          </label>
          {formError && <p className="auth-error">{formError}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Log in'} <span aria-hidden="true">→</span>
          </button>
          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/signup">Create one</Link>
          </p>
          <p className="demo-notice">
            Demo only: authentication is handled by the MarketHub backend.
            This environment is not production-grade.
          </p>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
