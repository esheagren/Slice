import React, { useState } from 'react';
import axios from 'axios';
import VectorGraph from './VectorGraph';
import WordInput from './WordInput';
import Tools from './Tools';
import { findMidpointsRecursively } from '../utils/fetchMidpoints';

const HomePage = () => {
  const [formData, setFormData] = useState({
    word1: '',
    word2: ''
  });
  const [response, setResponse] = useState(null);
  const [midpointClusters, setMidpointClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recursionDepth, setRecursionDepth] = useState(1);
  const [serverUrl, setServerUrl] = useState('http://localhost:5001');
  const [numMidpoints, setNumMidpoints] = useState(5); // Default to 5 midpoints

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${serverUrl}/api/submit`, formData);
      console.log('Form submitted successfully:', response.data);
      setResponse(response.data);
      
      // Removed the automatic midpoint fetching code that was here
      
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
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
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
              word1={formData.word1}
              word2={formData.word2}
              serverUrl={serverUrl}
              recursionDepth={recursionDepth}
              setRecursionDepth={setRecursionDepth}
              numMidpoints={numMidpoints}
              setNumMidpoints={setNumMidpoints}
              setMidpointClusters={setMidpointClusters}
              setLoading={setLoading}
              setError={setError}
              loading={loading}
              wordsValid={response && response.data && response.data.word1 && response.data.word2 && 
                         response.data.word1.exists && response.data.word2.exists}
            />
          </div>
          
          <div className="graph-area">
            <VectorGraph 
              word1={formData.word1}
              word2={formData.word2}
              midpointWords={midpointClusters}
              recursionDepth={recursionDepth}
              numMidpoints={numMidpoints}
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