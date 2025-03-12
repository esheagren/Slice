import React from 'react';

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

  // Toggle view mode between 2D and 3D
  const toggleViewMode = () => {
    setViewMode(viewMode === '2D' ? '3D' : '2D');
  };

  // Add this new function to handle the Ruler button click
  const toggleRuler = () => {
    setRulerActive(!rulerActive);
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
      
      <style jsx>{`
        .tools-container {
          width: 100%;
        }
        
        .tools-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .left-tools {
          display: flex;
          gap: 0.75rem;
        }
        
        .right-tools {
          display: flex;
          justify-content: flex-end;
        }
        
        .tool-button {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          background: linear-gradient(135deg, rgba(255, 157, 66, 0.8) 0%, rgba(255, 200, 55, 0.8) 100%);
          color: white;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .icon {
          font-size: 1.5rem;
          display: inline-block;
        }
        
        .tooltip {
          position: relative;
          display: inline-block;
        }
        
        .tooltip-text {
          visibility: hidden;
          width: 220px;
          background-color: #333;
          color: #fff;
          text-align: left;
          border-radius: 6px;
          padding: 10px;
          position: absolute;
          z-index: 1;
          left: 110%;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          font-weight: normal;
          font-size: 0.8rem;
          line-height: 1.3;
        }
        
        .tooltip-text::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #333 transparent transparent transparent;
        }
        
        .tooltip-text p {
          margin: 4px 0 0 0;
          line-height: 1.3;
        }
        
        .tooltip-text strong {
          font-size: 0.85rem;
          display: block;
          margin-bottom: 2px;
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