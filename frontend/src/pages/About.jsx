import React from 'react';
import { Info, HelpCircle, ShieldAlert, CheckCircle, GraduationCap } from 'lucide-react';

export default function About() {
  return (
    <div className="container" style={{ paddingTop: '40px', minHeight: '80vh', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>About College Compass</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Understanding admissions, cutoffs, and prediction algorithms.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <GraduationCap color="var(--primary)" /> Our Purpose
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
          Every year, millions of high school students in India appear for major engineering entrance exams like 
          JEE Main, JEE Advanced, MHT-CET, KCET, and EAMCET. Sorting through hundreds of colleges, 
          thousands of engineering branches, and shifting annual cutoffs is a daunting task.
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          <strong>College Compass</strong> is built to simplify this transition. By aggregating official cutoff data 
          from JoSAA (for IITs/NITs) and respective State Department of Technical Education (DTE) portals, we offer 
          instant, rank-based eligibility assessments and placement-to-fee comparisons.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>Prediction Methodology</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
          Our system analyzes the closing cutoff ranks from previous rounds of counselling. When a student enters their rank \(R\), we evaluate it against the closing cutoff rank \(C\) of a particular course for their category and label their chances:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '20px 0' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span className="badge badge-green" style={{ flexShrink: 0, marginTop: '2px' }}>Safe</span>
            <div>
              <strong>Formula: \(R \le 0.9 \times C\)</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your rank is significantly better than the previous year's closing cutoff. Admissions in this branch are historically guaranteed.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span className="badge badge-yellow" style={{ flexShrink: 0, marginTop: '2px' }}>Possible</span>
            <div>
              <strong>Formula: \(0.9 \times C &lt; R \le 1.05 \times C\)</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your rank is highly competitive, sitting within a margin of 5% above or 10% below the previous cutoff. High chance of admission.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span className="badge badge-red" style={{ flexShrink: 0, marginTop: '2px' }}>Reach</span>
            <div>
              <strong>Formula: \(1.05 \times C &lt; R \le 1.25 \times C\)</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Stretch target. Your rank is slightly weaker than previous cutoffs, but due to shifting seat preferences or subsequent rounds, you might qualify.
              </p>
            </div>
          </div>
        </div>

        <div 
          style={{ 
            display: 'flex', 
            gap: '10px', 
            backgroundColor: 'var(--primary-light)', 
            padding: '12px 16px', 
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.85rem',
            alignItems: 'center'
          }}
        >
          <Info size={16} color="var(--primary)" />
          <span>Note: Ranks vary yearly based on exam difficulty, total registrations, and seat counts. Predictions are guidance tools and not legal admission confirmations.</span>
        </div>
      </div>
    </div>
  );
}
