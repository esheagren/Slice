import React, { useState } from 'react';

// Sample data for demonstrations
const sampleNearestNeighbors = {
  "ocean": ["sea", "water", "lake", "river", "marine", "coastal", "pacific", "atlantic", "underwater", "shore"],
  "computer": ["laptop", "desktop", "pc", "machine", "device", "processor", "hardware", "software", "computing", "system"],
  "happy": ["glad", "pleased", "joyful", "delighted", "cheerful", "content", "joy", "happiness", "smile", "excited"]
};

const sampleMidpoints = {
  "ocean_mountain": ["landscape", "terrain", "valley", "scenic", "wilderness", "nature", "geological", "geography", "environment", "natural"],
  "science_art": ["design", "creative", "innovation", "technique", "concept", "aesthetic", "discipline", "craft", "theory", "experimental"],
  "ancient_modern": ["historical", "contemporary", "traditional", "cultural", "civilization", "heritage", "evolution", "classical", "era", "period"]
};

const sampleAnalogies = {
  "king_queen_man": ["woman", "female", "lady", "girl", "she", "her", "feminine", "maternal", "wife", "daughter"],
  "paris_france_rome": ["italy", "italian", "florence", "milan", "venice", "sicily", "naples", "tuscany", "mediterranean", "european"],
  "good_better_bad": ["worse", "worst", "terrible", "awful", "horrible", "poor", "negative", "inferior", "unpleasant", "disappointing"]
};

const InteractiveExamples = () => {
  const [activeExample, setActiveExample] = useState('nearest');
  const [selectedWord, setSelectedWord] = useState('ocean');
  const [selectedPair, setSelectedPair] = useState('ocean_mountain');
  const [selectedAnalogy, setSelectedAnalogy] = useState('king_queen_man');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState({
    nearest: false,
    midpoint: false,
    analogy: false
  });
  
  const toggleTechnicalDetails = (example) => {
    setShowTechnicalDetails({
      ...showTechnicalDetails,
      [example]: !showTechnicalDetails[example]
    });
  };
  
  const renderNearestNeighbors = () => {
    return (
      <div className="example-section">
        <h3>Nearest Neighbor Search</h3>
        <p>
          Discover words that are semantically similar to a query word. This reveals how 
          the embedding space organizes related concepts.
        </p>
        
        <div className="interactive-demo">
          <div className="demo-controls">
            <label>Select a word:</label>
            <div className="select-container">
              <select 
                value={selectedWord} 
                onChange={(e) => setSelectedWord(e.target.value)}
              >
                <option value="ocean">ocean</option>
                <option value="computer">computer</option>
                <option value="happy">happy</option>
              </select>
            </div>
          </div>
          
          <div className="results-container">
            <h4>Words similar to "{selectedWord}":</h4>
            <div className="word-cloud">
              {sampleNearestNeighbors[selectedWord].map((word, index) => (
                <div 
                  key={index} 
                  className="word-chip"
                  style={{ 
                    opacity: 1 - (index * 0.07),
                    transform: `scale(${1 - (index * 0.03)})`
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button 
          className="technical-details-button"
          onClick={() => toggleTechnicalDetails('nearest')}
        >
          {showTechnicalDetails.nearest ? 'Hide Technical Details' : 'Show Technical Details'}
        </button>
        
        {showTechnicalDetails.nearest && (
          <div className="technical-details">
            <h4>How It Works</h4>
            <p>
              Luminode uses two approaches to find nearest neighbors:
            </p>
            <ol>
              <li>
                <strong>Approximate Nearest Neighbors (ANN):</strong> Uses specialized data structures 
                to quickly find similar words without checking every word in the database. This is 
                implemented using algorithms like Hierarchical Navigable Small Worlds (HNSW) for 
                efficient high-dimensional search.
              </li>
              <li>
                <strong>Exact Search:</strong> Computes the cosine similarity between the query word 
                and every word in the database, then ranks them. This is more precise but computationally 
                intensive for large vocabularies.
              </li>
            </ol>
            <p>
              The similarity between words is measured using cosine similarity, which compares the 
              angle between word vectors rather than their magnitude:
            </p>
            <div className="formula">
              similarity(A, B) = cos(θ) = (A·B) / (||A|| × ||B||)
            </div>
            <p>
              Where A·B is the dot product of the vectors, and ||A|| and ||B|| are their magnitudes.
            </p>
          </div>
        )}
      </div>
    );
  };
  
  const renderMidpointSearch = () => {
    return (
      <div className="example-section">
        <h3>Recursive Midpoint Search</h3>
        <p>
          Explore the semantic space between words to discover concepts that bridge different ideas.
        </p>
        
        <div className="interactive-demo">
          <div className="demo-controls">
            <label>Select word pair:</label>
            <div className="select-container">
              <select 
                value={selectedPair} 
                onChange={(e) => setSelectedPair(e.target.value)}
              >
                <option value="ocean_mountain">ocean + mountain</option>
                <option value="science_art">science + art</option>
                <option value="ancient_modern">ancient + modern</option>
              </select>
            </div>
          </div>
          
          <div className="results-container">
            <h4>Words at the midpoint between "{selectedPair.replace('_', ' and ')}":</h4>
            <div className="word-cloud">
              {sampleMidpoints[selectedPair].map((word, index) => (
                <div 
                  key={index} 
                  className="word-chip"
                  style={{ 
                    opacity: 1 - (index * 0.07),
                    transform: `scale(${1 - (index * 0.03)})`
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button 
          className="technical-details-button"
          onClick={() => toggleTechnicalDetails('midpoint')}
        >
          {showTechnicalDetails.midpoint ? 'Hide Technical Details' : 'Show Technical Details'}
        </button>
        
        {showTechnicalDetails.midpoint && (
          <div className="technical-details">
            <h4>How It Works</h4>
            <p>
              The midpoint search works by:
            </p>
            <ol>
              <li>
                <strong>Vector averaging:</strong> Computing the average of the word vectors 
                (e.g., (vector_ocean + vector_mountain) / 2)
              </li>
              <li>
                <strong>Similarity search:</strong> Finding words whose vectors are closest to 
                this average vector
              </li>
              <li>
                <strong>Recursive exploration:</strong> Allowing users to continue exploring by 
                selecting new midpoints between results
              </li>
            </ol>
            <p>
              This technique reveals words that represent a blend of the input concepts, often 
              showing surprising connections or bridging concepts that might not be immediately 
              obvious.
            </p>
            <p>
              Mathematically, for words A and B with embedding vectors V<sub>A</sub> and V<sub>B</sub>:
            </p>
            <div className="formula">
              V<sub>midpoint</sub> = (V<sub>A</sub> + V<sub>B</sub>) / 2
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderAnalogies = () => {
    return (
      <div className="example-section">
        <h3>Word Analogies</h3>
        <p>
          Explore how word embeddings can solve analogy problems like "king is to queen as man is to ___?"
        </p>
        
        <div className="interactive-demo">
          <div className="demo-controls">
            <label>Select analogy:</label>
            <div className="select-container">
              <select 
                value={selectedAnalogy} 
                onChange={(e) => setSelectedAnalogy(e.target.value)}
              >
                <option value="king_queen_man">king : queen :: man : ?</option>
                <option value="paris_france_rome">paris : france :: rome : ?</option>
                <option value="good_better_bad">good : better :: bad : ?</option>
              </select>
            </div>
          </div>
          
          <div className="results-container">
            <h4>Completing the analogy "{selectedAnalogy.replace(/_/g, ' : ').replace(/: ([^:]+)$/, ' : ?')}":</h4>
            <div className="word-cloud">
              {sampleAnalogies[selectedAnalogy].map((word, index) => (
                <div 
                  key={index} 
                  className="word-chip"
                  style={{ 
                    opacity: 1 - (index * 0.07),
                    transform: `scale(${1 - (index * 0.03)})`
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button 
          className="technical-details-button"
          onClick={() => toggleTechnicalDetails('analogy')}
        >
          {showTechnicalDetails.analogy ? 'Hide Technical Details' : 'Show Technical Details'}
        </button>
        
        {showTechnicalDetails.analogy && (
          <div className="technical-details">
            <h4>How It Works</h4>
            <p>
              Word analogies are solved using vector arithmetic. For the analogy "A is to B as C is to D", 
              we can find D using:
            </p>
            <div className="formula">
              V<sub>D</sub> ≈ V<sub>B</sub> - V<sub>A</sub> + V<sub>C</sub>
            </div>
            <p>
              For example, to solve "king : queen :: man : ?":
            </p>
            <div className="formula">
              V<sub>?</sub> ≈ V<sub>queen</sub> - V<sub>king</sub> + V<sub>man</sub>
            </div>
            <p>
              This works because the vector difference between related pairs (like king and queen) 
              often captures the relationship between them (in this case, a gender relationship). 
              Adding this difference to another word (man) shifts it in the same way, resulting in 
              the analogous word (woman).
            </p>
            <p>
              This remarkable property of word embeddings was one of the early discoveries that 
              demonstrated how these models capture meaningful semantic relationships.
            </p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="interactive-examples">
      <h2>Try Luminode's Core Features</h2>
      <p>
        Explore these interactive examples to get a taste of what Luminode can do. 
        Each example demonstrates a key functionality of the full application.
      </p>
      
      <div className="example-tabs">
        <button 
          className={`example-tab ${activeExample === 'nearest' ? 'active' : ''}`}
          onClick={() => setActiveExample('nearest')}
        >
          Nearest Neighbors
        </button>
        <button 
          className={`example-tab ${activeExample === 'midpoint' ? 'active' : ''}`}
          onClick={() => setActiveExample('midpoint')}
        >
          Midpoint Search
        </button>
        <button 
          className={`example-tab ${activeExample === 'analogy' ? 'active' : ''}`}
          onClick={() => setActiveExample('analogy')}
        >
          Word Analogies
        </button>
      </div>
      
      <div className="example-content">
        {activeExample === 'nearest' && renderNearestNeighbors()}
        {activeExample === 'midpoint' && renderMidpointSearch()}
        {activeExample === 'analogy' && renderAnalogies()}
      </div>
      
      <div className="try-full-app">
        <p>
          These examples use pre-computed results for demonstration. 
          Try the full Luminode application to explore thousands of words and create your own visualizations!
        </p>
      </div>
      
      <style jsx>{`
        .interactive-examples {
          margin-bottom: 2rem;
        }
        
        h2 {
          color: #FFA500;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }
        
        h3 {
          color: #FFA500;
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.4rem;
        }
        
        h4 {
          color: #FFA500;
          margin-top: 1rem;
          margin-bottom: 0.8rem;
          font-size: 1.2rem;
        }
        
        p {
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        .example-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 165, 0, 0.3);
          margin-bottom: 1.5rem;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 165, 0, 0.5) transparent;
        }
        
        .example-tab {
          background: transparent;
          border: none;
          color: white;
          padding: 0.75rem 1.25rem;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .example-tab:hover {
          color: #FFA500;
        }
        
        .example-tab.active {
          color: #FFA500;
          font-weight: bold;
        }
        
        .example-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #FFA500;
          border-radius: 3px 3px 0 0;
        }
        
        .example-content {
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        
        .interactive-demo {
          background-color: rgba(26, 26, 46, 0.6);
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        
        .demo-controls {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .select-container {
          position: relative;
          width: 100%;
          max-width: 300px;
        }
        
        select {
          width: 100%;
          padding: 0.5rem;
          background-color: rgba(0, 0, 0, 0.3);
          color: white;
          border: 1px solid rgba(255, 165, 0, 0.5);
          border-radius: 4px;
          appearance: none;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .select-container::after {
          content: '▼';
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #FFA500;
          pointer-events: none;
        }
        
        .results-container {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 1rem;
        }
        
        .word-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .word-chip {
          background-color: rgba(255, 165, 0, 0.2);
          border: 1px solid rgba(255, 165, 0, 0.5);
          border-radius: 20px;
          padding: 0.4rem 0.8rem;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .word-chip:hover {
          background-color: rgba(255, 165, 0, 0.4);
          transform: scale(1.05) !important;
        }
        
        .technical-details-button {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.8);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .technical-details-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 165, 0, 0.5);
          color: #FFA500;
        }
        
        .technical-details {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          border-left: 3px solid #FFA500;
        }
        
        ol {
          margin-left: 1.5rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        li {
          margin-bottom: 0.8rem;
          font-size: 1rem;
        }
        
        .formula {
          font-family: monospace;
          background-color: rgba(0, 0, 0, 0.4);
          padding: 0.8rem;
          border-radius: 4px;
          margin: 1rem 0;
          text-align: center;
          font-size: 1.1rem;
          color: #FFA500;
        }
        
        .try-full-app {
          text-align: center;
          margin-top: 2rem;
          padding: 1rem;
          background-color: rgba(255, 165, 0, 0.1);
          border-radius: 8px;
          border: 1px dashed rgba(255, 165, 0, 0.3);
        }
        
        strong {
          color: #FFA500;
        }
      `}</style>
    </div>
  );
};

export default InteractiveExamples; 