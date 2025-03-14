/**
 * Calculate the cosine similarity between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} Cosine similarity (between -1 and 1)
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) {
    return null;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate Euclidean distance between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} Euclidean distance
 */
export function euclideanDistance(a, b) {
  if (!a || !b || a.length !== b.length) {
    return null;
  }
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  
  return Math.sqrt(sum);
}

/**
 * Calculate the midpoint between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number[]} Midpoint vector
 */
export function calculateMidpoint(a, b) {
  if (!a || !b || a.length !== b.length) {
    return null;
  }
  
  return a.map((val, i) => (val + b[i]) / 2);
}

/**
 * Performs Principal Component Analysis (PCA) on a set of vectors
 * @param {number[][]} vectors - Array of vectors to project
 * @param {number} dimensions - Number of dimensions to reduce to (2 or 3)
 * @returns {Object} Object containing the projected coordinates and PCA components
 */
export function performPCA(vectors, dimensions = 2) {
  if (!vectors || vectors.length === 0) {
    return { coordinates: [], components: [] };
  }
  
  // Validate dimensions
  if (dimensions !== 2 && dimensions !== 3) {
    dimensions = 2; // Default to 2D if invalid
  }
  
  // Center the data
  const vectorDimensions = vectors[0].length;
  const mean = new Array(vectorDimensions).fill(0);
  
  // Calculate mean for each dimension
  for (const vector of vectors) {
    for (let i = 0; i < vectorDimensions; i++) {
      mean[i] += vector[i] / vectors.length;
    }
  }
  
  // Center the vectors by subtracting the mean
  const centeredVectors = vectors.map(vector => 
    vector.map((val, i) => val - mean[i])
  );
  
  // Function to multiply a vector by the covariance matrix
  const multiplyByCovariance = (v) => {
    const result = new Array(vectorDimensions).fill(0);
    
    for (const vector of centeredVectors) {
      // Calculate dot product of v and vector
      let dotProduct = 0;
      for (let i = 0; i < vectorDimensions; i++) {
        dotProduct += v[i] * vector[i];
      }
      
      // Add the contribution to the result
      for (let i = 0; i < vectorDimensions; i++) {
        result[i] += dotProduct * vector[i];
      }
    }
    
    return result;
  };
  
  // Normalize a vector
  const normalize = (v) => {
    const norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    return v.map(val => val / norm);
  };
  
  // Find principal components using power iteration
  const principalComponents = [];
  
  // Find each principal component
  for (let pc = 0; pc < dimensions; pc++) {
    // Start with a random vector
    let currentPC = normalize(Array.from({ length: vectorDimensions }, () => Math.random() - 0.5));
    
    // Make orthogonal to previous principal components (Gram-Schmidt)
    for (let iter = 0; iter < 10; iter++) {
      // Apply covariance matrix
      currentPC = multiplyByCovariance(currentPC);
      
      // Make orthogonal to all previous principal components
      for (let prevPC = 0; prevPC < principalComponents.length; prevPC++) {
        const dot = currentPC.reduce((sum, val, i) => sum + val * principalComponents[prevPC][i], 0);
        currentPC = currentPC.map((val, i) => val - dot * principalComponents[prevPC][i]);
      }
      
      // Normalize
      currentPC = normalize(currentPC);
    }
    
    principalComponents.push(currentPC);
  }
  
  // Project the original vectors onto the reduced space
  const projectedVectors = vectors.map(vector => {
    const projection = [];
    for (let pc = 0; pc < dimensions; pc++) {
      projection.push(vector.reduce((sum, val, i) => sum + val * principalComponents[pc][i], 0));
    }
    return projection;
  });
  
  // Return both the coordinates and the components
  return {
    coordinates: projectedVectors,
    components: principalComponents.slice(0, dimensions)
  };
} 