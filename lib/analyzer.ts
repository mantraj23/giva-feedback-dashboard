// --- 1. EXPANDED DICTIONARY ---
const WORD_SCORES: Record<string, number> = {
  // POSITIVE
  'shiny': 2, 'elegant': 3, 'comfortable': 2, 'premium': 3, 'beautiful': 2, 
  'great': 2, 'love': 3, 'perfect': 3, 'good': 1, 'amazing': 3, 'nice': 2,
  'lustrous': 3, 'sparkle': 2, 'sparkling': 2, 'durable': 2, 'sturdy': 2,
  'classy': 2, 'delicate': 1, 'intricate': 2, 'smooth': 1, 'gift': 1,
  'worth': 2, 'timeless': 3, 'stunning': 3, 'authentic': 2, 'awesome': 3,
  'excellent': 3, 'fantastic': 3, 'fast': 2, 'quick': 2, 'helpful': 2,
  'best': 3, 'happy': 2, 'satisfied': 2, 'impressive': 2, 'solid': 1,
  'pretty': 2, 'cute': 2, 'fine': 1, 'recommend': 3, 'glad': 2,

  // NEGATIVE
  'tarnish': -4, 'dull': -2, 'broke': -5, 'uncomfortable': -3, 'heavy': -2,
  'bad': -2, 'poor': -3, 'cheap': -3, 'fragile': -3, 'fake': -5,
  'scratched': -2, 'bent': -3, 'loose': -2, 'faded': -3, 'rough': -2,
  'tight': -2, 'painful': -3, 'flimsy': -3, 'disappointed': -3,
  'oxidized': -2, 'broken': -5, 'worst': -4, 'hate': -3, 'terrible': -4,
  'horrible': -4, 'slow': -2, 'rude': -3, 'awful': -4, 'useless': -3,
  'waste': -3, 'dirty': -2, 'damaged': -4, 'wrong': -2, 'regret': -3,
  'sad': -2, 'annoying': -2, 'hard': -1, 'issues': -2, 'issue': -2,
  'horrendous': -4, 'disgusting': -4, 'fail': -3, 'return': -2
};

const NEGATORS = ['not', 'never', 'no', 'hardly', 'barely', "don't", "doesn't", "cant", "can't", "wouldn't", "won't"];

const THEMES = {
  Comfort: ['light', 'heavy', 'fit', 'wearable', 'comfortable', 'uncomfortable', 'size', 'tight', 'loose', 'painful', 'weight', 'sharp', 'edges', 'soft', 'hard'],
  Durability: ['broke','durable', 'strong', 'quality', 'fragile', 'tarnish', 'lasting', 'bent', 'scratched', 'flimsy', 'faded', 'oxidized', 'plating', 'stone', 'sturdy', 'solid'],
  Appearance: ['shiny', 'dull', 'design', 'polish', 'elegant', 'beautiful', 'look', 'sparkle', 'style', 'finish', 'color', 'gold', 'silver', 'rose', 'pretty', 'cute']
};

// --- 2. LEVENSHTEIN DISTANCE (For Typo Detection) ---
// Calculates how many characters are different between two words
function getEditDistance(a: string, b: string) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// --- 3. INTELLIGENT MATCHING HELPER ---
function getWordScore(inputWord: string): number {
  // 1. Check Exact Match
  if (WORD_SCORES[inputWord] !== undefined) {
    return WORD_SCORES[inputWord];
  }

  // 2. Check Suffixes (Stemming) - Handles "Nicely", "Loved", "Breaking"
  // If "nicely" isn't found, try removing 'ly' and check 'nice'
  if (inputWord.endsWith('ly')) {
    const root = inputWord.slice(0, -2); 
    if (WORD_SCORES[root] !== undefined) return WORD_SCORES[root];
  }
  if (inputWord.endsWith('ed')) {
    const root = inputWord.slice(0, -2); // loved -> lov (fail), scratched -> scratch (pass)
    const rootE = inputWord.slice(0, -1); // loved -> love (pass)
    if (WORD_SCORES[root] !== undefined) return WORD_SCORES[root];
    if (WORD_SCORES[rootE] !== undefined) return WORD_SCORES[rootE];
  }
  if (inputWord.endsWith('ing')) {
    const root = inputWord.slice(0, -3); // breaking -> break
    const rootE = inputWord.slice(0, -3) + 'e'; // loving -> love
    if (WORD_SCORES[root] !== undefined) return WORD_SCORES[root];
    if (WORD_SCORES[rootE] !== undefined) return WORD_SCORES[rootE];
  }

  // 3. Check Fuzzy Match (Typos)
  // Only check words that are 4+ chars long to avoid false positives on small words
  if (inputWord.length > 3) {
    for (const key of Object.keys(WORD_SCORES)) {
      // If the word is very similar (1 or 2 character difference)
      const dist = getEditDistance(inputWord, key);
      const allowedErrors = key.length > 6 ? 2 : 1; // Allow 2 errors for long words, 1 for medium
      
      if (dist <= allowedErrors) {
        return WORD_SCORES[key];
      }
    }
  }

  return 0; // No score found
}

// --- 4. MAIN ANALYZER FUNCTION ---
export const analyzeFeedback = (text: string) => {
  // Normalize text: lowercase and remove punctuation
  const cleanText = text.toLowerCase().replace(/[.,!?;:()]/g, '');
  const words = cleanText.split(/\s+/);
  
  let totalScore = 0;

  words.forEach((word, index) => {
    // USE NEW HELPER FUNCTION
    let score = getWordScore(word);
    
    if (score !== 0) {
      // Check for negator in the previous word (e.g., "not good")
      if (index > 0 && NEGATORS.includes(words[index - 1])) {
        score = -score; 
      }
      totalScore += score;
    }
  });

  // Determine Sentiment Label
  let sentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
  if (totalScore > 0) sentiment = 'Positive';
  if (totalScore < 0) sentiment = 'Negative';

  // THEME DETECTION LOGIC (Also uses fuzzy matching now)
  const detectedThemes: string[] = [];
  
  // Flatten text for theme search
  for (const [theme, keywords] of Object.entries(THEMES)) {
    // Standard keyword check
    const hasExactKeyword = keywords.some(k => cleanText.includes(k));
    
    // Fuzzy keyword check (Check every word in review against every keyword)
    let hasFuzzyKeyword = false;
    if (!hasExactKeyword) {
        words.forEach(w => {
            keywords.forEach(k => {
                if (k.length > 4 && getEditDistance(w, k) <= 1) {
                    hasFuzzyKeyword = true;
                }
            });
        });
    }

    if (hasExactKeyword || hasFuzzyKeyword) {
      detectedThemes.push(theme);
    }
  }

  return { sentiment, themes: Array.from(new Set(detectedThemes)), score: totalScore };
};