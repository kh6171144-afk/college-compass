import React from 'react';
import { MapPin, Trophy, DollarSign, ArrowRightLeft, BookOpen } from 'lucide-react';

export default function CollegeCard({ college, onViewDetails, onCompare, isCompared }) {
  // Format packages nicely
  const formatLPA = (val) => (val ? `${val} LPA` : 'N/A');
  // Format fees nicely
  const formatINR = (val) => (val ? `₹${(val / 100000).toFixed(2)} Lakh/yr` : 'N/A');

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
          <span className="badge badge-blue">{college.type}</span>
          {college.nirf_rank && (
            <span className="badge badge-purple" style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <Trophy size={10} /> NIRF #{college.nirf_rank}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', lineHeight: '1.3' }}>{college.name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '10px' }}>
          <MapPin size={14} />
          <span>{college.city}, {college.state}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
          {college.avg_rating > 0 ? (
            <>
              <span className="star-display" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fbbf24' }}>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </span>
              <strong style={{ color: 'var(--text-primary)' }}>{parseFloat(college.avg_rating).toFixed(1)}</strong>
              <span style={{ color: 'var(--text-muted)' }}>({college.review_count} {college.review_count === 1 ? 'review' : 'reviews'})</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No ratings yet</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Avg Package</span>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>{formatLPA(college.average_package)}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Tuition Fee</span>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{formatINR(college.tuition_fee)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <button 
          className="btn btn-secondary" 
          style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }} 
          onClick={onViewDetails}
        >
          <BookOpen size={14} /> Details
        </button>
        
        <button 
          className={`btn ${isCompared ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 12px' }} 
          onClick={onCompare}
          title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
        >
          <ArrowRightLeft size={14} />
        </button>
      </div>
    </div>
  );
}
