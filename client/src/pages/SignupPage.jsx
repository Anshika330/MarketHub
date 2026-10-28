import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Customer',
};

function SignupPage() {
  const navigate = useNavigate();
  const { currentUser, signup } = useAuth();
  const [form, setForm] = useState(initialForm);
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

    if (!form.name.trim()) nextErrors.name = 'Enter your full name.';
    if (!form.email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await signup(form);
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    navigate('/login', {
      replace: true,
      state: { message: 'Account created. Log in with your demo credentials.' },
    });
  };

  return (
    <section className="auth-page section-space">
      <div className="container auth-layout">
        <div className="auth-intro">
          <p className="eyebrow">Join MarketHub</p>
          <h1>Find your place in the marketplace.</h1>
          <p>Shop from independent sellers or bring your own special finds to a growing community.</p>
        </div>
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-card-heading">
            <h2>Create account</h2>
            <p>Choose how you&apos;d like to use MarketHub.</p>
          </div>
          <label className="form-field">
            <span>Full name</span>
            <input
              type="text"
              value={form.name}
              autoComplete="name"
              onChange={(event) => updateField('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <small className="field-error">{errors.name}</small>}
          </label>
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
                autoComplete="new-password"
                onChange={(event) => updateField('password', event.target.value)}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? 'Hide' : 'Show'}
              </button>
            </span>
            {errors.password && <small className="field-error">{errors.password}</small>}
          </label>
          <label className="form-field">
            <span>Confirm password</span>
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              value={form.confirmPassword}
              autoComplete="new-password"
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword && (
              <small className="field-error">{errors.confirmPassword}</small>
            )}
          </label>
          <fieldset className="role-selector">
            <legend>Account type</legend>
            <div className="role-options">
              {['Customer', 'Vendor'].map((role) => (
                <label className={`role-option${form.role === role ? ' role-option--active' : ''}`} key={role}>
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={form.role === role}
                    onChange={(event) => updateField('role', event.target.value)}
                  />
                  <span><strong>{role}</strong><small>{role === 'Vendor' ? 'Sell your products' : 'Shop great finds'}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          {formError && <p className="auth-error">{formError}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'} <span aria-hidden="true">→</span>
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
          <p className="demo-notice">
            Demo only: your password is securely hashed by the backend.
            This environment is not production-grade.
            Never use this approach for production authentication.
          </p>
        </form>
      </div>
    </section>
  );
}

export default SignupPage;
