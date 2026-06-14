import React from 'react';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer({ setCurrentPage }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="logo" style={{ marginBottom: '15px', justifyContent: 'flex-start' }}>
              <GraduationCap size={28} />
              <span style={{ fontSize: '1.25rem' }}>College Compass</span>
            </div>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px', maxWidth: '300px' }}>
              Empowering students in India to find, compare, and get admitted to their dream engineering colleges based on cutoff analysis.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <MapPin size={14} /> <span>Bengaluru, Karnataka, India</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Mail size={14} /> <span>support@collegecompass.in</span>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h3>Features</h3>
            <ul className="footer-links">
              <li><a href="#predictor" onClick={(e) => { e.preventDefault(); setCurrentPage('predictor'); }}>College Predictor</a></li>
              <li><a href="#course" onClick={(e) => { e.preventDefault(); setCurrentPage('course'); }}>Course Predictor</a></li>
              <li><a href="#compare" onClick={(e) => { e.preventDefault(); setCurrentPage('compare'); }}>Compare Colleges</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setCurrentPage('search'); }}>Search Catalog</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Exams Covered</h3>
            <ul className="footer-links">
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setCurrentPage('search'); }}>JEE Main</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setCurrentPage('search'); }}>JEE Advanced</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setCurrentPage('search'); }}>MHT-CET</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setCurrentPage('search'); }}>KCET</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setCurrentPage('search'); }}>AP & TS EAMCET</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Resources & Links</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
              Official admission portals open in new tabs. Use our compare tool to evaluate placements and fees side-by-side.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setCurrentPage('predictor')}
              >
                Start Predicting
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} College Compass. Built for Indian Engineering Candidates. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
