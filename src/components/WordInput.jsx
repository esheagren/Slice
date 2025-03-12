import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const WordInput = ({ 
  words, 
  setWords, 
  serverUrl, 
  setResponse, 
  setLoading, 
  setError, 
  loading,
  setRelatedClusters,
  showWordTags = true
}) => {
  const [newWord, setNewWord] = useState('');
  const [invalidWords, setInvalidWords] = useState([]);
  const inputRef = useRef(null);

  const handleNewWordChange = (e) => {
    setNewWord(e.target.value);
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
      
      // Update the invalidWords state with the list of non-existing words
      setInvalidWords(nonExistingWords);
      
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
      setRelatedClusters([]); // Only clear on error
    } finally {
      setLoading(false);
    }
  };

  const handleNewWordKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (newWord.trim()) {
        // Add the new word and clear the input
        setWords([...words, newWord.trim()]);
        setNewWord('');
        
        // Trigger submit to update the visualization
        handleSubmit(e);
      }
    }
  };

  // Focus the input field when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Maintain focus after any state changes
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    // Use requestAnimationFrame to ensure focus happens after DOM updates
    requestAnimationFrame(focusInput);
  }, [words, newWord, loading]);

  const removeWord = (indexToRemove) => {
    const updatedWords = words.filter((_, index) => index !== indexToRemove);
    setWords(updatedWords);
    
    // Trigger submit to update the visualization after removing a word
    handleSubmit();
  };

  return (
    <div className="word-input-container">
      <div className="input-row">
        <input
          ref={inputRef}
          type="text"
          id="newWord"
          name="newWord"
          value={newWord}
          onChange={handleNewWordChange}
          onKeyDown={handleNewWordKeyDown}
          placeholder={words.length === 0 ? "Enter words (press Enter after each)" : "Add another word"}
          disabled={loading}
          autoFocus
          className="word-input"
        />
      </div>
      
      {showWordTags && (
        <div className="words-list">
          {words.map((word, index) => (
            <div 
              key={index} 
              className={`word-tag ${invalidWords.includes(word) ? 'invalid-word' : ''}`}
            >
              <span>{word}</span>
              <button 
                type="button" 
                className="remove-word-btn"
                onClick={() => removeWord(index)}
                disabled={loading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .word-input-container {
          margin-bottom: 20px;
        }
        
        .input-row {
          margin-bottom: 16px;
        }
        
        .word-input {
          width: 100%;
          padding: 16px 20px;
          font-size: 18px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(26, 26, 28, 0.8);
          color: #f8fafc;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .word-input:focus {
          border-color: #FF9D42;
          box-shadow: 0 0 0 3px rgba(255, 157, 66, 0.3);
          outline: none;
        }
        
        .word-input::placeholder {
          color: #94a3b8;
        }
        
        .words-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .word-tag {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, rgba(255, 157, 66, 0.2) 0%, rgba(255, 200, 55, 0.2) 100%);
          border: 1px solid rgba(255, 157, 66, 0.3);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .word-tag:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .invalid-word {
          background: linear-gradient(135deg, rgba(255, 87, 87, 0.2) 0%, rgba(255, 120, 120, 0.2) 100%);
          border: 1px solid rgba(255, 87, 87, 0.5);
          color: #FF5757;
        }
        
        .remove-word-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 18px;
          margin-left: 8px;
          cursor: pointer;
          padding: 0 4px;
          transition: all 0.2s ease;
        }
        
        .remove-word-btn:hover {
          color: #FF5757;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default WordInput; 