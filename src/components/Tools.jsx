import React from 'react';
import { findMidpointsRecursively } from '../utils/fetchMidpoints';

const Tools = ({ 
  words, 
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
    if (wordsValid && words.length >= 2) {
      setLoading(true);
      setMidpointClusters([]); // Clear existing clusters while loading
      
      try {
        // Create all possible pairs of words
        const wordPairs = createWordPairs(words);
        
        // Find midpoints for each pair
        const allClusters = [];
        for (const pair of wordPairs) {
          const clusters = await findMidpointsRecursively(
            pair[0], 
            pair[1], 
            1, 
            newDepth,
            numMidpoints,
            serverUrl
          );
          allClusters.push(...clusters);
        }
        
        console.log(`Recalculated clusters with depth ${newDepth}:`, allClusters);
        setMidpointClusters(allClusters);
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
    if (wordsValid && words.length >= 2) {
      setLoading(true);
      setMidpointClusters([]); // Clear existing clusters while loading
      
      try {
        // Create all possible pairs of words
        const wordPairs = createWordPairs(words);
        
        // Find midpoints for each pair
        const allClusters = [];
        for (const pair of wordPairs) {
          const clusters = await findMidpointsRecursively(
            pair[0], 
            pair[1], 
            1, 
            recursionDepth,
            newNumMidpoints,
            serverUrl
          );
          allClusters.push(...clusters);
        }
        
        console.log(`Recalculated clusters with ${newNumMidpoints} midpoints:`, allClusters);
        setMidpointClusters(allClusters);
      } catch (error) {
        console.error('Error updating midpoint clusters:', error);
        setError('Failed to update visualization with new number of midpoints');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFindMidpoints = async () => {
    if (wordsValid && words.length >= 2) {
      setLoading(true);
      setMidpointClusters([]); // Clear existing clusters while loading
      
      try {
        // Create all possible pairs of words
        const wordPairs = createWordPairs(words);
        
        // Find midpoints for each pair
        const allClusters = [];
        for (const pair of wordPairs) {
          const clusters = await findMidpointsRecursively(
            pair[0], 
            pair[1], 
            1, 
            recursionDepth,
            numMidpoints,
            serverUrl
          );
          allClusters.push(...clusters);
        }
        
        setMidpointClusters(allClusters);
      } catch (error) {
        console.error('Error finding midpoints:', error);
        setError('Failed to find midpoints between the words');
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
      <div className="tools-row">
        <button className="tool-button" disabled={!wordsValid || loading}>2D/3D</button>
        <button className="tool-button" disabled={!wordsValid || loading}>Add Neighbors</button>
        <button 
          className="tool-button" 
          onClick={handleFindMidpoints} 
          disabled={!wordsValid || words.length < 2 || loading}
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
            disabled={!wordsValid || words.length < 2 || loading}
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
            disabled={!wordsValid || words.length < 2 || loading}
          />
          <span className="depth-value">{recursionDepth}</span>
        </div>
      </div>
    </div>
  );
};

export default Tools; 