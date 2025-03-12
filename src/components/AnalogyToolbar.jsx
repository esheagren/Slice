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
  const [results, setResults] = useState([]);
  
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
      const result = await findAnalogy(word1, word2, word3, 5, serverUrl);
      setResults(result.results);
    } catch (error) {
      console.error('Error computing analogy:', error);
      setError('Failed to compute analogy: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsComputing(false);
      setLoading(false);
    }
  };
  
  const addToVisualization = (word) => {
    const result = results.find(r => r.word === word);
    if (!result) return;
    
    const analogyCluster = {
      parent1: word1,
      parent2: word2,
      analogySource: word3,
      isAnalogy: true,
      words: [{
        word: result.word,
        distance: result.distance,
        isAnalogy: true
      }]
    };
    
    // Update the visualization
    setMidpointClusters(clusters => [analogyCluster, ...clusters]);
  };
  
  return (
    <div className="analogy-toolbar">
      <div className="analogy-equation">
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
        
        {results.length > 0 ? (
          <select 
            className="analogy-results-select"
            onChange={(e) => addToVisualization(e.target.value)}
          >
            <option value="">Results</option>
            {results.map((result, index) => (
              <option key={`result-${index}`} value={result.word}>
                {result.word} ({(1 - result.distance).toFixed(2)})
              </option>
            ))}
          </select>
        ) : (
          <span className="analogy-result-placeholder">?</span>
        )}
      </div>
      
      <button 
        className="analogy-compute-button"
        onClick={handleComputeAnalogy}
        disabled={isComputing || !word1 || !word2 || !word3}
      >
        {isComputing ? 'Computing...' : 'Find'}
      </button>
    </div>
  );
};

export default AnalogyToolbar; 