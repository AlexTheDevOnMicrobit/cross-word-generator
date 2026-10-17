/**
 * Crossword Layout Generator
 */

(function (exports) {
  /**
   * Generates a crossword layout from an array of vocabulary items.
   * @param {Array<{word: string, clue: string, displayWord?: string}>} wordsList
   * @param {Object} options
   * @param {number} [options.maxRetries=50] - Number of random restart attempts to optimize word placement
   * @param {string} [options.sizeMode='auto'] - 'auto' or 'fixed'
   * @param {number} [options.fixedCols=20]
   * @param {number} [options.fixedRows=20]
   */
  function generateCrossword(wordsList, options = {}) {
    if (!wordsList || wordsList.length === 0) {
      return { grid: [], placedWords: [], unplacedWords: [], bounds: { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0, width: 0, height: 0 } };
    }

    const maxRetries = options.maxRetries || 50;

    // Clean and sort word list by length descending to place longest words first
    const cleanList = wordsList
      .filter(item => item && item.word && item.word.length >= 2)
      .map(item => ({ ...item }));

    let bestResult = null;
    let maxPlaced = -1;
    let minArea = Infinity;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Shuffle words with equal length or apply slight random order variation
      const shuffledList = [...cleanList].sort((a, b) => {
        if (b.word.length !== a.word.length) return b.word.length - a.word.length;
        return Math.random() - 0.5;
      });

      const result = attemptLayout(shuffledList, options);
      const placedCount = result.placedWords.length;
      const area = result.bounds.width * result.bounds.height;

      if (placedCount > maxPlaced || (placedCount === maxPlaced && area < minArea)) {
        maxPlaced = placedCount;
        minArea = area;
        bestResult = result;
      }

      // If all words placed, we can stop early if attempt > 10
      if (placedCount === cleanList.length && attempt >= 10) {
        break;
      }
    }

    return numberCrossword(bestResult);
  }

  function attemptLayout(wordsList, options) {
    // Virtual grid using Map key "r,c"
    const gridMap = new Map(); // "r,c" -> { letter, wordIds: [] }
    const placedWords = [];
    const unplacedWords = [];

    // Place first word horizontally at r=0, c=0
    const firstItem = wordsList[0];
    placeWordInMap(gridMap, firstItem, 0, 0, 'across', placedWords);

    for (let i = 1; i < wordsList.length; i++) {
      const item = wordsList[i];
      const bestPlacement = findBestPlacement(gridMap, item.word);

      if (bestPlacement) {
        placeWordInMap(gridMap, item, bestPlacement.row, bestPlacement.col, bestPlacement.direction, placedWords);
      } else {
        unplacedWords.push(item);
      }
    }

    // Compute bounds and shift grid to 0-indexed r,c
    return normalizeGrid(gridMap, placedWords, unplacedWords, options);
  }

  function placeWordInMap(gridMap, item, startRow, startCol, direction, placedWords) {
    const word = item.word;
    const wordObj = {
      ...item,
      row: startRow,
      col: startCol,
      direction: direction, // 'across' or 'down'
      number: 0
    };

    for (let i = 0; i < word.length; i++) {
      const r = direction === 'across' ? startRow : startRow + i;
      const c = direction === 'across' ? startCol + i : startCol;
      const key = `${r},${c}`;

      if (!gridMap.has(key)) {
        gridMap.set(key, { letter: word[i], wordObjs: [wordObj] });
      } else {
        gridMap.get(key).wordObjs.push(wordObj);
      }
    }

    placedWords.push(wordObj);
  }

  function findBestPlacement(gridMap, word) {
    let bestScore = -Infinity;
    let bestPlacement = null;

    // Check all existing grid cells for potential letter matches
    for (const [key, cellData] of gridMap.entries()) {
      const [r, c] = key.split(',').map(Number);
      const letter = cellData.letter;

      // Find all positions in target word where letter matches
      for (let i = 0; i < word.length; i++) {
        if (word[i] === letter) {
          // Try placing across (if existing letter is in a down word or standalone)
          const acrossRow = r;
          const acrossCol = c - i;
          if (canPlaceWord(gridMap, word, acrossRow, acrossCol, 'across')) {
            const score = evaluatePlacement(gridMap, word, acrossRow, acrossCol, 'across');
            if (score > bestScore) {
              bestScore = score;
              bestPlacement = { row: acrossRow, col: acrossCol, direction: 'across' };
            }
          }

          // Try placing down
          const downRow = r - i;
          const downCol = c;
          if (canPlaceWord(gridMap, word, downRow, downCol, 'down')) {
            const score = evaluatePlacement(gridMap, word, downRow, downCol, 'down');
            if (score > bestScore) {
              bestScore = score;
              bestPlacement = { row: downRow, col: downCol, direction: 'down' };
            }
          }
        }
      }
    }

    return bestPlacement;
  }

  function canPlaceWord(gridMap, word, startRow, startCol, direction) {
    const dRow = direction === 'down' ? 1 : 0;
    const dCol = direction === 'across' ? 1 : 0;

    // Check cell before start and after end (must be empty to avoid merging words)
    const beforeKey = `${startRow - dRow},${startCol - dCol}`;
    const afterKey = `${startRow + dRow * word.length},${startCol + dCol * word.length}`;
    if (gridMap.has(beforeKey) || gridMap.has(afterKey)) return false;

    let intersections = 0;

    for (let i = 0; i < word.length; i++) {
      const r = startRow + dRow * i;
      const c = startCol + dCol * i;
      const key = `${r},${c}`;

      if (gridMap.has(key)) {
        const existingCell = gridMap.get(key);
        if (existingCell.letter !== word[i]) return false; // Collision mismatch

        // Cannot overlap if already has word in same orientation
        const sameDir = existingCell.wordObjs.some(w => w.direction === direction);
        if (sameDir) return false;

        intersections++;
      } else {
        // Parallel adjacency check: adjacent perpendicular cells must be empty
        const perpRow1 = r + (direction === 'across' ? 1 : 0);
        const perpCol1 = c + (direction === 'across' ? 0 : 1);
        const perpRow2 = r - (direction === 'across' ? 1 : 0);
        const perpCol2 = c - (direction === 'across' ? 0 : 1);

        if (gridMap.has(`${perpRow1},${perpCol1}`) || gridMap.has(`${perpRow2},${perpCol2}`)) {
          return false;
        }
      }
    }

    return true; // Valid placement
  }

  function evaluatePlacement(gridMap, word, startRow, startCol, direction) {
    const dRow = direction === 'down' ? 1 : 0;
    const dCol = direction === 'across' ? 1 : 0;
    let intersections = 0;

    for (let i = 0; i < word.length; i++) {
      const r = startRow + dRow * i;
      const c = startCol + dCol * i;
      if (gridMap.has(`${r},${c}`)) {
        intersections++;
      }
    }

    // High score for intersections, penalize distance from center
    const centerDist = Math.abs(startRow) + Math.abs(startCol);
    return intersections * 10 - centerDist;
  }

  function normalizeGrid(gridMap, placedWords, unplacedWords, options) {
    if (placedWords.length === 0) {
      return { grid: [], placedWords: [], unplacedWords, bounds: { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0, width: 0, height: 0 } };
    }

    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;

    for (const key of gridMap.keys()) {
      const [r, c] = key.split(',').map(Number);
      if (r < minRow) minRow = r;
      if (r > maxRow) maxRow = r;
      if (c < minCol) minCol = c;
      if (c > maxCol) maxCol = c;
    }

    const height = maxRow - minRow + 1;
    const width = maxCol - minCol + 1;

    // Shift coordinates so top-left is 0,0
    const shiftedGrid = [];
    for (let r = 0; r < height; r++) {
      const rowArr = [];
      for (let c = 0; c < width; c++) {
        const origKey = `${minRow + r},${minCol + c}`;
        if (gridMap.has(origKey)) {
          rowArr.push({
            letter: gridMap.get(origKey).letter,
            number: 0
          });
        } else {
          rowArr.push(null); // empty cell
        }
      }
      shiftedGrid.push(rowArr);
    }

    for (const pw of placedWords) {
      pw.row -= minRow;
      pw.col -= minCol;
    }

    return {
      grid: shiftedGrid,
      placedWords,
      unplacedWords,
      bounds: { minRow, maxRow, minCol, maxCol, width, height }
    };
  }

  function numberCrossword(result) {
    if (!result || !result.grid || result.grid.length === 0) return result;

    const { grid, placedWords } = result;

    // Sort placed words by top-to-bottom, left-to-right order
    placedWords.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    let currentNumber = 1;
    const numMap = new Map(); // "r,c" -> number

    for (const pw of placedWords) {
      const key = `${pw.row},${pw.col}`;
      if (!numMap.has(key)) {
        numMap.set(key, currentNumber);
        pw.number = currentNumber;
        grid[pw.row][pw.col].number = currentNumber;
        currentNumber++;
      } else {
        pw.number = numMap.get(key);
      }
    }

    return result;
  }

  exports.generateCrossword = generateCrossword;
})(typeof module !== 'undefined' && module.exports ? module.exports : (window.Crossword = {}));
