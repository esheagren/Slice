import React, { useState } from 'react';
import axios from 'axios';
import VectorGraph from './VectorGraph';

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
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.error || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };
  
  const findMidpointWords = async () => {
    if (!response || !response.data.word1.exists || !response.data.word2.exists) {
      setError('Both words must exist in the embeddings to find midpoint words');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const serverUrl = 'http://localhost:5001'; // Adjust port if needed
      const result = await axios.post(`${serverUrl}/api/findMidpointWords`, {
        word1: formData.word1,
        word2: formData.word2,
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
    <div className="home-container">
      <h1>Word Vector Explorer</h1>
      <p>Enter two words to visualize their vector relationship</p>
      
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              id="word1"
              name="word1"
              value={formData.word1}
              onChange={handleChange}
              placeholder="Enter first word"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              id="word2"
              name="word2"
              value={formData.word2}
              onChange={handleChange}
              placeholder="Enter second word"
              required
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Analyze'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {response && (
        <div className="response-container">
          <h3>Results:</h3>
          <p className="response-message">{response.message}</p>
          
          {response.data.word1.exists && response.data.word2.exists && (
            <button 
              onClick={findMidpointWords} 
              className="midpoint-btn"
              disabled={loading}
            >
              Find Words Near Midpoint
            </button>
          )}
          
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
          
          {midpointWords && (
            <div className="midpoint-words">
              <h4>Words near the midpoint:</h4>
              <ul className="word-list">
                {midpointWords.nearestWords.map((item, index) => (
                  <li key={index} className="word-item">
                    <span className="word-text">{item.word}</span>
                    <span className="word-distance">(Distance: {item.distance.toFixed(4)})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <VectorGraph 
        word1={formData.word1}
        word2={formData.word2}
        midpointWords={midpointWords?.nearestWords}
      />
    </div>
  );
};

export default HomePage; 