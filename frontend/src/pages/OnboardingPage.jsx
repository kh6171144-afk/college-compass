import React, { useState } from 'react';
import { ShieldAlert, Check, BookOpen, MapPin, Award, Compass, School } from 'lucide-react';

export default function OnboardingPage({ token, onPreferencesSaved }) {
  const [educationLevel, setEducationLevel] = useState('');
  const [preferredBranch, setPreferredBranch] = useState('');
  const [preferredState, setPreferredState] = useState('');
  const [preferredExam, setPreferredExam] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Options Definitions
  const educationOptions = [
    { value: 'Class 12', label: 'Class 12th', icon: '🏫' },
    { value: 'Diploma', label: 'Diploma / Polytechnic', icon: '⚙️' },
    { value: 'Undergraduate', label: 'Undergraduate Student', icon: '🎓' },
    { value: 'Graduate', label: 'Graduate Student', icon: '🔬' }
  ];

  const branchOptions = [
    { value: 'Computer Science', label: 'Computer Science (CSE)', icon: '💻' },
    { value: 'Electronics', label: 'Electronics (ECE)', icon: '📡' },
    { value: 'Mechanical', label: 'Mechanical Eng.', icon: '🔧' },
    { value: 'Electrical', label: 'Electrical Eng.', icon: '⚡' },
    { value: 'Civil', label: 'Civil Eng.', icon: '🏗️' },
    { value: 'Chemical', label: 'Chemical Eng.', icon: '🧪' }
  ];

  const stateOptions = [
    { value: 'Maharashtra', label: 'Maharashtra', icon: '🚩' },
    { value: 'Karnataka', label: 'Karnataka', icon: '🌴' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu', icon: '🏛️' },
    { value: 'Delhi', label: 'Delhi / NCR', icon: '🗼' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh', icon: '🕌' },
    { value: 'West Bengal', label: 'West Bengal', icon: '🌾' }
  ];

  const examOptions = [
    { value: 'JEE Main', label: 'JEE Main', icon: '✏️' },
    { value: 'JEE Advanced', label: 'JEE Advanced', icon: '🚀' },
    { value: 'GATE', label: 'GATE', icon: '🔬' },
    { value: 'CAT', label: 'CAT', icon: '📊' },
    { value: 'CUET', label: 'CUET', icon: '📖' },
    { value: 'NEET', label: 'NEET', icon: '🩺' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        education_level: educationLevel || null,
        preferred_branch: preferredBranch || null,
        preferred_state: preferredState || null,
        preferred_exam: preferredExam || null
      })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save preferences');
      return data;
    })
    .then(data => {
      onPreferencesSaved(data.user);
      window.location.hash = '#home';
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  const handleSkip = () => {
    // Navigate home directly without saving or save with null values
    setLoading(true);
    fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        education_level: null,
        preferred_branch: null,
        preferred_state: null,
        preferred_exam: null
      })
    })
    .then(() => {
      window.location.hash = '#home';
    })
    .catch(() => {
      window.location.hash = '#home';
    });
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: 'calc(100vh - 70px)', background: 'radial-gradient(circle at 90% 10%, rgba(124, 58, 237, 0.05) 0%, rgba(37, 99, 235, 0.05) 90%)', display: 'flex', alignItems: 'center' }}>
      <div className="onboarding-container">
        
        {/* Title Block */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '15px' }}>
            <Compass size={36} />
          </div>
          <h1 className="onboarding-title">Personalize Your Search</h1>
          <p className="onboarding-subtitle">
            Tell us about your educational background so we can recommend the best-matching colleges, cutoffs, and placements.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            color: 'var(--chance-reach)',
            background: 'var(--chance-reach-bg)',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius-sm)',
            marginBottom: '25px',
            fontSize: '0.85rem'
          }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Question 1: Education Level */}
          <div className="selection-section">
            <h3 className="selection-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <School size={18} color="var(--primary)" /> 1. What is your current education level?
            </h3>
            <div className="options-grid">
              {educationOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`option-card ${educationLevel === opt.value ? 'selected' : ''}`}
                  onClick={() => setEducationLevel(opt.value)}
                >
                  <span className="option-card-icon">{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question 2: Preferred Branch */}
          <div className="selection-section">
            <h3 className="selection-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--secondary)" /> 2. What is your preferred course / engineering branch?
            </h3>
            <div className="options-grid">
              {branchOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`option-card ${preferredBranch === opt.value ? 'selected' : ''}`}
                  onClick={() => setPreferredBranch(opt.value)}
                >
                  <span className="option-card-icon">{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question 3: Preferred State */}
          <div className="selection-section">
            <h3 className="selection-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#f59e0b" /> 3. Which state do you prefer for college?
            </h3>
            <div className="options-grid">
              {stateOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`option-card ${preferredState === opt.value ? 'selected' : ''}`}
                  onClick={() => setPreferredState(opt.value)}
                >
                  <span className="option-card-icon">{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question 4: Target Entrance Exam */}
          <div className="selection-section">
            <h3 className="selection-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#10b981" /> 4. Which entrance exam did you write or target?
            </h3>
            <div className="options-grid">
              {examOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`option-card ${preferredExam === opt.value ? 'selected' : ''}`}
                  onClick={() => setPreferredExam(opt.value)}
                >
                  <span className="option-card-icon">{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="onboarding-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSkip}
              disabled={loading}
              style={{ padding: '12px 24px' }}
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '12px 30px' }}
            >
              {loading ? 'Saving preferences...' : 'Complete Profile'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
