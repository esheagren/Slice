import React from 'react';
import { findMidpointsRecursively } from '../utils/fetchMidpoints';

const Tools = ({ 
  word1, 
  word2, 
  serverUrl,
  recursionDepth, 
  setRecursionDepth, 
  numMidpoints, 
  setNumMidpoints,
  setMidpointClusters,
  setLoading,
  setError,
  loading,
  wordsValid
}) => {
  
  // Handle recursion depth change
  const handleRecursionDepthChange = async (e) => {
    const newDepth = parseInt(e.target.value);
    setRecursionDepth(newDepth);
    
    // If we have valid words, recalculate with new depth
    if (wordsValid && word1 && word2) {
      setLoading(true);
      setMidpointClusters([]); // Clear existing clusters while loading
      
      try {
        // Directly call the API to find midpoints recursively with the new depth
        const clusters = await findMidpointsRecursively(
          word1, 
          word2, 
          1, 
          newDepth,
          numMidpoints,
          serverUrl
        );
        
        console.log(`Recalculated clusters with depth ${newDepth}:`, clusters);
        setMidpointClusters(clusters);
      } catch (error) {
        console.error('Error updating midpoint clusters:', error);
        setError('Failed to update visualization with new recursion depth');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle number of midpoints change
  const handleNumMidpointsChange = async (e) => {
    const newNumMidpoints = parseInt(e.target.value);
    setNumMidpoints(newNumMidpoints);
    
    // If we have valid words, recalculate with new number of midpoints
    if (wordsValid && word1 && word2) {
      setLoading(true);
      setMidpointClusters([]); // Clear existing clusters while loading
      
      try {
        // Directly call the API to find midpoints recursively with the new number of midpoints
        const clusters = await findMidpointsRecursively(
          word1, 
          word2, 
          1, 
          recursionDepth,
          newNumMidpoints,
          serverUrl
        );
        
        console.log(`Recalculated clusters with ${newNumMidpoints} midpoints:`, clusters);
        setMidpointClusters(clusters);
      } catch (error) {
        console.error('Error updating midpoint clusters:', error);
        setError('Failed to update visualization with new number of midpoints');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFindMidpoints = async () => {
    if (wordsValid && word1 && word2) {
      setLoading(true);
      setMidpointClusters([]); // Clear existing clusters while loading
      
      try {
        const clusters = await findMidpointsRecursively(
          word1, 
          word2, 
          1, 
          recursionDepth,
          numMidpoints,
          serverUrl
        );
        
        setMidpointClusters(clusters);
      } catch (error) {
        console.error('Error finding midpoints:', error);
        setError('Failed to find midpoints between the words');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="tools-container">
      <div className="tools-row">
        <button className="tool-button" disabled={!wordsValid || loading}>2D/3D</button>
        <button className="tool-button" disabled={!wordsValid || loading}>Add Neighbors</button>
        <button 
          className="tool-button" 
          onClick={handleFindMidpoints} 
          disabled={!wordsValid || loading}
        >
          Find Midpoints
        </button>
        <button className="tool-button" disabled={!wordsValid || loading}>Scatterplot/Heat Map</button>
      </div>
      
      <div className="tools-row">
        <div className="midpoints-control">
          <label htmlFor="num-midpoints">Cluster Size:</label>
          <input
            type="range"
            id="num-midpoints"
            min="1"
            max="8"
            value={numMidpoints}
            onChange={handleNumMidpointsChange}
            disabled={!wordsValid || loading}
          />
          <span className="midpoints-value">{numMidpoints}</span>
        </div>
        
        <div className="recursion-control">
          <label htmlFor="recursion-depth">Recursive Depth:</label>
          <input
            type="range"
            id="recursion-depth"
            min="1"
            max="3"
            value={recursionDepth}
            onChange={handleRecursionDepthChange}
            disabled={!wordsValid || loading}
          />
          <span className="depth-value">{recursionDepth}</span>
        </div>
      </div>
    </div>
  );
};

export default Tools; 