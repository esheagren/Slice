import React from 'react';

const WordInput = ({ formData, handleChange, handleSubmit, loading }) => {
  return (
    <div className="word-input-container">
      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <label htmlFor="word1">First Word</label>
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
        
        <div className="input-row">
          <label htmlFor="word2">Second Word</label>
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
        
        <button type="submit" className="analyze-btn" disabled={loading}>
          {loading ? 'Processing...' : 'Analyze'}
        </button>
      </form>
    </div>
  );
};

export default WordInput; 