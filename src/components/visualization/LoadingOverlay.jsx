import React from 'react';

const LoadingOverlay = () => (
  <div className="loading-overlay">
    <div className="loading-spinner"></div>
    <p>Loading visualization...</p>
    
    <style jsx>{`
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: rgba(15, 15, 16, 0.9);
        color: white;
        z-index: 10;
        backdrop-filter: blur(4px);
      }
      
      .loading-spinner {
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top: 4px solid #FF9D42;
        border-right: 4px solid #FFC837;
        border-bottom: 4px solid #FF5757;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
        box-shadow: 0 0 20px rgba(255, 157, 66, 0.3);
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingOverlay; 