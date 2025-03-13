import React, { useState } from 'react';
import { findMidpoint } from '../api/embedding';

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
  const [useExactSearch, setUseExactSearch] = useState(true);
  
  const handleSearch = async () => {
    if (!word1 || !word2) {
      setError('Please select two words for midpoint search');
      return;
    }
    
    setIsComputing(true);
    setLoading(true);
    
    try {
      const results = await findMidpoint(
        word1, 
        word2, 
        5,
        recursionDepth,
        useExactSearch,
        serverUrl
      );
      
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
            isPrimaryResult: index === 0
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
          <option value="">First word</option>
          {words.map(word => (
            <option key={`w1-${word}`} value={word}>{word}</option>
          ))}
        </select>
        
        <span className="midpoint-connector">→</span>
        
        <select 
          className="midpoint-select"
          value={word2}
          onChange={(e) => setWord2(e.target.value)}
        >
          <option value="">Second word</option>
          {words.map(word => (
            <option key={`w2-${word}`} value={word}>{word}</option>
          ))}
        </select>
        
        <button 
          className="midpoint-search-btn"
          onClick={handleSearch}
          disabled={!word1 || !word2 || isComputing}
        >
          Find
        </button>
      </div>
      
      <div className="midpoint-options">
        <div className="option-group">
          <label className="option-label">Depth:</label>
          <select 
            className="option-select"
            value={recursionDepth}
            onChange={(e) => setRecursionDepth(parseInt(e.target.value))}
          >
            <option value="0">Direct only</option>
            <option value="1">One level</option>
            <option value="2">Two levels</option>
          </select>
        </div>
        
        <div className="option-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={useExactSearch}
              onChange={(e) => setUseExactSearch(e.target.checked)}
            />
            <span className="toggle-text">Exact</span>
          </label>
        </div>
      </div>
      
      <style jsx>{`
        .midpoint-toolbar {
          background: rgba(26, 26, 30, 0.8);
          border-radius: 3px;
          padding: 10px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid rgba(60, 60, 70, 0.5);
        }
        
        .midpoint-setup {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .midpoint-select {
          flex: 1;
          padding: 6px 8px;
          border-radius: 3px;
          background: rgba(30, 30, 34, 0.8);
          color: rgba(240, 240, 245, 0.9);
          border: 1px solid rgba(60, 60, 70, 0.5);
          font-family: sans-serif;
          font-size: 13px;
          transition: all 0.15s ease;
        }
        
        .midpoint-select:hover, .midpoint-select:focus {
          border-color: rgba(80, 80, 90, 0.7);
          outline: none;
        }
        
        .midpoint-connector {
          color: rgba(200, 200, 210, 0.8);
          font-size: 14px;
          font-family: sans-serif;
        }
        
        .midpoint-options {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .option-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .option-label {
          color: rgba(200, 200, 210, 0.8);
          font-size: 13px;
          font-family: sans-serif;
        }
        
        .option-select {
          padding: 4px 6px;
          border-radius: 3px;
          background: rgba(30, 30, 34, 0.8);
          color: rgba(240, 240, 245, 0.9);
          border: 1px solid rgba(60, 60, 70, 0.5);
          font-family: sans-serif;
          font-size: 13px;
          transition: all 0.15s ease;
        }
        
        .option-select:hover, .option-select:focus {
          border-color: rgba(80, 80, 90, 0.7);
          outline: none;
        }
        
        .midpoint-search-btn {
          padding: 6px 12px;
          border-radius: 3px;
          background: rgba(30, 30, 34, 0.9);
          color: rgba(240, 240, 245, 0.9);
          border: 1px solid rgba(60, 60, 70, 0.5);
          font-weight: 400;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: sans-serif;
          font-size: 13px;
        }
        
        .midpoint-search-btn:hover {
          background: rgba(40, 40, 45, 0.9);
          border-color: rgba(80, 80, 90, 0.7);
          color: rgba(255, 255, 255, 1);
        }
        
        .midpoint-search-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .toggle-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }
        
        .toggle-text {
          margin-left: 6px;
          font-size: 13px;
          color: rgba(200, 200, 210, 0.8);
          font-family: sans-serif;
        }
        
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 3px;
          border: 1px solid rgba(60, 60, 70, 0.5);
          background: rgba(30, 30, 34, 0.8);
          position: relative;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        input[type="checkbox"]:checked {
          background: rgba(30, 30, 40, 0.95);
          border-color: rgba(80, 80, 90, 0.7);
        }
        
        input[type="checkbox"]:checked::after {
          content: "✓";
          position: absolute;
          color: rgba(240, 240, 245, 0.9);
          font-size: 10px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        input[type="checkbox"]:hover {
          border-color: rgba(80, 80, 90, 0.7);
        }
      `}</style>
    </div>
  );
};

export default MidpointToolbar;