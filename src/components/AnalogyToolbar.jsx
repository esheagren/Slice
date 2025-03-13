import React, { useState, useEffect } from 'react';
import { findAnalogy } from '../utils/findAnalogy';

const AnalogyToolbar = ({ 
  words, 
  serverUrl, 
  setMidpointClusters,
  setLoading,
  setError
}) => {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [word3, setWord3] = useState('');
  const [isComputing, setIsComputing] = useState(false);
  
  // Set initial words if available
  useEffect(() => {
    if (words.length >= 3) {
      setWord1(words[0]);
      setWord2(words[1]);
      setWord3(words[2]);
    } else if (words.length === 2) {
      setWord1(words[0]);
      setWord2(words[1]);
    }
  }, [words]);
  
  const handleComputeAnalogy = async () => {
    if (!word1 || !word2 || !word3) {
      setError('Please select all three words for the analogy');
      return;
    }
    
    setIsComputing(true);
    setLoading(true);
    
    try {
      console.log(`Computing analogy: ${word1} is to ${word2} as ${word3} is to ?`);
      const result = await findAnalogy(word1, word2, word3, 5, serverUrl);
      console.log("Analogy results:", result);
      
      // Process results to ensure they're in the correct format
      const processedResults = result.results.map(r => ({
        word: typeof r.word === 'string' ? r.word : String(r.word),
        distance: typeof r.distance === 'number' ? r.distance : 0
      }));
      
      // Automatically add all results to visualization
      addAnalogyToVisualization(processedResults);
      
    } catch (error) {
      console.error('Error computing analogy:', error);
      setError(`Failed to compute analogy: ${error.message || 'Unknown error'}`);
    } finally {
      setIsComputing(false);
      setLoading(false);
    }
  };
  
  const addAnalogyToVisualization = (results) => {
    // Create a cluster for the analogy results
    const analogyCluster = {
      type: 'analogy',
      source: {
        word1,
        word2,
        word3
      },
      words: results.map(result => ({
        word: result.word,
        distance: result.distance,
        isAnalogy: true,
        analogySource: {
          fromWords: [word1, word2, word3]
        }
      }))
    };
    
    // Update the visualization with the new analogy results
    setMidpointClusters(prevClusters => [analogyCluster, ...prevClusters]);
  };
  
  return (
    <div className="analogy-toolbar">
      <div className="analogy-setup">
        <select 
          value={word1}
          onChange={(e) => setWord1(e.target.value)}
          disabled={isComputing}
          className="analogy-select"
        >
          <option value="">First</option>
          {words.map((word, index) => (
            <option key={`w1-${index}`} value={word}>{word}</option>
          ))}
        </select>
        
        <span className="analogy-connector">→</span>
        
        <select 
          value={word2}
          onChange={(e) => setWord2(e.target.value)}
          disabled={isComputing}
          className="analogy-select"
        >
          <option value="">Second</option>
          {words.map((word, index) => (
            <option key={`w2-${index}`} value={word}>{word}</option>
          ))}
        </select>
        
        <span className="analogy-connector">as</span>
        
        <select 
          value={word3}
          onChange={(e) => setWord3(e.target.value)}
          disabled={isComputing}
          className="analogy-select"
        >
          <option value="">Third</option>
          {words.map((word, index) => (
            <option key={`w3-${index}`} value={word}>{word}</option>
          ))}
        </select>
        
        <span className="analogy-connector">→</span>
        
        <button 
          className="analogy-compute-button"
          onClick={handleComputeAnalogy}
          disabled={isComputing || !word1 || !word2 || !word3}
        >
          Find
        </button>
      </div>
      
      <style jsx>{`
        .analogy-toolbar {
          background: rgba(26, 26, 30, 0.8);
          border-radius: 3px;
          padding: 10px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid rgba(60, 60, 70, 0.5);
        }
        
        .analogy-setup {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .analogy-select {
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
        
        .analogy-select:hover, .analogy-select:focus {
          border-color: rgba(80, 80, 90, 0.7);
          outline: none;
        }
        
        .analogy-connector {
          color: rgba(200, 200, 210, 0.8);
          font-size: 14px;
          font-family: sans-serif;
        }
        
        .analogy-compute-button {
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
        
        .analogy-compute-button:hover {
          background: rgba(40, 40, 45, 0.9);
          border-color: rgba(80, 80, 90, 0.7);
          color: rgba(255, 255, 255, 1);
        }
        
        .analogy-compute-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default AnalogyToolbar; 