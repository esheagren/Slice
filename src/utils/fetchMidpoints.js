import axios from 'axios';

export const findMidpointsRecursively = async (
  word1, 
  word2, 
  depth = 1, 
  maxDepth = 1, 
  numNeighbors = 5,
  serverUrl = 'http://localhost:5001'
) => {
  if (depth > maxDepth) return [];
  
  try {
    // Find midpoint words between word1 and word2
    const result = await axios.post(`${serverUrl}/api/findMidpointWords`, {
      word1: word1,
      word2: word2,
      numNeighbors: numNeighbors
    });
    
    console.log(`Midpoint words found between ${word1} and ${word2}:`, result.data);
    
    // Create a cluster for this midpoint
    const cluster = {
      level: depth,
      parent1: word1,
      parent2: word2,
      words: result.data.data.nearestWords
    };
    
    // Create an array to hold all clusters (starting with this one)
    const allClusters = [cluster];
    
    // If we haven't reached max depth, recursively find more midpoints
    if (depth < maxDepth) {
      // Get the primary midpoint word (first word in the nearest words)
      const primaryMidpointWord = result.data.data.nearestWords[0].word;
      
      // Find midpoints between word1 and the primary midpoint
      const subClusters1 = await findMidpointsRecursively(
        word1, 
        primaryMidpointWord, 
        depth + 1, 
        maxDepth,
        numNeighbors,
        serverUrl
      );
      
      // Find midpoints between word2 and the primary midpoint
      const subClusters2 = await findMidpointsRecursively(
        word2, 
        primaryMidpointWord, 
        depth + 1, 
        maxDepth,
        numNeighbors,
        serverUrl
      );
      
      // Add all subclusters to our result
      allClusters.push(...subClusters1, ...subClusters2);
    }
    
    return allClusters;
  } catch (error) {
    console.error(`Error finding midpoints recursively at depth ${depth}:`, error);
    return [];
  }
}; 