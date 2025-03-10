import React, { useState, useRef, useEffect } from 'react';

const WordInput = ({ words, setWords, handleSubmit, handleKeyDown, loading }) => {
  const [newWord, setNewWord] = useState('');
  const inputRef = useRef(null);

  const handleNewWordChange = (e) => {
    setNewWord(e.target.value);
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
      <div className="words-list">
        {words.map((word, index) => (
          <div key={index} className="word-tag">
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
        />
      </div>
      
      <style jsx>{`
        .words-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .word-tag {
          display: flex;
          align-items: center;
          background-color: #1e293b;
          border-radius: 16px;
          padding: 4px 12px;
        }
        
        .remove-word-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 16px;
          margin-left: 8px;
          cursor: pointer;
          padding: 0 4px;
        }
        
        .remove-word-btn:hover {
          color: #f87171;
        }
      `}</style>
    </div>
  );
};

export default WordInput; 