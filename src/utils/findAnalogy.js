import axios from 'axios';

/**
 * Finds words that complete an analogy: word1 is to word2 as word3 is to ?
 * @param {string} word1 - First word in the analogy
 * @param {string} word2 - Second word in the analogy
 * @param {string} word3 - Third word in the analogy
 * @param {number} numResults - Number of results to return
 * @param {string} serverUrl - The URL of the server
 * @returns {Object} - Object containing analogy formula and results
 */
export const findAnalogy = async (word1, word2, word3, numResults = 5, serverUrl) => {
  try {
    console.log(`Sending analogy request to ${serverUrl}/api/findAnalogy`);
    console.log(`Parameters: word1=${word1}, word2=${word2}, word3=${word3}, numResults=${numResults}`);
    
    const response = await axios.post(`${serverUrl}/api/findAnalogy`, {
      word1,
      word2,
      word3,
      numResults
    });
    
    console.log('Received analogy response:', response.data);
    
    return {
      analogy: response.data.data.analogy,
      results: response.data.data.results
    };
  } catch (error) {
    console.error('Error finding analogy:', error);
    throw error;
  }
}; 