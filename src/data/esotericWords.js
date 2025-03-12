import words from 'an-array-of-english-words';

// Filter to words between 3-8 characters for usability
// This helps avoid very short or overly long words
const filteredWords = words.filter(word => 
  word.length >= 3 && 
  word.length <= 8 && 
  !word.includes("'") &&  // Remove words with apostrophes 
  /^[a-z]+$/.test(word)   // Only include lowercase letters (no special chars)
);

// Function to get random words from the list
export const getRandomWords = (count, excludeWords = []) => {
  const available = filteredWords.filter(word => !excludeWords.includes(word));
  const result = [];
  
  // Pick random words
  for (let i = 0; i < count && available.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    result.push(available[randomIndex]);
  }
  
  return result;
};