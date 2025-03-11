import React, { useState } from 'react';
import axios from 'axios';
import VectorGraph from './VectorGraph';
import WordInput from './WordInput';
import Tools from './Tools';

const HomePage = () => {
  const [words, setWords] = useState([]);
  const [response, setResponse] = useState(null);
  const [relatedClusters, setRelatedClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverUrl, setServerUrl] = useState('http://localhost:5001');
  const [numNeighbors, setNumNeighbors] = useState(5); // Default to 5 neighbors
  const [viewMode, setViewMode] = useState('2D'); // Default to 2D view

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
          />
          
          <div className="tools-wrapper">
            <Tools
              words={words}
              serverUrl={serverUrl}
              numMidpoints={numNeighbors}
              setNumMidpoints={setNumNeighbors}
              setMidpointClusters={setRelatedClusters}
              setLoading={setLoading}
              setError={setError}
              loading={loading}
              wordsValid={response && response.data && response.data.words && 
                         response.data.words.some(word => word.exists)}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
          
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
          <div className="graph-area">
            <VectorGraph 
              words={words}
              midpointWords={relatedClusters}
              numMidpoints={numNeighbors}
              serverUrl={serverUrl}
              viewMode={viewMode}
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
          gap: 1rem;
        }
        
        .tools-wrapper {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
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
        
        .error-message {
          color: #FF5757;
          padding: 0.5rem;
          background-color: rgba(255, 87, 87, 0.1);
          border-radius: 4px;
          margin-top: 0.5rem;
        }
        
        .response-container {
          margin-top: 0.5rem;
        }
        
        .response-message {
          color: #FFC837;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default HomePage; 