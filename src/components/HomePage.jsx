import React, { useState } from 'react';
import axios from 'axios';
import VectorGraph from './VectorGraph';

const HomePage = () => {
  const [formData, setFormData] = useState({
    word1: '',
    word2: ''
  });
  const [response, setResponse] = useState(null);
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
    
    try {
      // Try with the full URL to your server
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
      
      <VectorGraph />
    </div>
  );
};

export default HomePage; 