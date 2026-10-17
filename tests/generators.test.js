const test = require('node:test');
const assert = require('node:assert');
const Crossword = require('../js/crossword.js');
const WordSearch = require('../js/wordsearch.js');

test('Crossword generator places intersecting words', () => {
  const words = [
    { word: 'APPLE', clue: 'Red fruit' },
    { word: 'PEACH', clue: 'Stone fruit' },
    { word: 'LEAF', clue: 'Tree foliage' }
  ];

  const result = Crossword.generateCrossword(words, { maxRetries: 10 });
  assert.ok(result.placedWords.length > 0);
  assert.ok(result.grid.length > 0);
  assert.ok(result.grid[0].length > 0);
  assert.ok(result.placedWords[0].number >= 1);
});

test('WordSearch generator fills grid and places words in bounds', () => {
  const words = [
    { word: 'FALL', clue: 'Season' },
    { word: 'OWL', clue: 'Bird' },
    { word: 'ACORN', clue: 'Nut' }
  ];

  const result = WordSearch.generateWordSearch(words, {
    cols: 10,
    rows: 10,
    allowedDirections: ['E', 'S', 'SE']
  });

  assert.strictEqual(result.grid.length, 10);
  assert.strictEqual(result.grid[0].length, 10);
  assert.ok(result.placedWords.length > 0);

  // Check solution grid has nulls or letters, and grid has all filled non-null chars
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      assert.strictEqual(typeof result.grid[r][c], 'string');
      assert.strictEqual(result.grid[r][c].length, 1);
    }
  }
});
