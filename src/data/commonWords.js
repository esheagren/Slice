import words from 'an-array-of-english-words';

// Common words people might want to visualize
const commonCategories = {
  emotions: ["happy", "sad", "angry", "love", "hate", "fear", "joy", "hope", "calm", "worry", "stress"],
  colors: ["red", "blue", "green", "yellow", "black", "white", "purple", "orange", "pink", "brown"],
  animals: ["dog", "cat", "bird", "fish", "lion", "tiger", "bear", "wolf", "horse", "cow", "pig", "sheep"],
  food: ["apple", "bread", "water", "milk", "meat", "fish", "rice", "pasta", "pizza", "cake", "soup"],
  nature: ["tree", "river", "ocean", "mountain", "forest", "sky", "sun", "moon", "star", "cloud", "rain"],
  abstract: ["time", "space", "idea", "mind", "soul", "life", "death", "peace", "war", "truth", "lie"]
};

// Flatten the categories into a single array of common words
const priorityWords = Object.values(commonCategories).flat();

// Filter to words between 3-8 characters for usability
const filteredWords = words.filter(word => 
  word.length >= 3 && 
  word.length <= 8 && 
  !word.includes("'") &&  // Remove words with apostrophes 
  /^[a-z]+$/.test(word)   // Only include lowercase letters (no special chars)
);

// Function to get random words from the list
export const getRandomWords = (count, excludeWords = []) => {
  const excluded = new Set(excludeWords);
  const result = [];
  
  // First try to include some priority words (if not excluded)
  const availablePriorityWords = priorityWords.filter(word => !excluded.has(word));
  const priorityCount = Math.min(Math.floor(count / 2), availablePriorityWords.length);
  
  // Select random priority words
  const shuffledPriority = [...availablePriorityWords].sort(() => 0.5 - Math.random());
  result.push(...shuffledPriority.slice(0, priorityCount));
  
  // Fill the rest with random words from the larger list
  const remainingCount = count - result.length;
  if (remainingCount > 0) {
    const availableWords = filteredWords.filter(word => 
      !excluded.has(word) && !result.includes(word)
    );
    
    for (let i = 0; i < remainingCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      result.push(availableWords[randomIndex]);
      availableWords.splice(randomIndex, 1); // Remove selected word
    }
  }
  
  // Shuffle the final array so priority words are mixed in
  return result.sort(() => 0.5 - Math.random());
}; 