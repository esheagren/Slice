import axios from 'axios';

/**
 * Adds random context words from the database to provide broader context
 * @param {Array} words - The list of input words (not used directly, but included for consistency)
 * @param {number} count - The number of random words to retrieve
 * @param {string} serverUrl - The URL of the server
 * @returns {Array} - An array containing a single cluster of random words
 */
export const addContext = async (words, count = 50, serverUrl) => {
  try {
    // Get random sample words from the database
    const response = await axios.post(`${serverUrl}/api/getRandomWords`, {
      count: count
    });
    
    // Create a cluster for random sample words
    const contextCluster = {
      parent1: "context_sample",
      parent2: null,
      isContextSample: true,
      words: response.data.data.words.map(word => ({
        word: word,
        isContextSample: true
      }))
    };
    
    return [contextCluster];
  } catch (error) {
    console.error('Error in addContext utility:', error);
    throw error;
  }
};

export default addContext; 