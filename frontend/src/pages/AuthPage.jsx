import React, { useState, useEffect } from 'react';
import { GraduationCap, Check, X, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AuthPage({ onLoginSuccess, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'signup' | 'forgot' | 'google-mock'
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up Wizard State
  const [signupStep, setSignupStep] = useState(1); // 1: Details, 2: OTP, 3: Password
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupOtp, setSignupOtp] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Forgot Password Wizard State
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');

  // Google Mock State
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  // Global UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  
  // OTP Resend Countdown
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      setCanResend(false);
      timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Password Requirement Helpers
  const getPasswordCriteria = (pwd) => {
    return [
      { label: 'At least 8 characters', met: pwd.length >= 8 },
      { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(pwd) },
      { label: 'At least 1 lowercase letter', met: /[a-z]/.test(pwd) },
      { label: 'At least 1 number', met: /\d/.test(pwd) },
      { label: 'At least 1 special character (@$!%*?&)', met: /[@$!%*?&]/.test(pwd) },
    ];
  };

  const isPasswordValid = (pwd) => {
    return getPasswordCriteria(pwd).every(c => c.met);
  };

  // Reset page errors on tab change
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setError('');
    setSuccess('');
    setDebugOtp('');
    setLoading(false);
    
    // Reset wizard states
    setSignupStep(1);
    setForgotStep(1);
  };

  // Actions
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return data;
    })
    .then(data => {
      onLoginSuccess(data.user, data.token);
      if (rememberMe) {
        localStorage.setItem('remembered_email', loginEmail);
      } else {
        localStorage.removeItem('remembered_email');
      }
      
      // Redirect based on whether user has completed onboarding preferences
      if (!data.user.education_level && !data.user.preferred_branch) {
        window.location.hash = '#onboarding';
      } else {
        window.location.hash = '#home';
      }
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem('remembered_email');
    if (saved) {
      setLoginEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Signup Wizard Step 1: Submit Details & Request OTP
  const handleSignupStep1 = (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail) {
      setError('Please fill in your name and email address.');
      return;
    }

    setLoading(true);
    setError('');
    setDebugOtp('');

    // Check if account already exists before sending OTP
    fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupEmail, purpose: 'signup' })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code');
      return data;
    })
    .then(data => {
      setLoading(false);
      setSignupStep(2);
      setDebugOtp(data.debug_otp); // simulated bypass helper
      setResendCountdown(30);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  // Signup Wizard Step 2: Verify OTP
  const handleSignupStep2 = (e) => {
    e.preventDefault();
    if (!signupOtp) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupEmail, otp: signupOtp })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      return data;
    })
    .then(() => {
      setLoading(false);
      setSignupStep(3);
      setSuccess('Email verified successfully!');
      setTimeout(() => setSuccess(''), 3000);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  // Signup Wizard Step 3: Complete Password Creation
  const handleSignupStep3 = (e) => {
    e.preventDefault();
    if (!signupPassword) {
      setError('Please enter a password.');
      return;
    }
    if (!isPasswordValid(signupPassword)) {
      setError('Your password does not meet the safety requirements.');
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: signupName,
        email: signupEmail,
        password: signupPassword
      })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register account');
      return data;
    })
    .then(data => {
      onLoginSuccess(data.user, data.token);
      // Success redirects straight to onboarding screen questionnaire
      window.location.hash = '#onboarding';
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  // Forgot Password Wizard Step 1: Request OTP
  const handleForgotStep1 = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail, purpose: 'forgot_password' })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Email address not found');
      return data;
    })
    .then(data => {
      setLoading(false);
      setForgotStep(2);
      setDebugOtp(data.debug_otp); // simulated bypass helper
      setResendCountdown(30);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  // Forgot Password Wizard Step 2: Verify OTP
  const handleForgotStep2 = (e) => {
    e.preventDefault();
    if (!forgotOtp) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail, otp: forgotOtp })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      return data;
    })
    .then(() => {
      setLoading(false);
      setForgotStep(3);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  // Forgot Password Wizard Step 3: Complete Reset
  const handleForgotStep3 = (e) => {
    e.preventDefault();
    if (!forgotPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (!isPasswordValid(forgotPassword)) {
      setError('Your password does not meet the safety requirements.');
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail, password: forgotPassword })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      return data;
    })
    .then(() => {
      setLoading(false);
      setSuccess('Your password has been reset successfully! Please log in.');
      setTimeout(() => {
        handleTabChange('login');
      }, 3000);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  // OTP Resend Action
  const triggerOtpResend = (email, purpose) => {
    if (!canResend) return;

    setError('');
    setDebugOtp('');
    fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');
      return data;
    })
    .then(data => {
      setDebugOtp(data.debug_otp);
      setResendCountdown(30);
      setSuccess('A new verification code has been generated.');
      setTimeout(() => setSuccess(''), 4000);
    })
    .catch(err => {
      setError(err.message);
    });
  };

  // Google Mock Form submit
  const handleGoogleMockSubmit = (e) => {
    e.preventDefault();
    if (!googleEmail || !googleName) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleEmail,
        name: googleName,
        google_id: `g_mock_${Date.now()}`
      })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      return data;
    })
    .then(data => {
      onLoginSuccess(data.user, data.token);
      if (!data.user.education_level && !data.user.preferred_branch) {
        window.location.hash = '#onboarding';
      } else {
        window.location.hash = '#home';
      }
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  const selectDemoGoogleAccount = (name, email) => {
    setGoogleName(name);
    setGoogleEmail(email);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Header Section */}
        <div className="auth-header">
          <div className="auth-logo">
            <GraduationCap size={36} style={{ color: 'var(--primary)' }} />
            <span>College Compass</span>
          </div>
          <div className="auth-tagline">Find Your Perfect College</div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            color: 'var(--chance-reach)',
            background: 'var(--chance-reach-bg)',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius-sm)',
            marginBottom: '20px',
            fontSize: '0.85rem'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            color: 'var(--chance-safe)',
            background: 'var(--chance-safe-bg)',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius-sm)',
            marginBottom: '20px',
            fontSize: '0.85rem'
          }}>
            <Check size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Simulated OTP Helper Banner */}
        {debugOtp && (
          <div style={{
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px dashed var(--secondary)',
            color: 'var(--secondary)',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius-sm)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            🔑 <strong>Testing Bypass:</strong> The generated 6-digit verification code is: 
            <span style={{ fontSize: '1.25rem', display: 'block', fontWeight: '800', margin: '6px 0', letterSpacing: '4px' }}>
              {debugOtp}
            </span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              (Normally this is logged in the backend terminal console)
            </span>
          </div>
        )}

        {/* LOGIN TAB */}
        {tab === 'login' && (
          <div>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue your college search journey.</p>

            {/* Google Sign-in Trigger */}
            <button className="btn-social" onClick={() => handleTabChange('google-mock')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">or continue with email</div>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={() => handleTabChange('forgot')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              New to College Compass?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}
              >
                Create Account
              </button>
            </p>
          </div>
        )}

        {/* SIGN UP WIZARD TAB */}
        {tab === 'signup' && (
          <div>
            <h2 className="auth-title">Create Your College Compass Account</h2>
            <p className="auth-subtitle" style={{ marginBottom: '20px' }}>
              Save colleges, track admissions, and get personalized recommendations.
            </p>

            {/* Steps Visual Progress */}
            <div className="signup-steps">
              <div className={`signup-step ${signupStep === 1 ? 'active' : ''} ${signupStep > 1 ? 'completed' : ''}`}>
                {signupStep > 1 ? <Check size={14} /> : '1'}
              </div>
              <div className={`signup-step ${signupStep === 2 ? 'active' : ''} ${signupStep > 2 ? 'completed' : ''}`}>
                {signupStep > 2 ? <Check size={14} /> : '2'}
              </div>
              <div className={`signup-step ${signupStep === 3 ? 'active' : ''}`}>
                3
              </div>
            </div>

            {/* Step 1: Details */}
            {signupStep === 1 && (
              <form onSubmit={handleSignupStep1}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>
                  {loading ? 'Sending Code...' : 'Continue'} <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {signupStep === 2 && (
              <form onSubmit={handleSignupStep2}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    We have sent a verification code to <strong>{signupEmail}</strong>.
                  </p>
                </div>

                <div className="form-group">
                  <label>6-Digit Verification Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="123456"
                    maxLength={6}
                    value={signupOtp}
                    onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '8px', fontWeight: '700' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {!canResend ? `Resend available in ${resendCountdown}s` : 'Didn\'t get the code?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerOtpResend(signupEmail, 'signup')}
                    disabled={!canResend}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: canResend ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: '600',
                      cursor: canResend ? 'pointer' : 'default'
                    }}
                  >
                    Resend Code
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setSignupStep(1)}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Password Creation */}
            {signupStep === 3 && (
              <form onSubmit={handleSignupStep3}>
                <div className="form-group">
                  <label>Create Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Password Strength Checklist */}
                <div className="password-criteria">
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Password Safety Requirements:
                  </div>
                  {getPasswordCriteria(signupPassword).map((crit, idx) => (
                    <div key={idx} className={`criterion ${crit.met ? 'met' : 'unmet'}`}>
                      {crit.met ? (
                        <Check size={12} strokeWidth={3} />
                      ) : (
                        <div className="criterion-icon" />
                      )}
                      <span>{crit.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '20px' }}
                  disabled={loading || !isPasswordValid(signupPassword)}
                >
                  {loading ? 'Completing Registration...' : 'Complete Sign Up'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}
              >
                Log In
              </button>
            </p>
          </div>
        )}

        {/* FORGOT PASSWORD TAB */}
        {tab === 'forgot' && (
          <div>
            <h2 className="auth-title">Reset Your Password</h2>
            <p className="auth-subtitle">We will help you regain access to your account.</p>

            {/* Step 1: Input Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotStep1}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => handleTabChange('login')}
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Send Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Verification Code */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotStep2}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Verification code sent to <strong>{forgotEmail}</strong>.
                  </p>
                </div>

                <div className="form-group">
                  <label>6-Digit Verification Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="123456"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '8px', fontWeight: '700' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {!canResend ? `Resend available in ${resendCountdown}s` : 'Didn\'t get the code?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerOtpResend(forgotEmail, 'forgot_password')}
                    disabled={!canResend}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: canResend ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: '600',
                      cursor: canResend ? 'pointer' : 'default'
                    }}
                  >
                    Resend Code
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setForgotStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Enter New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleForgotStep3}>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={forgotPassword}
                    onChange={(e) => setForgotPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Password Strength Checklist */}
                <div className="password-criteria">
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Password Safety Requirements:
                  </div>
                  {getPasswordCriteria(forgotPassword).map((crit, idx) => (
                    <div key={idx} className={`criterion ${crit.met ? 'met' : 'unmet'}`}>
                      {crit.met ? (
                        <Check size={12} strokeWidth={3} />
                      ) : (
                        <div className="criterion-icon" />
                      )}
                      <span>{crit.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '20px' }}
                  disabled={loading || !isPasswordValid(forgotPassword)}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* GOOGLE SIMULATION MOCK SELECTOR */}
        {tab === 'google-mock' && (
          <div>
            <h2 className="auth-title">Simulated Google Accounts</h2>
            <p className="auth-subtitle">Choose a mock Google Account to quickly sign in and test.</p>

            {/* Demo Accounts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com' },
                { name: 'Priya Patel', email: 'priya.patel@gmail.com' },
                { name: 'Amit Verma', email: 'amit.verma@gmail.com' }
              ].map((account, idx) => (
                <div
                  key={idx}
                  onClick={() => selectDemoGoogleAccount(account.name, account.email)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--border-radius-sm)',
                    border: googleEmail === account.email ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: googleEmail === account.email ? 'var(--primary-light)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: googleEmail === account.email ? 'var(--primary)' : 'inherit' }}>
                    {account.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {account.email}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider">or create custom profile</div>

            <form onSubmit={handleGoogleMockSubmit}>
              <div className="form-group">
                <label>Mock Profile Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mock Gmail Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. john.doe@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => handleTabChange('login')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
