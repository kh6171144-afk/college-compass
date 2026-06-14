import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, TrendingUp, Users, ShieldCheck, GraduationCap } from 'lucide-react';
import CollegeCard from '../components/CollegeCard';

export default function Home({ setCurrentPage, setSelectedCollegeId, compareList, setCompareList }) {
  const [featuredColleges, setFeaturedColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        // Sort by highest average package as featured colleges
        const sorted = [...data].sort((a, b) => (b.average_package || 0) - (a.average_package || 0));
        setFeaturedColleges(sorted.slice(0, 3));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load featured colleges:', err);
        setLoading(false);
      });
  }, []);

  const handleCompareToggle = (college) => {
    setCompareList(prev => {
      const exists = prev.find(c => c.id === college.id);
      if (exists) {
        return prev.filter(c => c.id !== college.id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 colleges at a time.');
        return prev;
      }
      return [...prev, college];
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="hero-badge">
            <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} />
            2026 Admissions Cutoff Predictor Live
          </span>
          <h1>Your Ultimate Guide to <br />Engineering Admissions</h1>
          <p>
            Find eligible engineering branches, compare fees and placement statistics, and predict target IITs, NITs, and state government colleges based on your exam rank.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setCurrentPage('predictor')}>
              Predict My College <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentPage('compare')}>
              Compare Colleges
            </button>
          </div>
        </div>
      </section>

      {/* Feature stats cards */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="grid-cols-3">
            <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.4rem' }}>98%</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Prediction Accuracy Rate</p>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px', background: 'var(--secondary-light)', color: 'var(--secondary)', borderRadius: '50%' }}>
                <Users size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.4rem' }}>50k+</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Engineering Cutoffs Indexed</p>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.4rem' }}>Verified</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Official JoSAA & DTE Data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Exams Grid */}
      <section style={{ padding: '50px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Exams We Predict & Analyze</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            We support multiple national and state engineering entrance exams in India.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { name: 'JEE Main', desc: 'For NITs, IIITs & GFTIs' },
              { name: 'JEE Advanced', desc: 'For Indian Institutes of Technology' },
              { name: 'MHT-CET', desc: 'For COEP, VJTI & Maharashtra' },
              { name: 'KCET', desc: 'For RVCE, BMS & Karnataka' },
              { name: 'EAMCET', desc: 'For TS & AP government colleges' },
              { name: 'WBJEE', desc: 'For Jadavpur, Heritage & West Bengal' },
              { name: 'GUJCET', desc: 'For LDCE, VGEC & Gujarat' },
              { name: 'KEAM', desc: 'For CET Trivandrum & Kerala' },
              { name: 'COMEDK', desc: 'For RVCE, BMS, MSRIT (COMEDK Quota)' },
              { name: 'AEEE', desc: 'For Amrita School of Engineering' }
            ].map((exam, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <GraduationCap size={32} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{exam.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{exam.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Placement Colleges */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="flex-row-center" style={{ marginBottom: '40px' }}>
            <div>
              <h2>Featured Institutions</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Top engineering campuses with exemplary average packages.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => setCurrentPage('search')}>
              Explore All Colleges <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading colleges...
            </div>
          ) : (
            <div className="grid-cols-3">
              {featuredColleges.map(college => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  onViewDetails={() => {
                    setSelectedCollegeId(college.id);
                    setCurrentPage('details');
                  }}
                  onCompare={() => handleCompareToggle(college)}
                  isCompared={!!compareList.find(c => c.id === college.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
