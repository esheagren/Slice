import React, { useState, useEffect } from 'react';
import AnalogyToolbar from './AnalogyToolbar';
import MidpointToolbar from './MidpointToolbar';
import LoadingAnimation from './visualization/LoadingAnimation';

const Tools = ({ 
  words, 
  serverUrl,
  numMidpoints,
  setMidpointClusters,
  setLoading,
  setError,
  loading,
  wordsValid,
  viewMode,
  setViewMode,
  rulerActive,
  setRulerActive
}) => {
  
  const [showAnalogyTool, setShowAnalogyTool] = useState(false);
  const [showMidpointTool, setShowMidpointTool] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const loadingOverlayDimensions = { width: 120, height: 120 };
  
  // Add loading animation after half a second delay
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setShowLoadingAnimation(true);
      }, 500); // 500ms delay
    } else {
      setShowLoadingAnimation(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);
  
  // Add this new function to handle the Add Neighbors button click
  const handleAddNeighbors = async () => {
    if (wordsValid && words.length > 0) {
      setLoading(true);
      
      try {
        // Import the addNeighbors utility dynamically
        const { addNeighbors } = await import('../utils/addNeighbors');
        
        // Call the utility function with the current words and settings
        const neighborClusters = await addNeighbors(
          words,
          numMidpoints, // Use the current cluster size setting
          serverUrl
        );
        
        // Update the clusters with the neighbor results
        setMidpointClusters(neighborClusters);
      } catch (error) {
        console.error('Error adding neighbors:', error);
        setError('Failed to add neighboring words');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const toggleRuler = () => {
    setRulerActive(!rulerActive);
  };
  
  const toggleAnalogyTool = () => {
    setShowAnalogyTool(!showAnalogyTool);
    if (showMidpointTool) setShowMidpointTool(false);
  };
  
  const toggleMidpointTool = () => {
    setShowMidpointTool(!showMidpointTool);
    if (showAnalogyTool) setShowAnalogyTool(false);
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === '2D' ? '3D' : '2D');
  };
  
  return (
    <div className="tools-container">
      <div className="tools-row">
        <div className="section-label explore">EXPLORE</div>
        
        <div className="tools-group explore-group">
          <button 
            className="labeled-button" 
            onClick={handleAddNeighbors}
            disabled={!wordsValid || loading}
            aria-label="Add Neighbors"
            title="Find similar words"
            data-tooltip="Find similar words"
          >
            <span className="button-icon">+</span>
            <span className="button-label">Similar Words</span>
            {loading && <span className="button-loading-indicator"></span>}
          </button>
          
          <button 
            className={`labeled-button ${rulerActive ? 'active' : ''}`} 
            onClick={toggleRuler}
            disabled={!wordsValid || loading || words.length < 2}
            aria-label="Measure Distance"
            title={words.length < 2 ? "Need at least 2 words to measure distance" : "Measure semantic distance"}
            data-tooltip={words.length < 2 ? "Need at least 2 words to measure distance" : "Measure semantic distance"}
          >
            <span className="button-icon">↔</span>
            <span className="button-label">Distance</span>
          </button>
        </div>
        
        <div className="section-divider"></div>
        
        <div className="section-label analyze">ANALYZE</div>
        
        <div className="tools-group analyze-group">
          <button 
            className={`labeled-button ${showMidpointTool ? 'active' : ''}`}
            onClick={toggleMidpointTool}
            disabled={!wordsValid || loading || words.length < 2}
            aria-label="Find Midpoints"
            title={words.length < 2 ? "Need at least 2 words for midpoints" : "Find midpoints between words"}
            data-tooltip={words.length < 2 ? "Need at least 2 words for midpoints" : "Find midpoints between words"}
          >
            <span className="button-icon">•</span>
            <span className="button-label">Midpoints</span>
            {showMidpointTool && loading && <span className="button-loading-indicator"></span>}
          </button>
          
          <button 
            className={`labeled-button ${showAnalogyTool ? 'active' : ''}`}
            onClick={toggleAnalogyTool}
            disabled={!wordsValid || loading || words.length < 3}
            aria-label="Explore Analogies"
            title={words.length < 3 ? "Need at least 3 words for analogies" : "Explore word analogies"}
            data-tooltip={words.length < 3 ? "Need at least 3 words for analogies" : "Explore word analogies"}
          >
            <span className="button-icon">≈</span>
            <span className="button-label">Analogies</span>
            {showAnalogyTool && loading && <span className="button-loading-indicator"></span>}
          </button>
        </div>
        
        <div className="section-divider"></div>
        
        <div className="section-label view">VIEW</div>
        
        <div className="tools-group view-group">
          <button
            className="labeled-button view-button"
            onClick={toggleViewMode}
            disabled={loading || !wordsValid || words.length === 0}
            title={viewMode === '2D' ? "Switch to 3D view" : "Switch to 2D view"}
            data-tooltip={viewMode === '2D' ? "Switch to 3D view" : "Switch to 2D view"}
          >
            <span className="button-label">{viewMode === '2D' ? '2D' : '3D'}</span>
          </button>
        </div>
      </div>
      
      {/* Loading animation overlay */}
      {loading && showLoadingAnimation && (
        <div className="loading-overlay">
          <LoadingAnimation width={loadingOverlayDimensions.width} height={loadingOverlayDimensions.height} />
          <div className="loading-text">Processing...</div>
        </div>
      )}
      
      {/* Analogy Toolbar */}
      {showAnalogyTool && (
        <AnalogyToolbar 
          words={words}
          serverUrl={serverUrl}
          setMidpointClusters={setMidpointClusters}
          setLoading={setLoading}
          setError={setError}
        />
      )}
      
      {/* Midpoint Toolbar */}
      {showMidpointTool && (
        <MidpointToolbar 
          words={words}
          serverUrl={serverUrl}
          setMidpointClusters={setMidpointClusters}
          setLoading={setLoading}
          setError={setError}
        />
      )}
      
      <style jsx>{`
        .tools-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-bottom: 0.75rem;
          position: relative;
        }
        
        .tools-row {
          display: flex;
          width: 100%;
          border-bottom: 1px solid rgba(60, 60, 70, 0.2);
          padding-bottom: 8px;
          align-items: center;
        }
        
        .section-label {
          font-size: 12px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-weight: 500;
          font-family: sans-serif;
          padding: 0 12px;
        }
        
        .section-label.explore {
          color: rgba(66, 133, 244, 0.8);
        }
        
        .section-label.analyze {
          color: rgba(52, 168, 83, 0.8);
        }
        
        .section-label.view {
          color: rgba(180, 180, 190, 0.7);
        }
        
        .section-divider {
          width: 1px;
          height: 24px;
          background: rgba(60, 60, 70, 0.2);
          margin: 0 8px;
        }
        
        .tools-group {
          display: flex;
          align-items: center;
          margin-right: 16px;
          position: relative;
        }
        
        .explore-group .labeled-button {
          border-color: rgba(66, 133, 244, 0.3);
        }
        
        .explore-group .labeled-button:hover {
          border-color: rgba(66, 133, 244, 0.5);
        }
        
        .explore-group .labeled-button.active {
          background: rgba(66, 133, 244, 0.15);
          border-color: rgba(66, 133, 244, 0.5);
        }
        
        .analyze-group .labeled-button {
          border-color: rgba(52, 168, 83, 0.3);
        }
        
        .analyze-group .labeled-button:hover {
          border-color: rgba(52, 168, 83, 0.5);
        }
        
        .analyze-group .labeled-button.active {
          background: rgba(52, 168, 83, 0.15);
          border-color: rgba(52, 168, 83, 0.5);
        }
        
        .view-group {
          margin-left: auto;
          margin-right: 0;
        }
        
        .labeled-button {
          display: flex;
          align-items: center;
          height: 32px;
          padding: 0 12px;
          border-radius: 3px;
          background: rgba(30, 30, 34, 0.4);
          color: rgba(240, 240, 245, 0.9);
          border: 1px solid rgba(60, 60, 70, 0.3);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: sans-serif;
          margin-right: 8px;
          position: relative;
        }
        
        .labeled-button:last-child {
          margin-right: 0;
        }
        
        .labeled-button:hover {
          background: rgba(40, 40, 45, 0.6);
          border-color: rgba(80, 80, 90, 0.5);
          color: rgba(255, 255, 255, 1);
        }
        
        .labeled-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .button-icon {
          font-size: 16px;
          margin-right: 6px;
        }
        
        .button-label {
          font-size: 13px;
          font-weight: 400;
        }
        
        .labeled-button.active {
          background: rgba(30, 30, 40, 0.8);
          border-color: rgba(100, 100, 120, 0.6);
          color: rgba(255, 255, 255, 1);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .view-button {
          min-width: 50px;
          justify-content: center;
        }
        
        /* Button loading indicator */
        .button-loading-indicator {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: rgba(255, 255, 255, 0.9);
          animation: spin 0.8s linear infinite;
          margin-left: 8px;
        }
        
        /* Loading overlay with the LoadingAnimation component */
        .loading-overlay {
          position: absolute;
          top: 42px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 100;
          pointer-events: none;
          background: rgba(20, 20, 24, 0.7);
          border-radius: 8px;
          padding: 10px;
          margin: 0 auto;
          width: fit-content;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(60, 60, 70, 0.3);
        }
        
        .loading-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-family: sans-serif;
          margin-top: 8px;
          font-weight: 500;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Custom tooltip using data-tooltip attribute */
        [data-tooltip] {
          position: relative;
        }
        
        [data-tooltip]:hover::before {
          content: attr(data-tooltip);
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 10px;
          background-color: rgba(255, 255, 255, 0.97);
          color: rgba(10, 10, 12, 0.95);
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          border-radius: 3px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 100;
          pointer-events: none;
          font-family: sans-serif;
          border: 1px solid rgba(200, 200, 210, 0.5);
        }
        
        [data-tooltip]:hover::after {
          content: '';
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: rgba(255, 255, 255, 0.97) transparent transparent transparent;
          z-index: 100;
          pointer-events: none;
        }
        
        /* Hide default browser tooltips */
        [title] {
          position: relative;
        }
        
        /* Prevent the default browser tooltip */
        [title]:hover::before,
        [title]:hover::after {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Tools;