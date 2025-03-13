import React, { useState, useEffect } from 'react';
import { findAnalogy } from '../utils/findAnalogy';
import './AnalogyToolbar.css';

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
      setError('Failed to compute analogy: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsComputing(false);
      setLoading(false);
    }
  };
  
  const addAnalogyToVisualization = (results) => {
    if (!results || results.length === 0) return;
    
    console.log(`Adding ${results.length} analogy results to visualization`);
    
    const analogyCluster = {
      type: 'analogy',
      source: {
        word1,
        word2,
        word3
      },
      words: results.map(item => ({
        word: item.word,
        distance: item.distance,
        isAnalogy: true,
        analogySource: {  // Add source information for drawing connections
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
          <option value="">Select</option>
          {words.map((word, index) => (
            <option key={`w1-${index}`} value={word}>{word}</option>
          ))}
        </select>
        
        <span className="analogy-connector">is to</span>
        
        <select 
          value={word2}
          onChange={(e) => setWord2(e.target.value)}
          disabled={isComputing}
          className="analogy-select"
        >
          <option value="">Select</option>
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
          <option value="">Select</option>
          {words.map((word, index) => (
            <option key={`w3-${index}`} value={word}>{word}</option>
          ))}
        </select>
        
        <span className="analogy-connector">is to</span>
        
        <button 
          className="analogy-compute-button"
          onClick={handleComputeAnalogy}
          disabled={isComputing || !word1 || !word2 || !word3}
        >
          {isComputing ? 'Computing...' : 'Find'}
        </button>
      </div>
    </div>
  );
};

export default AnalogyToolbar; 