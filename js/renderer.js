/**
 * Worksheet Renderer - Renders Crossword & Word Search worksheets as SVG / Canvas
 */

(function (exports) {
  function escapeXML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Multi-line text wrapping for SVG <text> element using <tspan> lines.
   * Prevents text overflow between adjacent columns.
   * @returns {Object} { svgString, height }
   */
  function wrapTextToLinesSVG(str, x, y, maxWidth, fontSize, lineHeight = 1.3, fill = '#1f2937', fontWeight = '400') {
    const rawStr = String(str || '');
    const words = rawStr.split(' ');
    const lines = [];
    let currentLine = '';

    // Estimate character width based on font size (~0.55 * fontSize)
    const charWidth = fontSize * 0.52;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length * charWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    if (lines.length === 0) lines.push('');

    let tspanContent = '';
    const stepY = fontSize * lineHeight;
    for (let i = 0; i < lines.length; i++) {
      const lineY = y + i * stepY;
      const dyAttr = i === 0 ? '' : ` x="${x}" dy="${stepY}"`;
      tspanContent += `<tspan x="${x}" ${i === 0 ? `y="${y}"` : `dy="${stepY}"`}>${escapeXML(lines[i])}</tspan>`;
    }

    const svg = `<text font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}">${tspanContent}</text>`;
    const totalHeight = lines.length * stepY;

    return {
      svg,
      linesCount: lines.length,
      height: totalHeight
    };
  }

  /**
   * Generates SVG string for the entire worksheet matching image.png visual style.
   * @param {Object} puzzleData - Result from Crossword or WordSearch generator
   * @param {Object} config - Page title, subtitle, font, colors, viewMode ('blank' | 'solution'), type ('crossword' | 'wordsearch'), clueCols
   * @returns {string} SVG XML string
   */
  function renderWorksheetSVG(puzzleData, config = {}) {
    const title = config.title || 'PUZZLE WORKSHEET';
    const subtitle = config.subtitle || (config.type === 'wordsearch' ? 'MOTS MÊLÉS / WORD SEARCH' : 'CROSSWORD PUZZLE');
    const fontFamily = config.fontFamily || "'Segoe UI', Arial, sans-serif";
    const primaryColor = config.primaryColor || '#1a1a1a';
    const borderColor = config.borderColor || '#000000';
    const isSolution = config.viewMode === 'solution';
    const puzzleType = config.type || 'crossword';
    const clueCols = parseInt(config.clueCols, 10) || 2;
    const clueFontSize = parseInt(config.clueFontSize, 10) || 12;
    const customFontFaceCSS = config.customFontFaceCSS || '';

    // Standard high-resolution printable page size (A4 / Letter aspect ratio: 800 x 1100 px)
    const pageWidth = 800;
    const pageHeight = 1100;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pageWidth} ${pageHeight}" width="${pageWidth}" height="${pageHeight}" style="background-color: white; font-family: ${fontFamily};">`;

    if (customFontFaceCSS) {
      svgContent += `<defs><style>${customFontFaceCSS}</style></defs>`;
    }

    // 1. Header Section
    svgContent += `
      <g id="header">
        <text x="${pageWidth / 2}" y="65" text-anchor="middle" font-size="38" font-weight="900" fill="${primaryColor}" letter-spacing="2">${escapeXML(title.toUpperCase())}</text>
        <text x="${pageWidth / 2}" y="92" text-anchor="middle" font-size="16" font-weight="700" fill="#4b5563" letter-spacing="1">${escapeXML(subtitle.toUpperCase())}${isSolution ? ' - ANSWER KEY' : ''}</text>
        <line x1="${margin}" y1="108" x2="${pageWidth - margin}" y2="108" stroke="${primaryColor}" stroke-width="2.5" />
      </g>
    `;

    // 2. Grid Section
    const gridTop = 130;
    const maxGridHeight = 520;
    const maxGridWidth = contentWidth;

    if (puzzleType === 'crossword') {
      const grid = puzzleData.grid || [];
      const numRows = grid.length;
      const numCols = numRows > 0 ? grid[0].length : 0;

      if (numRows > 0 && numCols > 0) {
        const cellSize = Math.min(Math.floor(maxGridWidth / numCols), Math.floor(maxGridHeight / numRows), 36);
        const gridPixelWidth = numCols * cellSize;
        const gridPixelHeight = numRows * cellSize;
        const gridLeft = Math.floor((pageWidth - gridPixelWidth) / 2);

        svgContent += `<g id="crossword-grid" transform="translate(${gridLeft}, ${gridTop})">`;

        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            const cell = grid[r][c];
            if (cell) {
              const x = c * cellSize;
              const y = r * cellSize;

              // White cell box with black border
              svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#ffffff" stroke="${borderColor}" stroke-width="1.5" />`;

              // Cell Number (if any)
              if (cell.number > 0) {
                const numFontSize = Math.max(8, Math.floor(cellSize * 0.3));
                svgContent += `<text x="${x + 3}" y="${y + numFontSize + 1}" font-size="${numFontSize}" font-weight="bold" fill="#000000">${cell.number}</text>`;
              }

              // Solution Letter (if in solution view)
              if (isSolution && cell.letter) {
                const letterFontSize = Math.floor(cellSize * 0.6);
                svgContent += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2 + letterFontSize / 3.2}" text-anchor="middle" font-size="${letterFontSize}" font-weight="bold" fill="#1e3a8a">${escapeXML(cell.letter)}</text>`;
              }
            }
          }
        }

        svgContent += `</g>`;

        // 3. Crossword Clues Section (ACROSS & DOWN)
        const cluesTop = gridTop + gridPixelHeight + 35;
        svgContent += renderCrosswordClues(puzzleData.placedWords, cluesTop, pageWidth, pageHeight, margin, primaryColor, clueCols, isSolution, clueFontSize);
      }
    } else {
      // Word Search (Mots Mêlés) Rendering
      const grid = isSolution && puzzleData.solutionGrid ? puzzleData.solutionGrid : puzzleData.grid;
      const numRows = puzzleData.rows || (grid ? grid.length : 0);
      const numCols = puzzleData.cols || (grid && grid[0] ? grid[0].length : 0);

      if (numRows > 0 && numCols > 0) {
        const cellSize = Math.min(Math.floor(maxGridWidth / numCols), Math.floor(maxGridHeight / numRows), 32);
        const gridPixelWidth = numCols * cellSize;
        const gridPixelHeight = numRows * cellSize;
        const gridLeft = Math.floor((pageWidth - gridPixelWidth) / 2);

        svgContent += `<g id="wordsearch-grid" transform="translate(${gridLeft}, ${gridTop})">`;

        // Outer grid border
        svgContent += `<rect x="0" y="0" width="${gridPixelWidth}" height="${gridPixelHeight}" fill="#ffffff" stroke="${borderColor}" stroke-width="2" />`;

        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            const char = grid[r][c] || '';
            const x = c * cellSize;
            const y = r * cellSize;

            // Grid cell outline
            svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="none" stroke="#e2e8f0" stroke-width="0.5" />`;

            if (char) {
              const letterFontSize = Math.floor(cellSize * 0.55);
              const isSolutionChar = isSolution && puzzleData.solutionGrid && puzzleData.solutionGrid[r][c] !== null;
              const fill = isSolutionChar ? '#2563eb' : '#000000';
              const weight = isSolutionChar ? '900' : '600';

              if (isSolutionChar) {
                svgContent += `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${cellSize * 0.4}" fill="#dbeafe" opacity="0.6" />`;
              }

              svgContent += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2 + letterFontSize / 3.2}" text-anchor="middle" font-size="${letterFontSize}" font-weight="${weight}" fill="${fill}">${escapeXML(char)}</text>`;
            }
          }
        }

        svgContent += `</g>`;

        // 3. Word Search Vocabulary Word List
        const listTop = gridTop + gridPixelHeight + 35;
        svgContent += renderWordSearchList(puzzleData.placedWords, listTop, pageWidth, pageHeight, margin, primaryColor, clueCols, clueFontSize);
      }
    }

    // Footer signature
    svgContent += `<text x="${pageWidth / 2}" y="${pageHeight - 20}" text-anchor="middle" font-size="11" fill="#94a3b8">Generated with Puzzle Craft</text>`;
    svgContent += `</svg>`;

    return svgContent;
  }

  function renderCrosswordClues(placedWords, startY, pageWidth, pageHeight, margin, primaryColor, numCols, isSolution, fontSize = 12) {
    if (!placedWords || placedWords.length === 0) return '';

    const acrossWords = placedWords.filter(w => w.direction === 'across').sort((a, b) => a.number - b.number);
    const downWords = placedWords.filter(w => w.direction === 'down').sort((a, b) => a.number - b.number);

    let html = `<g id="crossword-clues" transform="translate(${margin}, ${startY})">`;
    const colWidth = (pageWidth - margin * 2) / 2;

    // Across Column
    html += `<g id="across-clues" transform="translate(0, 0)">`;
    html += `<text x="0" y="0" font-size="18" font-weight="bold" fill="${primaryColor}" letter-spacing="1">ACROSS</text>`;
    html += `<line x1="0" y1="8" x2="${colWidth - 25}" y2="8" stroke="${primaryColor}" stroke-width="1.5" />`;

    let yOffset = 28;
    for (const w of acrossWords) {
      if (startY + yOffset > pageHeight - 35) break;
      const answerTag = isSolution ? ` (${w.displayWord || w.word})` : '';
      const clueText = `${w.number}. ${w.clue}${answerTag}`;
      const wrapped = wrapTextToLinesSVG(clueText, 0, yOffset, colWidth - 30, fontSize, 1.35, '#1f2937', '400');
      html += wrapped.svg;
      yOffset += wrapped.height + 4;
    }
    html += `</g>`;

    // Down Column
    html += `<g id="down-clues" transform="translate(${colWidth + 10}, 0)">`;
    html += `<text x="0" y="0" font-size="18" font-weight="bold" fill="${primaryColor}" letter-spacing="1">DOWN</text>`;
    html += `<line x1="0" y1="8" x2="${colWidth - 25}" y2="8" stroke="${primaryColor}" stroke-width="1.5" />`;

    yOffset = 28;
    for (const w of downWords) {
      if (startY + yOffset > pageHeight - 35) break;
      const answerTag = isSolution ? ` (${w.displayWord || w.word})` : '';
      const clueText = `${w.number}. ${w.clue}${answerTag}`;
      const wrapped = wrapTextToLinesSVG(clueText, 0, yOffset, colWidth - 30, fontSize, 1.35, '#1f2937', '400');
      html += wrapped.svg;
      yOffset += wrapped.height + 4;
    }
    html += `</g>`;

    html += `</g>`;
    return html;
  }

  function renderWordSearchList(placedWords, startY, pageWidth, pageHeight, margin, primaryColor, numCols, fontSize = 12) {
    if (!placedWords || placedWords.length === 0) return '';

    let html = `<g id="wordsearch-list" transform="translate(${margin}, ${startY})">`;
    html += `<text x="0" y="0" font-size="18" font-weight="bold" fill="${primaryColor}" letter-spacing="1">FIND THE WORDS</text>`;
    html += `<line x1="0" y1="8" x2="${pageWidth - margin * 2}" y2="8" stroke="${primaryColor}" stroke-width="1.5" />`;

    const cols = Math.max(1, Math.min(numCols || 2, 4));
    const availableWidth = pageWidth - margin * 2;
    const colWidth = availableWidth / cols;

    // Track column y-offsets for accurate multi-line wrapping in columns
    const colYOffsets = new Array(cols).fill(30);

    let col = 0;

    for (let i = 0; i < placedWords.length; i++) {
      const item = placedWords[i];
      const wordStr = item.displayWord || item.word;
      const hasClue = item.clue && item.clue !== item.word;
      const displayStr = hasClue ? `• ${wordStr} - ${item.clue}` : `• ${wordStr}`;

      const x = col * colWidth;
      const currentY = colYOffsets[col];

      if (startY + currentY > pageHeight - 35) {
        col = (col + 1) % cols;
        continue;
      }

      const wrapped = wrapTextToLinesSVG(displayStr, x, currentY, colWidth - 15, fontSize, 1.3, '#334155', '600');
      html += wrapped.svg;
      colYOffsets[col] += wrapped.height + 6;

      col = (col + 1) % cols;
    }

    html += `</g>`;
    return html;
  }

  exports.renderWorksheetSVG = renderWorksheetSVG;
  exports.escapeXML = escapeXML;
  exports.wrapTextToLinesSVG = wrapTextToLinesSVG;
})(typeof module !== 'undefined' && module.exports ? module.exports : (window.Renderer = {}));
