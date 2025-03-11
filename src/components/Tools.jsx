import React, { useState } from 'react';

const Tools = ({ 
  words, 
  serverUrl,
  numMidpoints,
  setMidpointClusters,
  setLoading,
  setError,
  loading,
  wordsValid
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

  return (
    <div className="tools-container">
      <div className="tools-row primary-tools">
        <button 
          className="tool-button" 
          onClick={handleAddNeighbors}
          disabled={!wordsValid || loading}
        >
          Add Neighbors
        </button>
      </div>
      
      <style jsx>{`
        .tools-container {
          padding: 0.75rem;
          background-color: #1a1a1c;
          border-radius: 8px;
          margin-top: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .tools-row {
          display: flex;
          gap: 0.75rem;
        }
        
        .primary-tools {
          justify-content: space-between;
        }
        
        .tool-button {
          flex: 1;
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
      `}</style>
    </div>
  );
};

export default Tools; 