import React from 'react';

const VectorGraph = ({ word1, word2, midpointWords }) => {
  // Only render if we have both words and midpoint words
  const hasData = word1 && word2 && midpointWords && midpointWords.length > 0;
  
  return (
    <div className="vector-graph">
      <h2>Vector Visualization</h2>
      {!hasData ? (
        <div className="graph-placeholder">
          <p>Submit two words and find midpoint words to see visualization</p>
        </div>
      ) : (
        <div className="graph-content">
          <div className="vector-line">
            <div className="vector-point start" title={word1}></div>
            
            {/* Render midpoint words */}
            {midpointWords.slice(0, 3).map((item, index) => (
              <div 
                key={index}
                className={`vector-point mid${index+1}`} 
                title={`${item.word} (Distance: ${item.distance.toFixed(4)})`}
                style={{
                  left: `${30 + (index * 15)}%`
                }}
              ></div>
            ))}
            
            <div className="vector-point end" title={word2}></div>
          </div>
          <div className="vector-labels">
            <span className="vector-label start">{word1}</span>
            
            {/* Midpoint word labels */}
            {midpointWords.slice(0, 3).map((item, index) => (
              <span 
                key={index}
                className="vector-label mid" 
                style={{
                  left: `${30 + (index * 15)}%`
                }}
              >
                {item.word}
              </span>
            ))}
            
            <span className="vector-label end">{word2}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VectorGraph; 