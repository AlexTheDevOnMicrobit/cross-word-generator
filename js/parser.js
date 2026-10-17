/**
 * Vocab Parser for Crossword & Word Search Generator
 */

(function (exports) {
  /**
   * Cleans and normalizes a word for grid placement while retaining uppercase accents.
   * e.g., "élevé" -> "ÉLEVÉ", "môt-mêlé" -> "MÔTMÊLÉ"
   * @param {string} str
   * @returns {string} Normalized uppercase string keeping unicode letters and accents
   */
  function normalizeWord(str) {
    if (!str) return '';
    return str
      .toUpperCase()
      .replace(/[^\p{L}]/gu, ''); // Keep unicode letter characters including accents
  }

  /**
   * Parses raw text input into array of { word, displayWord, clue }
   * @param {string} text
   * @returns {Array<{ word: string, displayWord: string, clue: string }>}
   */
  function parseText(text) {
    if (!text || typeof text !== 'string') return [];

    const lines = text.split(/\r?\n/);
    const results = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Ignore markdown list bullet markers (- , * , 1. )
      line = line.replace(/^[\s\*\-\d\.\>]+/, '').trim();

      // Ignore markdown table borders (| ... |)
      if (line.startsWith('|') && line.endsWith('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const rawWord = parts[0];
          const clue = parts.slice(1).join(' - ');
          // Skip header row like "| Word | Clue |" or separator "|---|---|"
          if (rawWord.toLowerCase() === 'word' || rawWord.match(/^:?-+:?$/)) {
            continue;
          }
          const clean = normalizeWord(rawWord);
          if (clean.length > 0) {
            results.push({ word: clean, displayWord: rawWord, clue: clue || rawWord });
          }
          continue;
        }
      }

      // Check delimiters in order: ':', '-', ',', '\t'
      let splitIdx = -1;
      let delimiter = '';

      if (line.includes(':')) {
        splitIdx = line.indexOf(':');
        delimiter = ':';
      } else if (line.includes('\t')) {
        splitIdx = line.indexOf('\t');
        delimiter = '\t';
      } else if (line.includes(' - ')) {
        splitIdx = line.indexOf(' - ');
        delimiter = ' - ';
      } else if (line.includes(',')) {
        splitIdx = line.indexOf(',');
        delimiter = ',';
      }

      let rawWord = line;
      let clue = line;

      if (splitIdx !== -1) {
        rawWord = line.substring(0, splitIdx).trim();
        clue = line.substring(splitIdx + delimiter.length).trim();
      }

      const clean = normalizeWord(rawWord);
      if (clean.length > 0) {
        results.push({
          word: clean,
          displayWord: rawWord,
          clue: clue || rawWord
        });
      }
    }

    return results;
  }

  /**
   * Parses JSON string into { word, displayWord, clue } list
   * @param {string} jsonString
   * @returns {Array<{ word: string, displayWord: string, clue: string }>}
   */
  function parseJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const results = [];

      if (Array.isArray(data)) {
        for (const item of data) {
          if (typeof item === 'string') {
            const clean = normalizeWord(item);
            if (clean) results.push({ word: clean, displayWord: item, clue: item });
          } else if (typeof item === 'object' && item !== null) {
            const rawWord = item.word || item.term || item.answer || Object.keys(item)[0] || '';
            const clue = item.clue || item.definition || item.hint || item[rawWord] || rawWord;
            const clean = normalizeWord(rawWord);
            if (clean) results.push({ word: clean, displayWord: String(rawWord), clue: String(clue) });
          }
        }
      } else if (typeof data === 'object' && data !== null) {
        for (const [key, val] of Object.entries(data)) {
          const clean = normalizeWord(key);
          if (clean) {
            results.push({
              word: clean,
              displayWord: key,
              clue: typeof val === 'string' ? val : JSON.stringify(val)
            });
          }
        }
      }

      return results;
    } catch (e) {
      return [];
    }
  }

  /**
   * Automatically parses content based on file extension or auto-detection.
   * @param {string} content
   * @param {string} filename
   */
  function parseContent(content, filename = '') {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'json') {
      const jsonRes = parseJSON(content);
      if (jsonRes.length > 0) return jsonRes;
    }
    // Default to robust text/csv/md line parsing
    return parseText(content);
  }

  exports.normalizeWord = normalizeWord;
  exports.parseText = parseText;
  exports.parseJSON = parseJSON;
  exports.parseContent = parseContent;
})(typeof module !== 'undefined' && module.exports ? module.exports : (window.Parser = {}));
