import React, { useState } from 'react';

const Disclaimer = () => {
  const [expandedExample, setExpandedExample] = useState(null);
  
  const toggleExample = (example) => {
    if (expandedExample === example) {
      setExpandedExample(null);
    } else {
      setExpandedExample(example);
    }
  };
  
  return (
    <div className="about-section disclaimer">
      <div className="disclaimer-header">
        <h2>A Note on Limitations</h2>
        <div className="disclaimer-subtitle">
          Understanding the alien nature of machine "understanding"
        </div>
      </div>
      
      <p>
        As you explore Luminode, you may notice that some words appear completely unrelated 
        despite being placed near each other, or that certain relationships seem counterintuitive 
        or even incorrect.
      </p>
      <p>
        This is not a bug, but rather a reminder of the fundamentally <span className="highlight">alien nature</span> of how 
        these systems "understand" language. Word embeddings capture statistical patterns in 
        language use, not human conceptual understanding.
      </p>
      
      <div className="limitations-container">
        <h3>Key Limitations to Keep in Mind</h3>
        
        <div className={`limitation-card ${expandedExample === 'bias' ? 'expanded' : ''}`} onClick={() => toggleExample('bias')}>
          <div className="limitation-header">
            <div className="limitation-icon">B</div>
            <h4>Cultural and Historical Biases</h4>
            <div className="expand-icon">{expandedExample === 'bias' ? '−' : '+'}</div>
          </div>
          <div className="limitation-content">
            <p>
              Embeddings are trained on real-world text that contains biases present in society and history.
              These biases become encoded in the vector space.
            </p>
            {expandedExample === 'bias' && (
              <div className="example-box">
                <div className="example-title">Example:</div>
                <p>
                  Occupation words may show gender biases (e.g., "nurse" might be closer to "woman" than "man"),
                  reflecting statistical patterns in the training data rather than inherent truths.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className={`limitation-card ${expandedExample === 'polysemy' ? 'expanded' : ''}`} onClick={() => toggleExample('polysemy')}>
          <div className="limitation-header">
            <div className="limitation-icon">P</div>
            <h4>Polysemy (Multiple Meanings)</h4>
            <div className="expand-icon">{expandedExample === 'polysemy' ? '−' : '+'}</div>
          </div>
          <div className="limitation-content">
            <p>
              Words with multiple meanings are represented by a single vector, which must somehow
              capture all possible senses of the word.
            </p>
            {expandedExample === 'polysemy' && (
              <div className="example-box">
                <div className="example-title">Example:</div>
                <p>
                  The word "bank" has to represent both "financial institution" and "river bank" in a single vector.
                  This can lead to unexpected placements where "bank" might appear near both "money" and "river".
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className={`limitation-card ${expandedExample === 'reduction' ? 'expanded' : ''}`} onClick={() => toggleExample('reduction')}>
          <div className="limitation-header">
            <div className="limitation-icon">D</div>
            <h4>Dimensionality Reduction</h4>
            <div className="expand-icon">{expandedExample === 'reduction' ? '−' : '+'}</div>
          </div>
          <div className="limitation-content">
            <p>
              Visualizing high-dimensional vectors in 2D or 3D necessarily loses information,
              so some relationships visible in the full embedding space may be obscured.
            </p>
            {expandedExample === 'reduction' && (
              <div className="example-box">
                <div className="example-title">Example:</div>
                <p>
                  Two words might appear far apart in a 2D visualization but could be very close in the
                  original 300-dimensional space along dimensions not captured in the projection.
                </p>
                <div className="visual-hint">
                  Imagine trying to represent a 3D object like a sphere with just a 2D circle —
                  you lose information about depth.
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className={`limitation-card ${expandedExample === 'context' ? 'expanded' : ''}`} onClick={() => toggleExample('context')}>
          <div className="limitation-header">
            <div className="limitation-icon">C</div>
            <h4>Context-Free Representation</h4>
            <div className="expand-icon">{expandedExample === 'context' ? '−' : '+'}</div>
          </div>
          <div className="limitation-content">
            <p>
              Traditional word embeddings don't capture how word meaning changes based on surrounding words.
              Each word has a fixed representation regardless of context.
            </p>
            {expandedExample === 'context' && (
              <div className="example-box">
                <div className="example-title">Example:</div>
                <p>
                  The word "light" has the same vector whether it means "not heavy" or "electromagnetic radiation".
                  More modern language models like BERT and GPT address this limitation with contextual embeddings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="insight-box">
        <h3>The Value of Limitations</h3>
        <p>
          These limitations make Luminode not just a tool for exploring language, but also 
          for understanding the gap between human and machine comprehension. The surprising, 
          unexpected, or seemingly incorrect relationships you discover can be the most 
          enlightening, revealing how differently these systems process meaning compared to 
          human intuition.
        </p>
        <p>
          By exploring these "alien" patterns of understanding, we gain insight into both 
          the power and limitations of computational approaches to language.
        </p>
      </div>

      <style jsx>{`
        .about-section {
          margin-bottom: 2rem;
        }
        
        .disclaimer {
          background-color: rgba(255, 165, 0, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border-left: 4px solid #FFA500;
        }
        
        .disclaimer-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .disclaimer-subtitle {
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }
        
        h2 {
          color: #FFA500;
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.8rem;
        }
        
        h3 {
          color: #FFA500;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-size: 1.4rem;
          text-align: center;
        }
        
        h4 {
          color: #FFA500;
          margin: 0;
          font-size: 1.2rem;
        }
        
        p {
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        .highlight {
          color: #FFA500;
          font-weight: bold;
        }
        
        .limitations-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        .limitation-card {
          background-color: rgba(26, 26, 46, 0.8);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .limitation-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 165, 0, 0.3);
        }
        
        .limitation-card.expanded {
          background-color: rgba(255, 165, 0, 0.1);
          border-color: rgba(255, 165, 0, 0.5);
        }
        
        .limitation-header {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .limitation-card.expanded .limitation-header {
          border-bottom-color: rgba(255, 165, 0, 0.3);
        }
        
        .limitation-icon {
          width: 36px;
          height: 36px;
          background-color: rgba(255, 165, 0, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          color: #FFA500;
          flex-shrink: 0;
        }
        
        .expand-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 165, 0, 0.2);
          border-radius: 50%;
          font-weight: bold;
          color: #FFA500;
          margin-left: auto;
          transition: all 0.3s ease;
        }
        
        .limitation-card.expanded .expand-icon {
          background-color: rgba(255, 165, 0, 0.4);
        }
        
        .limitation-content {
          padding: 1rem;
          transition: all 0.3s ease;
        }
        
        .example-box {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 0.5rem;
          border-left: 3px solid rgba(255, 165, 0, 0.5);
        }
        
        .example-title {
          font-weight: bold;
          color: #FFA500;
          margin-bottom: 0.5rem;
        }
        
        .visual-hint {
          font-style: italic;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 0.5rem;
          font-size: 0.9rem;
          padding: 0.5rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        .insight-box {
          background-color: rgba(255, 165, 0, 0.1);
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 2rem;
          border: 1px dashed rgba(255, 165, 0, 0.5);
        }
        
        .insight-box h3 {
          text-align: left;
          margin-top: 0;
        }
        
        .insight-box p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default Disclaimer; 