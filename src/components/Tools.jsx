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
              <span className="icon">⊕</span>
              <span className="tooltip-text">
                <p>Finds semantically similar words to your current selection and adds them to your visualization.</p>
              </span>
            </div>
          </button>
          
          {/* Add Ruler Button */}
          <button 
            className={`tool-button ${rulerActive ? 'active' : ''}`} 
            onClick={toggleRuler}
            disabled={!wordsValid || loading || words.length < 2}
            aria-label="Measure Distance"
          >
            <div className="tooltip">
              <span className="icon">📏</span>
              <span className="tooltip-text">
                <p>Measures semantic distance between words using cosine similarity.</p>
              </span>
            </div>
          </button>
          
          {/* Add Analogy Button */}
          <button 
            className={`tool-button ${showAnalogyTool ? 'active' : ''}`}
            onClick={toggleAnalogyTool}
            disabled={!wordsValid || loading || words.length < 3}
            aria-label="Explore Analogies"
            title={words.length < 3 ? "Need at least 3 words for analogies" : "Explore word analogies"}
          >
            <div className="tooltip">
              <span className="icon">🔄</span>
              <span className="tooltip-text">
                <p>Explore analogies between words (e.g., king:queen::man:woman).</p>
              </span>
            </div>
          </button>
          
          {/* Add Midpoint Button */}
          <button 
            className={`tool-button ${showMidpointTool ? 'active' : ''}`}
            onClick={toggleMidpointTool}
            disabled={!wordsValid || loading || words.length < 2}
            aria-label="Find Midpoints"
            title={words.length < 2 ? "Need at least 2 words for midpoints" : "Find midpoints between words"}
          >
            <div className="tooltip">
              <span className="icon">⚬</span>
              <span className="tooltip-text">
                <p>Find words at the midpoint between two selected words.</p>
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
            {viewMode === '2D' ? '3D View' : '2D View'}
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
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #2a2a2c;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          font-size: 18px;
        }
        
        .tool-button:hover {
          background: #3a3a3c;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .tool-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .tooltip {
          position: relative;
          display: inline-block;
        }
        
        .tooltip-text {
          visibility: hidden;
          width: 200px;
          background-color: #333;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 8px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .tooltip-text p {
          margin: 0;
          line-height: 1.4;
        }
        
        .tooltip:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
        
        .view-button {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          background: #2a2a2c;
          color: white;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .view-button:hover {
          background: #3a3a3c;
          transform: translateY(-1px);
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
        }
        
        .view-button:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .tool-button.active {
          background: linear-gradient(135deg, rgba(66, 133, 244, 0.8) 0%, rgba(52, 168, 83, 0.8) 100%);
          transform: translateY(1px);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Tools;