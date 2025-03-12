import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getRandomWords as getRandomCommonWords } from '../data/commonWords';
import { getRandomWords as getRandomEsotericWords } from '../data/esotericWords';

const SuggestedWords = ({ onWordSelect, currentWords, serverUrl, numSuggestions = 8 }) => {
  const [commonSuggestions, setCommonSuggestions] = useState([]);
  const [esotericSuggestions, setEsotericSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate new common word suggestions
  const refreshCommonSuggestions = async () => {
    setLoading(true);
    
    // Get random words from our curated list
    const candidateWords = getRandomCommonWords(numSuggestions * 2, currentWords);
    
    // Check which words exist in the database
    try {
      const validWords = [];
      
      // Check each word against the API
      for (const word of candidateWords) {
        if (validWords.length >= numSuggestions) break;
        
        const response = await axios.post(`${serverUrl}/api/checkWord`, { word });
        if (response.data.data.word.exists) {
          validWords.push(word);
        }
      }
      
      setCommonSuggestions(validWords);
    } catch (error) {
      console.error('Error checking common words:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate new esoteric word suggestions
  const refreshEsotericSuggestions = async () => {
    setLoading(true);
    
    try {
      // Get random words from our esoteric words list
      const candidateWords = getRandomEsotericWords(numSuggestions * 2, currentWords);
      
      const validWords = [];
      
      // Check each word against the API
      for (const word of candidateWords) {
        if (validWords.length >= numSuggestions) break;
        
        const response = await axios.post(`${serverUrl}/api/checkWord`, { word });
        if (response.data.data.word.exists) {
          validWords.push(word);
        }
      }
      
      setEsotericSuggestions(validWords);
    } catch (error) {
      console.error('Error checking esoteric words:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all suggestions
  const refreshAllSuggestions = () => {
    refreshCommonSuggestions();
    refreshEsotericSuggestions();
  };

  // Initial load and refresh when currentWords changes
  useEffect(() => {
    refreshAllSuggestions();
  }, [currentWords, numSuggestions, serverUrl]);

  return (
    <div className="suggested-words-container">
      <div className="suggested-words-header">
        <h3>Suggested Words</h3>
        <button 
          onClick={refreshAllSuggestions} 
          className="refresh-btn"
          title="Get new suggestions"
          disabled={loading}
        >
          {loading ? '⟳' : '↻'}
        </button>
      </div>
      
      <div className="word-section">
        <h4>Common Words</h4>
        <div className="suggested-words-list">
          {commonSuggestions.map((word, index) => (
            <div 
              key={`common-${index}`} 
              className="suggested-word"
              onClick={() => onWordSelect(word)}
            >
              {word}
            </div>
          ))}
          {commonSuggestions.length === 0 && !loading && (
            <div className="empty-message">No common words available</div>
          )}
        </div>
      </div>
      
      <div className="word-section">
        <h4>Esoteric Words</h4>
        <div className="suggested-words-list">
          {esotericSuggestions.map((word, index) => (
            <div 
              key={`esoteric-${index}`} 
              className="suggested-word esoteric"
              onClick={() => onWordSelect(word)}
            >
              {word}
            </div>
          ))}
          {esotericSuggestions.length === 0 && !loading && (
            <div className="empty-message">No esoteric words available</div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .suggested-words-container {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(26, 26, 28, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .suggested-words-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .suggested-words-header h3 {
          font-size: 1rem;
          color: #f8fafc;
          margin: 0;
        }
        
        .word-section {
          margin-bottom: 16px;
        }
        
        .word-section h4 {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 8px 0;
          font-weight: normal;
        }
        
        .refresh-btn {
          background: rgba(255, 157, 66, 0.2);
          color: #FF9D42;
          border: 1px solid rgba(255, 157, 66, 0.3);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s ease;
        }
        
        .refresh-btn:hover:not(:disabled) {
          background: rgba(255, 157, 66, 0.3);
          transform: rotate(180deg);
        }
        
        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .suggested-words-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .suggested-word {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 6px 14px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .suggested-word:hover {
          background: linear-gradient(135deg, rgba(255, 157, 66, 0.1) 0%, rgba(255, 200, 55, 0.1) 100%);
          border-color: rgba(255, 157, 66, 0.3);
          transform: translateY(-2px);
        }
        
        .suggested-word.esoteric {
          background: linear-gradient(135deg, rgba(138, 43, 226, 0.05) 0%, rgba(138, 43, 226, 0.1) 100%);
          border: 1px solid rgba(138, 43, 226, 0.2);
        }
        
        .suggested-word.esoteric:hover {
          background: linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(138, 43, 226, 0.2) 100%);
          border-color: rgba(138, 43, 226, 0.3);
        }
        
        .empty-message {
          color: #64748b;
          font-size: 0.9rem;
          font-style: italic;
          padding: 4px 0;
        }
      `}</style>
    </div>
  );
};

export default SuggestedWords; 