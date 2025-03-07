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
  const [midpointWords, setMidpointWords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setMidpointWords(null);
    
    try {
      const serverUrl = 'http://localhost:5001'; // Adjust port if needed
      const response = await axios.post(`${serverUrl}/api/submit`, formData);
      console.log('Form submitted successfully:', response.data);
      setResponse(response.data);
      
      // Automatically find midpoint words
      if (response.data.data.word1.exists && response.data.data.word2.exists) {
        await findMidpointWords(formData.word1, formData.word2);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.error || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };
  
  const findMidpointWords = async (word1, word2) => {
    setLoading(true);
    setError(null);
    
    try {
      const serverUrl = 'http://localhost:5001'; // Adjust port if needed
      const result = await axios.post(`${serverUrl}/api/findMidpointWords`, {
        word1: word1,
        word2: word2,
        numNeighbors: 10 // Get 10 nearest neighbors
      });
      
      console.log('Midpoint words found:', result.data);
      setMidpointWords(result.data.data);
    } catch (error) {
      console.error('Error finding midpoint words:', error);
      setError(error.response?.data?.error || 'An error occurred while finding midpoint words');
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
            midpointWords={midpointWords?.nearestWords}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage; 