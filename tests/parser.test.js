const test = require('node:test');
const assert = require('node:assert');
const Parser = require('../js/parser.js');

test('normalizeWord removes accents and non-alpha characters', () => {
  assert.strictEqual(Parser.normalizeWord('Éléphant!'), 'ELEPHANT');
  assert.strictEqual(Parser.normalizeWord('Ice Cream'), 'ICECREAM');
  assert.strictEqual(Parser.normalizeWord('123-ABC'), 'ABC');
});

test('parseText handles colon separated lines', () => {
  const input = "OWL: Known for hooting calls\nPUMPKIN: Large orange vegetable";
  const result = Parser.parseText(input);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].word, 'OWL');
  assert.strictEqual(result[0].clue, 'Known for hooting calls');
  assert.strictEqual(result[1].word, 'PUMPKIN');
});

test('parseText handles comma and dash separated lines', () => {
  const input = "APPLE, Red fruit\nAUTUMN - Season of falling leaves";
  const result = Parser.parseText(input);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].word, 'APPLE');
  assert.strictEqual(result[0].clue, 'Red fruit');
  assert.strictEqual(result[1].word, 'AUTUMN');
  assert.strictEqual(result[1].clue, 'Season of falling leaves');
});

test('parseText handles Markdown tables', () => {
  const input = "| Word | Clue |\n|---|---|\n| LEAF | Tree foliage |\n| ACORN | Nut from oak |";
  const result = Parser.parseText(input);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].word, 'LEAF');
  assert.strictEqual(result[0].clue, 'Tree foliage');
});

test('parseJSON handles array of objects', () => {
  const json = JSON.stringify([
    { word: "SQUIRREL", clue: "Small mammal with bushy tail" },
    { word: "CORN", clue: "Yellow grain on a cob" }
  ]);
  const result = Parser.parseJSON(json);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].word, 'SQUIRREL');
  assert.strictEqual(result[0].clue, 'Small mammal with bushy tail');
});
