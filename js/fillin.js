/**
 * Fill-In Puzzle Generator
 * Generates an intersecting grid where words are placed without clue numbers,
 * and words are grouped by length (3 Letters, 4 Letters, etc.)
 */

(function (exports) {
  function generateFillIn(wordsList, options = {}) {
    if (typeof window !== 'undefined' && window.Crossword) {
      const crosswordData = window.Crossword.generateCrossword(wordsList, options);
      return processFillInData(crosswordData);
    } else if (typeof require !== 'undefined') {
      const Crossword = require('./crossword.js');
      const crosswordData = Crossword.generateCrossword(wordsList, options);
      return processFillInData(crosswordData);
    }
    return { grid: [], placedWords: [], groupedByLength: {}, unplacedWords: [] };
  }

  function processFillInData(crosswordData) {
    const placedWords = crosswordData.placedWords || [];
    const groupedByLength = {};

    for (const item of placedWords) {
      const len = item.word.length;
      if (!groupedByLength[len]) {
        groupedByLength[len] = [];
      }
      groupedByLength[len].push(item.displayWord || item.word);
    }

    // Sort word list in each length group alphabetically
    for (const len in groupedByLength) {
      groupedByLength[len].sort((a, b) => a.localeCompare(b));
    }

    return {
      grid: crosswordData.grid,
      placedWords: placedWords,
      groupedByLength: groupedByLength,
      unplacedWords: crosswordData.unplacedWords || []
    };
  }

  exports.generateFillIn = generateFillIn;
  exports.processFillInData = processFillInData;
})(typeof module !== 'undefined' && module.exports ? module.exports : (window.FillIn = {}));
