import React from 'react';

const ViewButton = ({ viewMode, setViewMode, disabled }) => {
  // Toggle between 2D and 3D view modes
  const toggleViewMode = () => {
    setViewMode(viewMode === '2D' ? '3D' : '2D');
  };

  return (
    <button 
      className="view-mode-button"
      onClick={toggleViewMode}
      disabled={disabled}
    >
      {viewMode === '2D' ? '3D View' : '2D View'}
      
      <style jsx>{`
        .view-mode-button {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, rgba(255, 157, 66, 0.9) 0%, rgba(255, 200, 55, 0.9) 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          z-index: 100; /* Increased z-index to ensure it's on top */
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          letter-spacing: 0.5px;
          border: none;
          cursor: pointer;
          pointer-events: auto; /* Ensure clicks are captured */
        }
        
        .view-mode-button:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(255, 157, 66, 1) 0%, rgba(255, 200, 55, 1) 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        
        .view-mode-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
        }
        
        .view-mode-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
};

export default ViewButton; 