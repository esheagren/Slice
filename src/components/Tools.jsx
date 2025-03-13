import React, { useState } from 'react';
import AnalogyToolbar from './AnalogyToolbar';
import MidpointToolbar from './MidpointToolbar';

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
        <div className="left-tools">
          <button 
            className="tool-button" 
            onClick={handleAddNeighbors}
            disabled={!wordsValid || loading}
            aria-label="Add Neighbors"
          >
            <div className="tooltip">
              <span className="icon">+</span>
              <span className="tooltip-text">
                <p>Finds semantically similar words to your current selection</p>
              </span>
            </div>
          </button>
          
          {/* Measure Distance Button */}
          <button 
            className={`tool-button ${rulerActive ? 'active' : ''}`} 
            onClick={toggleRuler}
            disabled={!wordsValid || loading || words.length < 2}
            aria-label="Measure Distance"
          >
            <div className="tooltip">
              <span className="icon">↔</span>
              <span className="tooltip-text">
                <p>Measures semantic distance between words</p>
              </span>
            </div>
          </button>
          
          {/* Analogy Button */}
          <button 
            className={`tool-button ${showAnalogyTool ? 'active' : ''}`}
            onClick={toggleAnalogyTool}
            disabled={!wordsValid || loading || words.length < 3}
            aria-label="Explore Analogies"
            title={words.length < 3 ? "Need at least 3 words for analogies" : "Explore word analogies"}
          >
            <div className="tooltip">
              <span className="icon">≈</span>
              <span className="tooltip-text">
                <p>Explore analogies between words</p>
              </span>
            </div>
          </button>
          
          {/* Midpoint Button */}
          <button 
            className={`tool-button ${showMidpointTool ? 'active' : ''}`}
            onClick={toggleMidpointTool}
            disabled={!wordsValid || loading || words.length < 2}
            aria-label="Find Midpoints"
            title={words.length < 2 ? "Need at least 2 words for midpoints" : "Find midpoints between words"}
          >
            <div className="tooltip">
              <span className="icon">•</span>
              <span className="tooltip-text">
                <p>Find words at the midpoint between two selected words</p>
              </span>
            </div>
          </button>
        </div>
        
        <div className="right-tools">
          <button
            className="view-button"
            onClick={toggleViewMode}
            disabled={loading || !wordsValid || words.length === 0}
          >
            {viewMode === '2D' ? '2D' : '3D'}
          </button>
        </div>
      </div>
      
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
        }
        
        .tools-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        
        .left-tools {
          display: flex;
          gap: 8px;
        }
        
        .right-tools {
          display: flex;
          gap: 8px;
        }
        
        .tool-button {
          width: 32px;
          height: 32px;
          border-radius: 3px;
          background: rgba(30, 30, 34, 0.8);
          color: rgba(240, 240, 245, 0.9);
          border: 1px solid rgba(60, 60, 70, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          font-size: 18px;
          font-family: sans-serif;
        }
        
        .tool-button:hover {
          background: rgba(40, 40, 45, 0.9);
          border-color: rgba(80, 80, 90, 0.7);
          color: rgba(255, 255, 255, 1);
        }
        
        .tool-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .tooltip {
          position: relative;
          display: inline-block;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .tooltip-text {
          visibility: hidden;
          width: 160px;
          background-color: rgba(20, 20, 24, 0.95);
          color: #f0f0f5;
          text-align: left;
          border-radius: 3px;
          padding: 6px 8px;
          position: absolute;
          z-index: 1;
          left: 120%;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0;
          transition: opacity 0.2s;
          font-size: 12px;
          font-family: sans-serif;
          border: 1px solid rgba(80, 80, 90, 0.3);
        }
        
        .tooltip-text::after {
          content: "";
          position: absolute;
          top: 50%;
          right: 100%;
          margin-top: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: transparent rgba(20, 20, 24, 0.95) transparent transparent;
        }
        
        .tooltip-text p {
          margin: 0;
          line-height: 1.3;
        }
        
        .tooltip:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
        
        .view-button {
          padding: 0.4rem 0.6rem;
          border-radius: 3px;
          background: rgba(30, 30, 34, 0.8);
          color: rgba(240, 240, 245, 0.9);
          border: 1px solid rgba(60, 60, 70, 0.5);
          font-weight: 400;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 0.9rem;
          font-family: sans-serif;
        }
        
        .view-button:hover {
          background: rgba(40, 40, 45, 0.9);
          border-color: rgba(80, 80, 90, 0.7);
          color: rgba(255, 255, 255, 1);
        }
        
        .view-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .tool-button.active {
          background: rgba(30, 30, 40, 0.95);
          border-color: rgba(100, 100, 120, 0.8);
          color: rgba(255, 255, 255, 1);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Tools;