import React, { useState } from 'react';
import axios from 'axios';
import VectorGraph from './VectorGraph';
import WordInput from './WordInput';
import Tools from './Tools';
import ViewButton from './ViewButton';
import SuggestedWords from './SuggestedWords';

const HomePage = () => {
  const [words, setWords] = useState([]);
  const [response, setResponse] = useState(null);
  const [relatedClusters, setRelatedClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverUrl, setServerUrl] = useState('http://localhost:5001');
  const [numNeighbors, setNumNeighbors] = useState(5); // Default to 5 neighbors
  const [viewMode, setViewMode] = useState('2D'); // Default to 2D view
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rulerActive, setRulerActive] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const handleWordSelect = (word) => {
    if (!words.includes(word)) {
      const updatedWords = [...words, word];
      setWords(updatedWords);
      
      // Trigger API call to check the word and update visualization
      setLoading(true);
      setError(null);
      
      axios.post(`${serverUrl}/api/checkWord`, { word })
        .then(response => {
          const wordResult = {
            word: word,
            exists: response.data.data.word.exists,
            vector: response.data.data.word.vector
          };
          
          setResponse(prev => ({
            message: `Added word: ${word}`,
            data: {
              words: prev?.data?.words ? [...prev.data.words, wordResult] : [wordResult]
            }
          }));
        })
        .catch(error => {
          console.error('Error checking word:', error);
          setError(error.response?.data?.error || 'An error occurred while processing your request');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div className="app-container">
      
      <div className="main-layout">
        <div className="sidebar">
          <WordInput 
            words={words}
            setWords={setWords}
            serverUrl={serverUrl}
            setResponse={setResponse}
            setLoading={setLoading}
            setError={setError}
            loading={loading}
            setRelatedClusters={setRelatedClusters}
            showWordTags={false}
          />
          
          <div className="compact-suggestions-toggle">
            <button 
              className="small-toggle-btn" 
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
            </button>
          </div>
          
          <div className="words-container">
            {words.length > 0 && (
              <div className="selected-words">
                {words.map((word, index) => (
                  <div key={`word-${index}`} className="word-tag">
                    {word}
                    <button 
                      className="remove-word" 
                      onClick={() => {
                        const newWords = [...words];
                        newWords.splice(index, 1);
                        setWords(newWords);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="sidebar-spacer"></div>
          
          {showSuggestions && (
            <div className="suggestions-wrapper">
              <SuggestedWords 
                onWordSelect={handleWordSelect}
                currentWords={words}
                numSuggestions={8}
                serverUrl={serverUrl}
              />
            </div>
          )}
        </div>
        
        <div className="content-area">
          <div className="tools-bar">
            <Tools
              words={words}
              serverUrl={serverUrl}
              numMidpoints={numNeighbors}
              setMidpointClusters={setRelatedClusters}
              setLoading={setLoading}
              setError={setError}
              loading={loading}
              wordsValid={response && response.data && response.data.words && 
                         response.data.words.some(word => word.exists)}
              viewMode={viewMode}
              setViewMode={setViewMode}
              rulerActive={rulerActive}
              setRulerActive={setRulerActive}
              searchActive={searchActive}
              setSearchActive={setSearchActive}
            />
          </div>
          
          <div className="graph-area">
            <VectorGraph 
              words={words}
              midpointWords={relatedClusters}
              numMidpoints={numNeighbors}
              serverUrl={serverUrl}
              viewMode={viewMode}
              setViewMode={setViewMode}
              rulerActive={rulerActive}
              loading={loading}
              searchActive={searchActive}
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        
        .header {
          padding: 1rem;
        }
        
        .main-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .sidebar {
          width: 300px;
          padding: 1rem;
          overflow-y: auto;
          background-color: #0f0f10;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .compact-suggestions-toggle {
          display: flex;
          justify-content: flex-start;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
        }
        
        .small-toggle-btn {
          background-color: transparent;
          color: #FFC837;
          border: 1px solid #FFC837;
          border-radius: 4px;
          padding: 0.25rem 0.75rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .small-toggle-btn:hover {
          background-color: rgba(255, 200, 55, 0.1);
        }
        
        .words-container {
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 0.5rem;
        }
        
        .selected-words {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .word-tag {
          display: inline-flex;
          align-items: center;
          background-color: #2a2a2c;
          border-radius: 16px;
          padding: 0.25rem 0.75rem;
          font-size: 0.9rem;
        }
        
        .remove-word {
          background: none;
          border: none;
          color: #FF5757;
          margin-left: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .sidebar-spacer {
          min-height: 20px;
          flex-grow: 1;
        }
        
        .suggestions-wrapper {
          margin-top: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .tools-bar {
          padding: 0.5rem 1rem;
          background-color: #0f0f10;
          border-bottom: 1px solid #2a2a2c;
        }
        
        .graph-area {
          flex: 1;
          min-height: 500px;
          position: relative;
          overflow: hidden;
        }
        
        .graph-area > div {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .error-message {
          color: #FF5757;
          padding: 0.5rem;
          background-color: rgba(255, 87, 87, 0.1);
          border-radius: 4px;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default HomePage; 