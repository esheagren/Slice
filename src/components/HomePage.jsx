import React, { useState } from 'react';
import axios from 'axios';
import VectorGraph from './VectorGraph';

const HomePage = () => {
  const [formData, setFormData] = useState({
    word1: '',
    word2: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/submit', formData);
      console.log('Form submitted successfully:', response.data);
      // Process vector data here
    } catch (error) {
      console.error('Error submitting form:', error);
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
          
          <button type="submit" className="submit-btn">Analyze</button>
        </div>
      </form>
      
      <VectorGraph />
    </div>
  );
};

export default HomePage; 