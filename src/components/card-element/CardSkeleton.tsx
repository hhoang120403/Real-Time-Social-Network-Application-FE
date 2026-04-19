import React from 'react';
import './CardSkeleton.scss';

const CardSkeleton = () => {
  return (
    <div className="card-skeleton-item">
      <div className="card-skeleton-header">
        <div className="skeleton-bg"></div>
        <div className="skeleton-avatar"></div>
      </div>
      <div className="card-skeleton-content">
        <div className="skeleton-name"></div>
        <div className="skeleton-stats">
          <div className="skeleton-stat"></div>
          <div className="skeleton-stat"></div>
          <div className="skeleton-stat"></div>
        </div>
        <div className="skeleton-buttons">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
