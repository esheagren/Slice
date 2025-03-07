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