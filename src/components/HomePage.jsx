import React, { useState } from 'react';
import axios from 'axios';
import VectorGraph from './VectorGraph';
import WordInput from './WordInput';
import Tools from './Tools';
import { findMidpointsRecursively } from '../utils/fetchMidpoints';

const HomePage = () => {
  const [words, setWords] = useState([]);
  const [response, setResponse] = useState(null);
  const [midpointClusters, setMidpointClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recursionDepth, setRecursionDepth] = useState(1);
  const [serverUrl, setServerUrl] = useState('http://localhost:5001');
  const [numMidpoints, setNumMidpoints] = useState(5); // Default to 5 midpoints

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (words.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create an array of promises for each word
      const wordPromises = words.map(word => 
        axios.post(`${serverUrl}/api/checkWord`, { word })
      );
      
      // Wait for all requests to complete
      const responses = await Promise.all(wordPromises);
      
      // Process responses to check if all words exist
      const wordResults = responses.map((response, index) => ({
        word: words[index],
        exists: response.data.data.word.exists,
        vector: response.data.data.word.vector
      }));
      
      // Check if any words don't exist
      const nonExistingWords = wordResults.filter(result => !result.exists)
                                         .map(result => result.word);
      
      let message = '';
      if (nonExistingWords.length > 0) {
        if (nonExistingWords.length === words.length) {
          message = `None of the words were found in the embeddings.`;
        } else {
          message = `The following words were not found in the embeddings: ${nonExistingWords.join(', ')}`;
        }
      } else {
        message = `All words found! Vectors retrieved successfully.`;
      }
      
      setResponse({
        message,
        data: {
          words: wordResults
        }
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.error || 'An error occurred while processing your request');
      setMidpointClusters([]); // Only clear on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Word Vector Explorer</h1>
      </div>
      
      <div className="main-layout">
        <div className="sidebar">
          <WordInput 
            words={words}
            setWords={setWords}
            handleSubmit={handleSubmit}
            handleKeyDown={handleKeyDown}
            loading={loading}
          />
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {response && (
            <div className="response-container">
              <p className="response-message">{response.message}</p>
            </div>
          )}
        </div>
        
        <div className="content-area">
          <div className="tools-area">
            <Tools
              words={words}
              serverUrl={serverUrl}
              recursionDepth={recursionDepth}
              setRecursionDepth={setRecursionDepth}
              numMidpoints={numMidpoints}
              setNumMidpoints={setNumMidpoints}
              setMidpointClusters={setMidpointClusters}
              setLoading={setLoading}
              setError={setError}
              loading={loading}
              wordsValid={response && response.data && response.data.words && 
                         response.data.words.some(word => word.exists)}
            />
          </div>
          
          <div className="graph-area">
            <VectorGraph 
              words={words}
              midpointWords={midpointClusters}
              recursionDepth={recursionDepth}
              numMidpoints={numMidpoints}
              serverUrl={serverUrl}
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
          background-color: #0f172a;
        }
        
        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .tools-area {
          padding: 1rem;
          background-color: #1e293b;
        }
        
        .graph-area {
          flex: 1;
          min-height: 500px; /* Ensure minimum height */
          position: relative;
          overflow: hidden;
        }
        
        /* Make sure the VectorGraph component fills its container */
        .graph-area > div {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default HomePage; 