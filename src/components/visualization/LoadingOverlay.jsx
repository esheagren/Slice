import React, { useRef, useEffect, useState } from 'react';
import SimpleLoadingAnimation from './SimpleLoadingAnimation';

const LoadingOverlay = () => {
  const overlayRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!overlayRef.current) return;
    
    // Set initial dimensions
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  const updateDimensions = () => {
    if (!overlayRef.current) return;
    
    setDimensions({
      width: overlayRef.current.clientWidth,
      height: overlayRef.current.clientHeight
    });
  };

  return (
    <div className="loading-overlay" ref={overlayRef}>
      <SimpleLoadingAnimation 
        width={dimensions.width} 
        height={dimensions.height} 
      />
      
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