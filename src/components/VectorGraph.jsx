import React from 'react';

const VectorGraph = () => {
  return (
    <div className="vector-graph">
      <h2>Vector Visualization</h2>
      <div className="graph-placeholder">
        <div className="graph-content">
          <div className="vector-line">
            <div className="vector-point start" title="Start Point"></div>
            <div className="vector-point mid1" title="Midpoint 1"></div>
            <div className="vector-point mid2" title="Midpoint 2"></div>
            <div className="vector-point end" title="End Point"></div>
          </div>
          <div className="vector-labels">
            <span className="vector-label start">Word 1</span>
            <span className="vector-label end">Word 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorGraph; 