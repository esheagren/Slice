import axios from 'axios';

/**
 * Adds neighboring words to the visualization
 * @param {Array} words - The list of input words
 * @param {number} clusterSize - The number of neighbors to find per word
 * @param {string} serverUrl - The URL of the server
 * @returns {Array} - An array of neighbor clusters
 */
export const addNeighbors = async (words, clusterSize, serverUrl) => {
  try {
    // 1. Find nearest neighbors for each input word
    const nearestNeighborPromises = words.map(async (word) => {
      try {
        const response = await axios.post(`${serverUrl}/api/findNearestNeighbors`, {
          word,
          numNeighbors: clusterSize
        });
        
        return {
          parent1: word,
          parent2: null, // No second parent for neighbors
          words: response.data.data.nearestWords.map(neighbor => ({
            word: neighbor.word,
            distance: neighbor.distance
          }))
        };
      } catch (error) {
        console.error(`Error finding neighbors for ${word}:`, error);
        return null;
      }
    });
    
    // 2. Get random sample words from the database
    const randomSamplePromise = axios.post(`${serverUrl}/api/getRandomWords`, {
      count: 20 // Request 20 random words
    });
    
    // Wait for all requests to complete
    const [randomSampleResponse, ...nearestNeighborResults] = await Promise.all([
      randomSamplePromise,
      ...nearestNeighborPromises
    ]);
    
    // Filter out any failed requests
    const validNeighborClusters = nearestNeighborResults.filter(result => result !== null);
    
    // Create a cluster for random sample words
    const randomSampleCluster = {
      parent1: "random_sample",
      parent2: null,
      isRandomSample: true,
      words: randomSampleResponse.data.data.words.map(word => ({
        word,
        isRandomSample: true
      }))
    };
    
    // Combine all clusters
    return [...validNeighborClusters, randomSampleCluster];
  } catch (error) {
    console.error('Error in addNeighbors utility:', error);
    throw error;
  }
}; 