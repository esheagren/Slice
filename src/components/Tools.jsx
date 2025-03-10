import React from 'react';

const Tools = ({ 
  words, 
  serverUrl,
  numMidpoints, 
  setNumMidpoints,
  setMidpointClusters,
  setLoading,
  setError,
  loading,
  wordsValid
}) => {
  
  // Handle number of neighbors change
  const handleNumNeighborsChange = async (e) => {
    const newNumNeighbors = parseInt(e.target.value);
    setNumMidpoints(newNumNeighbors); // Reusing the existing state variable
  };

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

  const handleAddContext = async () => {
    if (wordsValid && words.length > 0) {
      setLoading(true);
      
      try {
        // Import the addContext utility dynamically
        const { addContext } = await import('../utils/addContext');
        
        // Call the utility function with the current words and settings
        const contextClusters = await addContext(
          words,
          numMidpoints, // Use the current cluster size setting
          serverUrl
        );
        
        // Update the clusters with the context results
        setMidpointClusters(contextClusters);
      } catch (error) {
        console.error('Error adding context:', error);
        setError('Failed to add context');
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper function to create all possible pairs of words
  const createWordPairs = (wordsList) => {
    const pairs = [];
    for (let i = 0; i < wordsList.length; i++) {
      for (let j = i + 1; j < wordsList.length; j++) {
        pairs.push([wordsList[i], wordsList[j]]);
      }
    }
    return pairs;
  };

  return (
    <div className="tools-container">
      <div className="tools-row primary-tools">
        <button className="tool-button" disabled={!wordsValid || loading}>2D/3D</button>
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
        <button className="tool-button" disabled={!wordsValid || loading}>Scatterplot/Heat Map</button>
      </div>
      
      <div className="tools-row secondary-controls">
        <div className="control-group">
          <div className="midpoints-control">
            <label htmlFor="num-midpoints">Cluster Size:</label>
            <input
              type="range"
              id="num-midpoints"
              min="1"
              max="8"
              value={numMidpoints}
              onChange={handleNumNeighborsChange}
              disabled={!wordsValid || loading}
            />
            <span className="control-value">{numMidpoints}</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .tools-container {
          padding: 0.5rem;
        }
        
        .tools-row {
          display: flex;
          margin-bottom: 0.5rem;
        }
        
        .primary-tools {
          justify-content: center;
          gap: 1rem;
        }
        
        .tool-button {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          background-color: #334155;
          color: white;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .tool-button:hover:not(:disabled) {
          background-color: #475569;
        }
        
        .tool-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .secondary-controls {
          margin-top: 0.75rem;
          justify-content: center;
        }
        
        .control-group {
          display: flex;
          gap: 2rem;
          background-color: #1e293b;
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }
        
        .midpoints-control, .recursion-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #94a3b8;
        }
        
        .control-value {
          min-width: 1rem;
          text-align: center;
          font-weight: 500;
          color: #cbd5e1;
        }
        
        input[type="range"] {
          width: 100px;
        }
      `}</style>
    </div>
  );
};

export default Tools; 