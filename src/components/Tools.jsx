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
  setViewMode
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

  // Add new function to handle the Add Context button click
  const handleAddContext = async () => {
    if (wordsValid && words.length > 0) {
      setLoading(true);
      
      try {
        // Import the addContext utility dynamically
        const { addContext } = await import('../utils/addContext');
        
        // Call the utility function with the current words and settings
        const contextClusters = await addContext(
          words,
          numMidpoints, // Use the current cluster size setting for consistency
          serverUrl
        );
        
        // Update the clusters with the context results
        setMidpointClusters(contextClusters);
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle view mode between 2D and 3D
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
          >
            Add Neighbors
          </button>
          <button 
            className="tool-button" 
            onClick={handleAddContext}
            disabled={!wordsValid || loading}
          >
            Add Context
          </button>
        </div>
        
        <div className="right-tools">
          <button 
            className="view-button"
            onClick={toggleViewMode}
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
        }
        
        .tool-button:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(255, 157, 66, 1) 0%, rgba(255, 200, 55, 1) 100%);
          transform: translateY(-1px);
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
        }
        
        .tool-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .tool-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
      `}</style>
    </div>
  );
};

export default Tools; 