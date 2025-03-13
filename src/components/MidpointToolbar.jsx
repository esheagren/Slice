import React, { useState } from 'react';
import { findMidpoints } from '../utils/midpointSearch';

const MidpointToolbar = ({ 
  words, 
  serverUrl, 
  setMidpointClusters, 
  setLoading, 
  setError 
}) => {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [recursionDepth, setRecursionDepth] = useState(0);
  const [isComputing, setIsComputing] = useState(false);
  
  const handleSearch = async () => {
    if (!word1 || !word2) {
      setError('Please select two words for midpoint search');
      return;
    }
    
    setIsComputing(true);
    setLoading(true);
    
    try {
      const results = await findMidpoints(word1, word2, recursionDepth, serverUrl);
      
      // Process results for visualization
      const midpointCluster = {
        type: 'midpoint',
        source: {
          word1,
          word2,
          recursionDepth
        },
        words: []
      };
      
      // Add primary midpoint
      const primaryMidpoint = results.primaryMidpoint;
      primaryMidpoint.nearestWords.forEach((item, index) => {
        midpointCluster.words.push({
          word: item.word,
          distance: item.distance,
          isMidpoint: true,
          midpointLevel: 'primary',
          midpointSource: {
            fromWords: [word1, word2],
            theoreticalMidpoint: primaryMidpoint.theoreticalMidpoint,
            isPrimaryResult: index === 0 // Mark the first result as primary
          }
        });
      });
      
      // Add secondary midpoints if available
      if (results.secondaryMidpoints && results.secondaryMidpoints.length > 0) {
        results.secondaryMidpoints.forEach(midpoint => {
          midpoint.nearestWords.forEach((item, index) => {
            midpointCluster.words.push({
              word: item.word,
              distance: item.distance,
              isMidpoint: true,
              midpointLevel: 'secondary',
              midpointSource: {
                fromWords: midpoint.endpoints,
                theoreticalMidpoint: midpoint.theoreticalMidpoint,
                isPrimaryResult: index === 0
              }
            });
          });
        });
      }
      
      // Add tertiary midpoints if available
      if (results.tertiaryMidpoints && results.tertiaryMidpoints.length > 0) {
        results.tertiaryMidpoints.forEach(midpoint => {
          midpoint.nearestWords.forEach((item, index) => {
            midpointCluster.words.push({
              word: item.word,
              distance: item.distance,
              isMidpoint: true,
              midpointLevel: 'tertiary',
              midpointSource: {
                fromWords: midpoint.endpoints,
                theoreticalMidpoint: midpoint.theoreticalMidpoint,
                isPrimaryResult: index === 0
              }
            });
          });
        });
      }
      
      // Update the visualization with the new midpoint cluster
      setMidpointClusters([midpointCluster]);
      
    } catch (error) {
      console.error('Error in midpoint search:', error);
      setError(`Failed to find midpoints: ${error.message || 'Unknown error'}`);
    } finally {
      setIsComputing(false);
      setLoading(false);
    }
  };
  
  return (
    <div className="midpoint-toolbar">
      <div className="midpoint-setup">
        <select 
          className="midpoint-select"
          value={word1}
          onChange={(e) => setWord1(e.target.value)}
        >
          <option value="">Select first word</option>
          {words.map(word => (
            <option key={`w1-${word}`} value={word}>{word}</option>
          ))}
        </select>
        
        <span className="midpoint-connector">and</span>
        
        <select 
          className="midpoint-select"
          value={word2}
          onChange={(e) => setWord2(e.target.value)}
        >
          <option value="">Select second word</option>
          {words.map(word => (
            <option key={`w2-${word}`} value={word}>{word}</option>
          ))}
        </select>
      </div>
      
      <div className="midpoint-options">
        <div className="recursion-label">
          <span>Recursion depth:</span>
          <select 
            className="recursion-select"
            value={recursionDepth}
            onChange={(e) => setRecursionDepth(parseInt(e.target.value))}
          >
            <option value="0">None (direct midpoint only)</option>
            <option value="1">One level (secondary midpoints)</option>
            <option value="2">Two levels (tertiary midpoints)</option>
          </select>
        </div>
        
        <button 
          className="midpoint-search-btn"
          onClick={handleSearch}
          disabled={!word1 || !word2 || isComputing}
        >
          Find Midpoints
        </button>
      </div>
      
      <style jsx>{`
        .midpoint-toolbar {
          background: #1a1a1c;
          border-radius: 8px;
          padding: 12px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .midpoint-setup {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .midpoint-select {
          flex: 1;
          padding: 6px 10px;
          border-radius: 4px;
          background: #2a2a2c;
          color: white;
          border: 1px solid #3a3a3c;
        }
        
        .midpoint-connector {
          color: #aaa;
          font-size: 14px;
        }
        
        .midpoint-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .recursion-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #aaa;
          font-size: 14px;
        }
        
        .recursion-select {
          padding: 6px 10px;
          border-radius: 4px;
          background: #2a2a2c;
          color: white;
          border: 1px solid #3a3a3c;
        }
        
        .midpoint-search-btn {
          padding: 8px 16px;
          border-radius: 4px;
          background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
          color: white;
          border: none;
          font-weight: 500;
          cursor: pointer;
        }
        
        .midpoint-search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default MidpointToolbar;