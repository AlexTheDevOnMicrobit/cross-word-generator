/**
 * Main Application logic and Event Handlers
 */

document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const tabs = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const puzzleTypeSelect = document.getElementById('puzzle-type');
  const crosswordOptions = document.getElementById('crossword-options');
  const wordsearchOptions = document.getElementById('wordsearch-options');
  const vocabInput = document.getElementById('vocab-input');
  const fileUpload = document.getElementById('file-upload');
  const btnAiInstructions = document.getElementById('btn-ai-instructions');
  const aiDropdownMenu = document.getElementById('ai-dropdown-menu');
  const btnDownloadAi = document.getElementById('btn-download-ai');
  const btnGenerate = document.getElementById('btn-generate');
  const viewBlankBtn = document.getElementById('view-blank');
  const viewSolutionBtn = document.getElementById('view-solution');
  const sheetRenderTarget = document.getElementById('sheet-render-target');
  const unplacedWarning = document.getElementById('unplaced-warning');

  // Export Buttons
  const btnExportPNG = document.getElementById('export-png');
  const btnExportSVG = document.getElementById('export-svg');
  const btnExportPDF = document.getElementById('export-pdf');
  const btnExportJSON = document.getElementById('export-json');
  const btnImportJSON = document.getElementById('import-json-btn');
  const importJSONFile = document.getElementById('import-json-file');

  // Styling Inputs
  const sheetTitleInput = document.getElementById('sheet-title');
  const sheetSubtitleInput = document.getElementById('sheet-subtitle');
  const fontFamilySelect = document.getElementById('font-family');
  const customFontFileInput = document.getElementById('custom-font-file');
  const customFontStatus = document.getElementById('custom-font-status');
  const primaryColorInput = document.getElementById('primary-color');
  const cellBorderColorInput = document.getElementById('cell-border-color');
  const paperThemeSelect = document.getElementById('paper-theme');
  const clueColsSelect = document.getElementById('clue-cols');
  const clueFontSizeInput = document.getElementById('clue-font-size');
  const clueFontSizeVal = document.getElementById('clue-font-size-val');
  const btnResetSettings = document.getElementById('btn-reset-settings');

  // QoL Controls
  const vocabCounter = document.getElementById('vocab-counter');
  const btnClearText = document.getElementById('btn-clear-text');
  const btnCopyAi = document.getElementById('btn-copy-ai');
  const langSelect = document.getElementById('lang-select');
  const printWorksheetBtn = document.getElementById('print-worksheet');

  // Zoom Controls
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomReset = document.getElementById('btn-zoom-reset');
  const zoomLevelSpan = document.getElementById('zoom-level');
  const worksheetPaper = document.getElementById('worksheet-paper');

  // Application State
  let currentPuzzleData = null;
  let currentViewMode = 'blank'; // 'blank' | 'solution'
  let currentSVGString = '';
  let customFontDataURL = '';
  let customFontName = '';
  let customFontFaceCSS = '';
  let currentZoom = 100;
  let currentLang = 'en';

  // Tab Navigation
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // Toggle Puzzle Type Options UI
  puzzleTypeSelect.addEventListener('change', () => {
    const type = puzzleTypeSelect.value;
    if (type === 'crossword' || type === 'fillin') {
      crosswordOptions.classList.remove('hidden');
      wordsearchOptions.classList.add('hidden');
      sheetSubtitleInput.value = type === 'crossword' ? 'CROSSWORD PUZZLE' : 'FILL-IN PUZZLE';
    } else {
      crosswordOptions.classList.add('hidden');
      wordsearchOptions.classList.remove('hidden');
      sheetSubtitleInput.value = 'MOTS MÊLÉS / WORD SEARCH';
    }
    generateAndRender();
  });

  // AI Instructions Dropdown Toggle
  if (btnAiInstructions && aiDropdownMenu) {
    btnAiInstructions.addEventListener('click', (e) => {
      e.stopPropagation();
      aiDropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      aiDropdownMenu.classList.add('hidden');
    });
  }

  // Download AI Prompt Instructions
  if (btnDownloadAi) {
    btnDownloadAi.addEventListener('click', () => {
      const aiInstructionsText = `# AI Prompt Instructions for Generating Puzzle Vocabulary Lists (v1.2.0)

Copy and send the prompt template below to any AI model (such as ChatGPT, Claude, or Gemini) to automatically generate a vocabulary list perfectly formatted for Puzzle Craft (supporting Crosswords, Fill-In Puzzles, and Word Searches).

---

## Copy & Paste AI Prompt Template

Please generate a vocabulary list for a puzzle generator based on the topic: [INSERT YOUR TOPIC HERE, e.g., "French Beginners - Food & Dining" or "Biology - Cell Structure"].

Strict Rules:
1. Provide between 15 to 25 words with matching concise clues.
2. Format each line strictly as:
   WORD: Clue description
3. Words should be in uppercase letters and contain no spaces or special characters (accents are acceptable).
4. Do NOT include markdown bolding, numbering, bullet points, or extra introductory text inside the list.

Example Output Format:
APPLE: A round red or green fruit grown on trees
BREAD: A staple food prepared from a dough of flour and water
CHEESE: A dairy product made from milk curds
WATER: Essential clear fluid for human life

---

## Supported Formats in Puzzle Craft

1. Colon Separated: WORD: Clue
2. Comma / Dash Separated: WORD, Clue OR WORD - Clue
3. Markdown Table: | Word | Clue |
4. JSON Array: [{"word": "WORD", "clue": "Clue"}]
`;
      const blob = new Blob([aiInstructionsText], { type: 'text/markdown;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'AI_PROMPT_INSTRUCTIONS.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Handle File Upload (.txt, .csv, .md, .json)
  fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const parsed = window.Parser.parseContent(content, file.name);

      if (parsed.length > 0) {
        vocabInput.value = parsed.map(p => `${p.displayWord || p.word}: ${p.clue}`).join('\n');
        generateAndRender();
      } else {
        alert('Could not parse any valid words from the uploaded file.');
      }
    };
    reader.readAsText(file);
  });

  // View Mode Switching (Blank vs Answer Key)
  viewBlankBtn.addEventListener('click', () => {
    viewBlankBtn.classList.add('active');
    viewSolutionBtn.classList.remove('active');
    currentViewMode = 'blank';
    renderCurrentWorksheet();
  });

  viewSolutionBtn.addEventListener('click', () => {
    viewSolutionBtn.classList.add('active');
    viewBlankBtn.classList.remove('active');
    currentViewMode = 'solution';
    renderCurrentWorksheet();
  });

  // Custom Font File Upload Handling
  if (customFontFileInput) {
    customFontFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        customFontDataURL = event.target.result;
        customFontName = `CustomFont_${Date.now()}`;

        // Define @font-face CSS
        customFontFaceCSS = `@font-face { font-family: '${customFontName}'; src: url('${customFontDataURL}'); }`;

        // Inject dynamic style tag into DOM
        let dynamicStyle = document.getElementById('dynamic-custom-font-style');
        if (!dynamicStyle) {
          dynamicStyle = document.createElement('style');
          dynamicStyle.id = 'dynamic-custom-font-style';
          document.head.appendChild(dynamicStyle);
        }
        dynamicStyle.textContent = customFontFaceCSS;

        // Add to select option list
        let customOpt = fontFamilySelect.querySelector('option[data-custom="true"]');
        if (!customOpt) {
          customOpt = document.createElement('option');
          customOpt.dataset.custom = 'true';
          fontFamilySelect.appendChild(customOpt);
        }
        customOpt.value = `'${customFontName}', sans-serif`;
        customOpt.textContent = `Custom Font: ${file.name}`;
        fontFamilySelect.value = customOpt.value;

        if (customFontStatus) {
          customFontStatus.textContent = `Loaded: ${file.name}`;
        }

        renderCurrentWorksheet();
      };
      reader.readAsDataURL(file);
    });
  }

  // Update Vocab Counter & Live State
  function updateVocabCounter() {
    const parsed = window.Parser.parseText(vocabInput.value);
    const count = parsed.length;
    if (vocabCounter) {
      vocabCounter.textContent = `${count} ${count === 1 ? 'word' : 'words'}`;
    }
  }

  vocabInput.addEventListener('input', () => {
    updateVocabCounter();
    if (vocabInput.value.trim() === '') {
      currentPuzzleData = null;
      currentSVGString = '';
      const emptyMsg = window.I18n && window.I18n.translations[currentLang]
        ? window.I18n.translations[currentLang].emptyPreview
        : 'Enter your vocabulary list above or upload a file to generate a preview.';
      sheetRenderTarget.innerHTML = `<div style="padding: 40px; text-align: center; color: #64748b;">${emptyMsg}</div>`;
      unplacedWarning.classList.add('hidden');
    }
  });

  // Clear Text Button
  if (btnClearText) {
    btnClearText.addEventListener('click', () => {
      vocabInput.value = '';
      vocabInput.dispatchEvent(new Event('input'));
    });
  }

  // Copy AI Prompt
  const btnCopyAiItem = document.getElementById('btn-copy-ai-item');
  if (btnCopyAiItem) {
    btnCopyAiItem.addEventListener('click', () => {
      const promptText = `Please generate a vocabulary list for a puzzle generator based on the topic: [YOUR TOPIC HERE].
Strict Rules:
1. Provide between 15 to 25 words with matching concise clues.
2. Format each line strictly as: WORD: Clue description
3. Words should be in uppercase letters (accents allowed).`;
      navigator.clipboard.writeText(promptText).then(() => {
        const origText = btnCopyAiItem.textContent;
        btnCopyAiItem.textContent = 'Copied!';
        setTimeout(() => { btnCopyAiItem.textContent = origText; }, 1500);
      });
    });
  }

  // Shuffle Grid Button
  const btnShuffle = document.getElementById('btn-shuffle');
  if (btnShuffle) {
    btnShuffle.addEventListener('click', generateAndRender);
  }

  // Language Switcher
  if (langSelect) {
    langSelect.addEventListener('change', () => {
      currentLang = langSelect.value;
      applyLanguage(currentLang);
    });
  }

  function applyLanguage(lang) {
    if (!window.I18n || !window.I18n.translations[lang]) return;
    const dict = window.I18n.translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });

    // Update placeholders
    if (dict.placeholderVocab) vocabInput.placeholder = dict.placeholderVocab;

    // Refresh rendering
    renderCurrentWorksheet();
  }

  // Clue Font Size Slider
  if (clueFontSizeInput) {
    clueFontSizeInput.addEventListener('input', () => {
      clueFontSizeVal.textContent = `${clueFontSizeInput.value}px`;
      renderCurrentWorksheet();
    });
  }

  // Reset Settings
  if (btnResetSettings) {
    btnResetSettings.addEventListener('click', () => {
      sheetTitleInput.value = 'AUTUMN FUN';
      sheetSubtitleInput.value = puzzleTypeSelect.value === 'crossword' ? 'CROSSWORD PUZZLE' : 'MOTS MÊLÉS / WORD SEARCH';
      fontFamilySelect.value = "'Segoe UI', Arial, sans-serif";
      primaryColorInput.value = '#1a1a1a';
      cellBorderColorInput.value = '#000000';
      clueColsSelect.value = '2';
      clueFontSizeInput.value = '12';
      clueFontSizeVal.textContent = '12px';
      renderCurrentWorksheet();
    });
  }

  // Zooming Preview Controls
  function applyZoom(delta) {
    currentZoom = Math.max(50, Math.min(200, currentZoom + delta));
    zoomLevelSpan.textContent = `${currentZoom}%`;
    worksheetPaper.style.transform = `scale(${currentZoom / 100})`;
    worksheetPaper.style.transformOrigin = 'top center';
  }

  if (btnZoomIn) btnZoomIn.addEventListener('click', () => applyZoom(10));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => applyZoom(-10));
  if (btnZoomReset) {
    btnZoomReset.addEventListener('click', () => {
      currentZoom = 100;
      zoomLevelSpan.textContent = '100%';
      worksheetPaper.style.transform = 'scale(1)';
    });
  }

  // Print Worksheet Button
  if (printWorksheetBtn) {
    printWorksheetBtn.addEventListener('click', () => {
      if (!currentSVGString) return;
      const printWin = window.open('', '_blank');
      printWin.document.write(`<html><head><title>Print Worksheet</title><style>body { margin: 0; display: flex; justify-content: center; align-items: center; }</style></head><body>${currentSVGString}</body></html>`);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => { printWin.print(); printWin.close(); }, 300);
    });
  }

  // Live Update Event Listeners on Inputs
  [sheetTitleInput, sheetSubtitleInput, fontFamilySelect, primaryColorInput, cellBorderColorInput, paperThemeSelect, clueColsSelect].forEach(input => {
    if (input) input.addEventListener('input', renderCurrentWorksheet);
  });

  btnGenerate.addEventListener('click', generateAndRender);

  // Core Puzzle Generation & Rendering
  function generateAndRender() {
    const rawText = vocabInput.value;
    const wordsList = window.Parser.parseText(rawText);

    if (wordsList.length === 0) {
      sheetRenderTarget.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">Please enter vocabulary words and clues to generate a puzzle.</div>';
      unplacedWarning.classList.add('hidden');
      return;
    }

    const type = puzzleTypeSelect.value;

    if (type === 'crossword') {
      const maxRetries = parseInt(document.getElementById('max-retries').value, 10) || 50;
      currentPuzzleData = window.Crossword.generateCrossword(wordsList, { maxRetries });
    } else if (type === 'fillin') {
      const maxRetries = parseInt(document.getElementById('max-retries').value, 10) || 50;
      currentPuzzleData = window.FillIn.generateFillIn(wordsList, { maxRetries });
    } else {
      const cols = parseInt(document.getElementById('ws-cols').value, 10) || 15;
      const rows = parseInt(document.getElementById('ws-rows').value, 10) || 15;
      const fillStyle = document.getElementById('ws-fill-style').value;

      const allowedDirections = [];
      ['E', 'S', 'SE', 'NE', 'W', 'N', 'NW', 'SW'].forEach(dir => {
        const chk = document.getElementById(`dir-${dir}`);
        if (chk && chk.checked) allowedDirections.push(dir);
      });

      currentPuzzleData = window.WordSearch.generateWordSearch(wordsList, {
        cols,
        rows,
        fillStyle,
        allowedDirections
      });
    }

    // Display warning for unplaced words
    if (currentPuzzleData.unplacedWords && currentPuzzleData.unplacedWords.length > 0) {
      const unplacedNames = currentPuzzleData.unplacedWords.map(w => w.word).join(', ');
      unplacedWarning.textContent = `Unplaced words (${currentPuzzleData.unplacedWords.length}): ${unplacedNames}`;
      unplacedWarning.classList.remove('hidden');
    } else {
      unplacedWarning.classList.add('hidden');
    }

    renderCurrentWorksheet();
  }

  function renderCurrentWorksheet() {
    if (!currentPuzzleData) return;

    const config = {
      title: sheetTitleInput.value,
      subtitle: sheetSubtitleInput.value,
      fontFamily: fontFamilySelect.value,
      primaryColor: primaryColorInput.value,
      borderColor: cellBorderColorInput.value,
      paperBg: paperThemeSelect ? paperThemeSelect.value : '#ffffff',
      clueCols: clueColsSelect.value,
      clueFontSize: clueFontSizeInput ? clueFontSizeInput.value : 12,
      viewMode: currentViewMode,
      type: puzzleTypeSelect.value,
      customFontFaceCSS: customFontFaceCSS
    };

    currentSVGString = window.Renderer.renderWorksheetSVG(currentPuzzleData, config);
    sheetRenderTarget.innerHTML = currentSVGString;
  }

  // Exports Handlers
  btnExportPNG.addEventListener('click', () => {
    if (!currentSVGString) return;
    const filename = `${sheetTitleInput.value.toLowerCase().replace(/\s+/g, '-')}-${currentViewMode}.png`;
    window.Exporter.exportToPNG(currentSVGString, filename);
  });

  btnExportSVG.addEventListener('click', () => {
    if (!currentSVGString) return;
    const filename = `${sheetTitleInput.value.toLowerCase().replace(/\s+/g, '-')}-${currentViewMode}.svg`;
    window.Exporter.exportToSVG(currentSVGString, filename);
  });

  btnExportPDF.addEventListener('click', () => {
    if (!currentSVGString) return;
    const filename = `${sheetTitleInput.value.toLowerCase().replace(/\s+/g, '-')}-${currentViewMode}.pdf`;
    window.Exporter.exportToPDF(currentSVGString, filename);
  });

  btnExportJSON.addEventListener('click', () => {
    const project = {
      version: '1.2.0',
      type: puzzleTypeSelect.value,
      vocabText: vocabInput.value,
      language: currentLang,
      gridSettings: {
        gridSizeMode: document.getElementById('grid-size-mode').value,
        gridCols: document.getElementById('grid-cols').value,
        gridRows: document.getElementById('grid-rows').value,
        maxRetries: document.getElementById('max-retries').value,
        wsCols: document.getElementById('ws-cols').value,
        wsRows: document.getElementById('ws-rows').value,
        wsFillStyle: document.getElementById('ws-fill-style').value,
        allowedDirections: ['E', 'S', 'SE', 'NE', 'W', 'N', 'NW', 'SW'].reduce((acc, dir) => {
          const chk = document.getElementById(`dir-${dir}`);
          if (chk) acc[dir] = chk.checked;
          return acc;
        }, {})
      },
      styling: {
        title: sheetTitleInput.value,
        subtitle: sheetSubtitleInput.value,
        fontFamily: fontFamilySelect.value,
        clueFontSize: clueFontSizeInput ? clueFontSizeInput.value : 12,
        primaryColor: primaryColorInput.value,
        cellBorderColor: cellBorderColorInput.value,
        clueCols: clueColsSelect.value,
        customFontDataURL: customFontDataURL,
        customFontName: customFontName,
        customFontFaceCSS: customFontFaceCSS
      }
    };
    window.Exporter.exportProjectJSON(project, `${sheetTitleInput.value.toLowerCase().replace(/\s+/g, '-')}-project.json`);
  });

  btnImportJSON.addEventListener('click', () => importJSONFile.click());

  importJSONFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const project = JSON.parse(event.target.result);

        // Versioning check & Fallbacks (compatible with v1.0.0 and v1.1.0)
        if (project.vocabText !== undefined) vocabInput.value = project.vocabText;
        if (project.type) puzzleTypeSelect.value = project.type;
        if (project.language && langSelect) {
          langSelect.value = project.language;
          currentLang = project.language;
          applyLanguage(currentLang);
        }

        // Grid Settings
        if (project.gridSettings) {
          const gs = project.gridSettings;
          if (gs.gridSizeMode) document.getElementById('grid-size-mode').value = gs.gridSizeMode;
          if (gs.gridCols) document.getElementById('grid-cols').value = gs.gridCols;
          if (gs.gridRows) document.getElementById('grid-rows').value = gs.gridRows;
          if (gs.maxRetries) document.getElementById('max-retries').value = gs.maxRetries;
          if (gs.wsCols) document.getElementById('ws-cols').value = gs.wsCols;
          if (gs.wsRows) document.getElementById('ws-rows').value = gs.wsRows;
          if (gs.wsFillStyle) document.getElementById('ws-fill-style').value = gs.wsFillStyle;
          if (gs.allowedDirections) {
            Object.keys(gs.allowedDirections).forEach(dir => {
              const chk = document.getElementById(`dir-${dir}`);
              if (chk) chk.checked = gs.allowedDirections[dir];
            });
          }
        }

        // Styling Settings
        if (project.styling) {
          const st = project.styling;
          if (st.title !== undefined) sheetTitleInput.value = st.title;
          if (st.subtitle !== undefined) sheetSubtitleInput.value = st.subtitle;
          if (st.primaryColor) primaryColorInput.value = st.primaryColor;
          if (st.cellBorderColor) cellBorderColorInput.value = st.cellBorderColor;
          if (st.clueCols) clueColsSelect.value = st.clueCols;
          if (st.clueFontSize && clueFontSizeInput) {
            clueFontSizeInput.value = st.clueFontSize;
            clueFontSizeVal.textContent = `${st.clueFontSize}px`;
          }

          // Restore Custom Uploaded Font if present
          if (st.customFontFaceCSS && st.customFontName) {
            customFontDataURL = st.customFontDataURL || '';
            customFontName = st.customFontName;
            customFontFaceCSS = st.customFontFaceCSS;

            let dynamicStyle = document.getElementById('dynamic-custom-font-style');
            if (!dynamicStyle) {
              dynamicStyle = document.createElement('style');
              dynamicStyle.id = 'dynamic-custom-font-style';
              document.head.appendChild(dynamicStyle);
            }
            dynamicStyle.textContent = customFontFaceCSS;

            let customOpt = fontFamilySelect.querySelector('option[data-custom="true"]');
            if (!customOpt) {
              customOpt = document.createElement('option');
              customOpt.dataset.custom = 'true';
              fontFamilySelect.appendChild(customOpt);
            }
            customOpt.value = `'${customFontName}', sans-serif`;
            customOpt.textContent = `Custom Font: ${customFontName}`;
            fontFamilySelect.value = customOpt.value;
          } else if (st.fontFamily) {
            fontFamilySelect.value = st.fontFamily;
          }
        }

        vocabInput.dispatchEvent(new Event('input'));
        puzzleTypeSelect.dispatchEvent(new Event('change'));
      } catch (err) {
        alert('Invalid project JSON file.');
      }
    };
    reader.readAsText(file);
  });

  // Leave input empty on page load so translucent placeholder is visible
  sheetRenderTarget.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">Enter your vocabulary list above or upload a file to generate a preview.</div>';
});
