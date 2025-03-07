import React, { useState } from 'react';
import axios from 'axios';
import VectorGraph from './VectorGraph';
import WordInput from './WordInput';

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
    setMidpointClusters([]);
    
    try {
      const response = await axios.post(`${serverUrl}/api/submit`, formData);
      console.log('Form submitted successfully:', response.data);
      setResponse(response.data);
      
      // If both words exist, find midpoints recursively
      if (response.data.data.word1.exists && response.data.data.word2.exists) {
        const clusters = await findMidpointsRecursively(
          formData.word1, 
          formData.word2, 
          1, 
          recursionDepth
        );
        
        setMidpointClusters(clusters);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.error || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };
  
  const findMidpointsRecursively = async (word1, word2, depth = 1, maxDepth = recursionDepth) => {
    if (depth > maxDepth) return [];
    
    try {
      // Find midpoint words between word1 and word2
      const result = await axios.post(`${serverUrl}/api/findMidpointWords`, {
        word1: word1,
        word2: word2,
        numNeighbors: 10
      });
      
      console.log(`Midpoint words found between ${word1} and ${word2}:`, result.data);
      
      // Create a cluster for this midpoint
      const cluster = {
        level: depth,
        parent1: word1,
        parent2: word2,
        words: result.data.data.nearestWords
      };
      
      // Create an array to hold all clusters (starting with this one)
      const allClusters = [cluster];
      
      // If we haven't reached max depth, recursively find more midpoints
      if (depth < maxDepth) {
        // Get the primary midpoint word (first word in the nearest words)
        const primaryMidpointWord = result.data.data.nearestWords[0].word;
        
        // Find midpoints between word1 and the primary midpoint
        const subClusters1 = await findMidpointsRecursively(
          word1, 
          primaryMidpointWord, 
          depth + 1, 
          maxDepth
        );
        
        // Find midpoints between word2 and the primary midpoint
        const subClusters2 = await findMidpointsRecursively(
          word2, 
          primaryMidpointWord, 
          depth + 1, 
          maxDepth
        );
        
        // Add all subclusters to our result
        allClusters.push(...subClusters1, ...subClusters2);
      }
      
      return allClusters;
    } catch (error) {
      console.error(`Error finding midpoints recursively at depth ${depth}:`, error);
      return [];
    }
  };
  
  // Handle recursion depth change
  const handleRecursionDepthChange = async (e) => {
    const newDepth = parseInt(e.target.value);
    setRecursionDepth(newDepth);
    
    // If we have valid words, recalculate with new depth
    if (formData.word1 && formData.word2 && 
        response?.data?.word1?.exists && response?.data?.word2?.exists) {
      setLoading(true);
      try {
        const clusters = await findMidpointsRecursively(
          formData.word1, 
          formData.word2, 
          1, 
          newDepth
        );
        setMidpointClusters(clusters);
      } catch (error) {
        console.error('Error updating midpoint clusters:', error);
      } finally {
        setLoading(false);
      }
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
          
          {response && response.data.word1.exists && response.data.word2.exists && (
            <div className="recursion-control">
              <label htmlFor="recursion-depth">Midpoint Recursion Depth:</label>
              <input
                type="range"
                id="recursion-depth"
                min="1"
                max="3"
                value={recursionDepth}
                onChange={handleRecursionDepthChange}
                disabled={loading}
              />
              <span className="depth-value">{recursionDepth}</span>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {response && (
            <div className="response-container">
              <p className="response-message">{response.message}</p>
              
              {response.data.word1.exists && (
                <div className="word-info">
                  <h4>"{formData.word1}" vector:</h4>
                  <p className="vector-preview">{response.data.word1.vector}</p>
                </div>
              )}
              
              {response.data.word2.exists && (
                <div className="word-info">
                  <h4>"{formData.word2}" vector:</h4>
                  <p className="vector-preview">{response.data.word2.vector}</p>
                </div>
              )}
              
              {response.data.midpoint && (
                <div className="word-info">
                  <h4>Midpoint vector:</h4>
                  <p className="vector-preview">{response.data.midpoint}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="graph-area">
          <VectorGraph 
            word1={formData.word1}
            word2={formData.word2}
            midpointWords={midpointClusters}
            recursionDepth={recursionDepth}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage; 