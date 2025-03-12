import React, { useState, useEffect } from 'react';
import { findAnalogy } from '../utils/findAnalogy';
import './AnalogyModal.css';

const AnalogyModal = ({ 
  words, 
  serverUrl, 
  onClose, 
  setMidpointClusters,
  setLoading,
  setError
}) => {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [word3, setWord3] = useState('');
  const [analogyResults, setAnalogyResults] = useState([]);
  const [isComputing, setIsComputing] = useState(false);
  const [selectedResults, setSelectedResults] = useState([]);
  
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
    setAnalogyResults([]);
    
    try {
      const result = await findAnalogy(word1, word2, word3, 10, serverUrl);
      setAnalogyResults(result.results);
      
      // Clear any previous selections
      setSelectedResults([]);
    } catch (error) {
      console.error('Error computing analogy:', error);
      setError('Failed to compute analogy: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsComputing(false);
      setLoading(false);
    }
  };
  
  const toggleResultSelection = (result) => {
    const isSelected = selectedResults.some(item => item.word === result.word);
    
    if (isSelected) {
      setSelectedResults(selectedResults.filter(item => item.word !== result.word));
    } else {
      setSelectedResults([...selectedResults, result]);
    }
  };
  
  const addToVisualization = () => {
    if (selectedResults.length === 0) {
      // If nothing explicitly selected, use the top result
      if (analogyResults.length > 0) {
        addAnalogyToVisualization([analogyResults[0]]);
      }
    } else {
      addAnalogyToVisualization(selectedResults);
    }
  };
  
  const addAnalogyToVisualization = (results) => {
    const analogyCluster = {
      parent1: word1,
      parent2: word2,
      analogySource: word3,
      isAnalogy: true,
      words: results.map(item => ({
        word: item.word,
        distance: item.distance,
        isAnalogy: true
      }))
    };
    
    // Update the visualization
    setMidpointClusters(clusters => [analogyCluster, ...clusters]);
    
    // Optionally close the modal
    // onClose();
  };
  
  return (
    <div className="analogy-modal-overlay" onClick={onClose}>
      <div className="analogy-modal-content" onClick={e => e.stopPropagation()}>
        <div className="analogy-modal-header">
          <h2>Word Analogy Explorer</h2>
          <button className="analogy-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="analogy-modal-body">
          <div className="analogy-explanation">
            <p>Find relationships between words based on vector arithmetic</p>
            <p className="analogy-example">Example: <em>king - man + woman = queen</em></p>
          </div>
          
          <div className="analogy-form">
            <div className="analogy-formula">
              <div className="analogy-pair">
                <select 
                  value={word1} 
                  onChange={(e) => setWord1(e.target.value)}
                  disabled={isComputing}
                  className="analogy-select"
                >
                  <option value="">Select first word</option>
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
                  <option value="">Select second word</option>
                  {words.map((word, index) => (
                    <option key={`w2-${index}`} value={word}>{word}</option>
                  ))}
                </select>
              </div>
              
              <span className="analogy-as">as</span>
              
              <div className="analogy-pair">
                <select 
                  value={word3} 
                  onChange={(e) => setWord3(e.target.value)}
                  disabled={isComputing}
                  className="analogy-select"
                >
                  <option value="">Select third word</option>
                  {words.map((word, index) => (
                    <option key={`w3-${index}`} value={word}>{word}</option>
                  ))}
                </select>
                <span className="analogy-connector">is to</span>
                <span className="analogy-result">?</span>
              </div>
            </div>
            
            <button 
              className="analogy-compute-button"
              onClick={handleComputeAnalogy}
              disabled={isComputing || !word1 || !word2 || !word3}
            >
              {isComputing ? 'Computing...' : 'Find Analogy'}
            </button>
          </div>
          
          {analogyResults.length > 0 && (
            <div className="analogy-results-container">
              <h3>Results for {word1}:{word2}::{word3}:?</h3>
              
              <div className="analogy-results-list">
                {analogyResults.map((result, index) => {
                  const isSelected = selectedResults.some(item => item.word === result.word);
                  return (
                    <div 
                      key={index} 
                      className={`analogy-result-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleResultSelection(result)}
                    >
                      <div className="analogy-result-rank">{index + 1}</div>
                      <div className="analogy-result-word">{result.word}</div>
                      <div className="analogy-result-score">{(1 - result.distance).toFixed(3)}</div>
                      <div className="analogy-result-check">
                        {isSelected && <span>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="analogy-actions">
                <span className="analogy-selection-hint">
                  {selectedResults.length > 0 
                    ? `${selectedResults.length} result${selectedResults.length > 1 ? 's' : ''} selected` 
                    : 'Click results to select them'}
                </span>
                <button 
                  className="analogy-add-button"
                  onClick={addToVisualization}
                  disabled={analogyResults.length === 0}
                >
                  Add to Visualization
                </button>
              </div>
            </div>
          )}
          
          {analogyResults.length === 0 && !isComputing && (
            <div className="analogy-placeholder">
              <p>Select three words and click "Find Analogy" to explore word relationships</p>
              <div className="analogy-vector-equation">
                <span className="analogy-vector-term">{word2 || 'B'}</span>
                <span className="analogy-vector-operator">−</span>
                <span className="analogy-vector-term">{word1 || 'A'}</span>
                <span className="analogy-vector-operator">+</span>
                <span className="analogy-vector-term">{word3 || 'C'}</span>
                <span className="analogy-vector-operator">=</span>
                <span className="analogy-vector-term">?</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalogyModal; 