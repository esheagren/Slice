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
    
    // Wait for all requests to complete
    const nearestNeighborResults = await Promise.all(nearestNeighborPromises);
    
    // Filter out any failed requests
    const validNeighborClusters = nearestNeighborResults.filter(result => result !== null);
    
    // Return only the neighbor clusters
    return validNeighborClusters;
  } catch (error) {
    console.error('Error in addNeighbors utility:', error);
    throw error;
  }
}; 