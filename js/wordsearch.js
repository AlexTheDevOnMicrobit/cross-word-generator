/**
 * Word Search ("Mots Mêlés") Layout Generator
 */

(function (exports) {
  const DIRECTIONS = {
    E:  [0, 1],   // Horizontal Left-to-Right
    S:  [1, 0],   // Vertical Top-to-Bottom
    SE: [1, 1],   // Diagonal Down-Right
    NE: [-1, 1],  // Diagonal Up-Right
    W:  [0, -1],  // Horizontal Right-to-Left
    N:  [-1, 0],  // Vertical Bottom-to-Top
    NW: [-1, -1], // Diagonal Up-Left
    SW: [1, -1]   // Diagonal Down-Left
  };

  const ALPHABETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    french: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÉÈÊËÀÂÄÔÖÛÜÇ'
  };

  /**
   * Generates a word search puzzle grid.
   * @param {Array<{word: string, clue: string, displayWord?: string}>} wordsList
   * @param {Object} options
   * @param {number} [options.cols=15]
   * @param {number} [options.rows=15]
   * @param {Array<string>} [options.allowedDirections=['E','S','SE','NE']]
   * @param {string} [options.fillStyle='uppercase']
   * @param {number} [options.maxAttempts=100]
   */
  function generateWordSearch(wordsList, options = {}) {
    const cols = options.cols || 15;
    const rows = options.rows || 15;
    const allowedDirs = (options.allowedDirections && options.allowedDirections.length > 0)
      ? options.allowedDirections
      : ['E', 'S', 'SE', 'NE'];
    const fillStyle = options.fillStyle || 'uppercase';
    const alphabet = ALPHABETS[fillStyle] || ALPHABETS.uppercase;

    // Filter valid words (length <= max dimension)
    const maxDim = Math.max(cols, rows);
    const cleanList = wordsList
      .filter(w => w && w.word && w.word.length >= 2 && w.word.length <= maxDim)
      .map(w => ({ ...w }));

    // Sort words descending by length
    cleanList.sort((a, b) => b.word.length - a.word.length);

    // Initialize empty grid
    const grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null)
    );

    const placedWords = [];
    const unplacedWords = [];

    for (const item of cleanList) {
      const word = item.word;
      let placed = false;

      // Try random positions and directions
      const attempts = 100;
      for (let att = 0; att < attempts; att++) {
        const dirKey = allowedDirs[Math.floor(Math.random() * allowedDirs.length)];
        const [dRow, dCol] = DIRECTIONS[dirKey];

        const startRow = Math.floor(Math.random() * rows);
        const startCol = Math.floor(Math.random() * cols);

        if (canPlaceWordSearch(grid, word, startRow, startCol, dRow, dCol, rows, cols)) {
          placeWordSearch(grid, word, startRow, startCol, dRow, dCol);
          placedWords.push({
            ...item,
            row: startRow,
            col: startCol,
            dRow,
            dCol,
            direction: dirKey
          });
          placed = true;
          break;
        }
      }

      if (!placed) {
        unplacedWords.push(item);
      }
    }

    // Solution Grid (before random letters fill)
    const solutionGrid = grid.map(row => row.map(cell => cell ? cell.letter : null));

    // Fill remaining null cells with random letters from alphabet
    const filledGrid = grid.map(row => row.map(cell => {
      if (cell) return cell.letter;
      return alphabet[Math.floor(Math.random() * alphabet.length)];
    }));

    return {
      grid: filledGrid,
      solutionGrid,
      placedWords,
      unplacedWords,
      cols,
      rows
    };
  }

  function canPlaceWordSearch(grid, word, startRow, startCol, dRow, dCol, rows, cols) {
    const endRow = startRow + dRow * (word.length - 1);
    const endCol = startCol + dCol * (word.length - 1);

    if (endRow < 0 || endRow >= rows || endCol < 0 || endCol >= cols) {
      return false; // Out of bounds
    }

    for (let i = 0; i < word.length; i++) {
      const r = startRow + dRow * i;
      const c = startCol + dCol * i;
      const existing = grid[r][c];

      if (existing !== null && existing.letter !== word[i]) {
        return false; // Character collision
      }
    }

    return true;
  }

  function placeWordSearch(grid, word, startRow, startCol, dRow, dCol) {
    for (let i = 0; i < word.length; i++) {
      const r = startRow + dRow * i;
      const c = startCol + dCol * i;
      grid[r][c] = { letter: word[i] };
    }
  }

  exports.generateWordSearch = generateWordSearch;
  exports.DIRECTIONS = DIRECTIONS;
})(typeof module !== 'undefined' && module.exports ? module.exports : (window.WordSearch = {}));
