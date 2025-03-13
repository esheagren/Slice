import axios from 'axios';
import { findNeighbors } from '../api/embedding';

/**
 * Adds neighboring words to the visualization
 * @param {Array} words - The list of input words
 * @param {number} clusterSize - The number of neighbors to find per word
 * @param {string} serverUrl - The URL of the server
 * @param {boolean} useExactSearch - Whether to use exact search for better accuracy
 * @returns {Array} - An array of neighbor clusters
 */
export const addNeighbors = async (words, clusterSize, serverUrl, useExactSearch = true) => {
  try {
    // 1. Find nearest neighbors for each input word using the new API
    const nearestNeighborPromises = words.map(async (word) => {
      try {
        const result = await findNeighbors(word, clusterSize, useExactSearch, serverUrl);
        
        return {
          parent1: word,
          parent2: null, // No second parent for neighbors
          words: result.nearestWords.map(neighbor => ({
            word: neighbor.word,
            distance: neighbor.distance,
            isNeighbor: true,
            neighborOf: word
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