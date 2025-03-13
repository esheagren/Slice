import React from 'react';

const CoreFunctionalities = () => {
  return (
    <div className="about-section">
      <h2>Core Functionalities</h2>
      <p>
        Luminode offers several powerful tools to help you explore word embeddings and 
        discover semantic relationships:
      </p>

      <h3>Spatial Visualization (2D & 3D)</h3>
      <p>
        Luminode renders word relationships spatially in both 2D and 3D using Principal Component 
        Analysis (PCA). This technique reduces the high-dimensional embedding space (typically 
        300 dimensions) down to 2 or 3 dimensions that you can visualize.
      </p>
      <p>
        This allows you to see at a glance how words cluster together based on meaning, revealing 
        patterns that would be impossible to detect by looking at the raw numbers.
      </p>

      <h3>Nearest Neighbor Search</h3>
      <p>
        Discover words that are semantically similar to your query using two approaches:
      </p>
      <ul>
        <li>
          <strong>Approximate Nearest Neighbors (ANN):</strong> A fast search method that quickly 
          finds similar words, ideal for exploration and discovery.
        </li>
        <li>
          <strong>Exact Search:</strong> A more precise but computationally intensive method that 
          finds the mathematically closest words in the embedding space.
        </li>
      </ul>

      <h3>Recursive Midpoint Search</h3>
      <p>
        This unique feature allows you to explore the "semantic midpoint" between two or more words. 
        By taking cross-sections of the embedding space, you can discover concepts that bridge 
        different ideas or represent a blend of multiple concepts.
      </p>
      <p>
        For example, the midpoint between "ocean" and "mountain" might reveal words related to 
        natural landscapes or geographic features.
      </p>

      <h3>Semantic Distance Measurement</h3>
      <p>
        Luminode includes a "ruler" tool that measures the semantic distance between words using 
        cosine similarity. This mathematical measure reveals how closely related two words are in 
        the embedding space.
      </p>
      <p>
        Words with a cosine similarity close to 1 are very similar in meaning, while those closer 
        to 0 have little semantic relationship.
      </p>

      <h3>Word Analogies</h3>
      <p>
        Explore analogical relationships between words, such as "king is to queen as man is to woman." 
        This functionality demonstrates how word embeddings capture complex linguistic relationships 
        and can be used to solve analogy problems.
      </p>
      <p>
        By manipulating vectors (adding and subtracting word embeddings), Luminode can find words 
        that complete analogies, offering insights into how language models represent relationships.
      </p>

      <style jsx>{`
        .about-section {
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
          margin-top: 1.2rem;
          margin-bottom: 0.8rem;
          font-size: 1.4rem;
        }
        
        p {
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        ul {
          margin-left: 1.5rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        li {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        
        strong {
          color: #FFA500;
        }
      `}</style>
    </div>
  );
};

export default CoreFunctionalities; 