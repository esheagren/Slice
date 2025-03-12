import React from 'react';
import LoadingAnimation from './LoadingAnimation';

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <LoadingAnimation />
      
      <style jsx>{`
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(26, 26, 46, 0.9);
          z-index: 100;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay; 