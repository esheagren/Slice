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
 * Perform Principal Component Analysis (PCA) to reduce vectors to 2D
 * @param {number[][]} vectors - Array of vectors to project
 * @returns {number[][]} Array of 2D coordinates
 */
export function performPCA(vectors) {
  if (!vectors || vectors.length === 0) {
    return [];
  }
  
  // Center the data
  const dimensions = vectors[0].length;
  const mean = new Array(dimensions).fill(0);
  
  // Calculate mean for each dimension
  for (const vector of vectors) {
    for (let i = 0; i < dimensions; i++) {
      mean[i] += vector[i] / vectors.length;
    }
  }
  
  // Center the vectors by subtracting the mean
  const centeredVectors = vectors.map(vector => 
    vector.map((val, i) => val - mean[i])
  );
  
  // Calculate covariance matrix (simplified for 2D projection)
  // We'll use the power iteration method to find the top 2 eigenvectors
  
  // Function to multiply a vector by the covariance matrix
  const multiplyByCovariance = (v) => {
    const result = new Array(dimensions).fill(0);
    
    for (const vector of centeredVectors) {
      // Calculate dot product of v and vector
      let dotProduct = 0;
      for (let i = 0; i < dimensions; i++) {
        dotProduct += v[i] * vector[i];
      }
      
      // Add the contribution to the result
      for (let i = 0; i < dimensions; i++) {
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
  
  // Find the first principal component using power iteration
  let pc1 = normalize(Array.from({ length: dimensions }, () => Math.random() - 0.5));
  
  for (let iter = 0; iter < 10; iter++) {
    pc1 = normalize(multiplyByCovariance(pc1));
  }
  
  // Find the second principal component
  // Start with a random vector
  let pc2 = normalize(Array.from({ length: dimensions }, () => Math.random() - 0.5));
  
  // Make pc2 orthogonal to pc1
  for (let iter = 0; iter < 10; iter++) {
    // Apply covariance matrix
    pc2 = multiplyByCovariance(pc2);
    
    // Remove the component along pc1 (Gram-Schmidt)
    const dot = pc2.reduce((sum, val, i) => sum + val * pc1[i], 0);
    pc2 = pc2.map((val, i) => val - dot * pc1[i]);
    
    // Normalize
    pc2 = normalize(pc2);
  }
  
  // Project the original vectors onto the 2D space
  return vectors.map(vector => [
    vector.reduce((sum, val, i) => sum + val * pc1[i], 0),
    vector.reduce((sum, val, i) => sum + val * pc2[i], 0)
  ]);
} 