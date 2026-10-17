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
  const primaryColorInput = document.getElementById('primary-color');
  const cellBorderColorInput = document.getElementById('cell-border-color');
  const clueColsSelect = document.getElementById('clue-cols');

  // Application State
  let currentPuzzleData = null;
  let currentViewMode = 'blank'; // 'blank' | 'solution'
  let currentSVGString = '';

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
    if (type === 'crossword') {
      crosswordOptions.classList.remove('hidden');
      wordsearchOptions.classList.add('hidden');
      sheetSubtitleInput.value = 'CROSSWORD PUZZLE';
    } else {
      crosswordOptions.classList.add('hidden');
      wordsearchOptions.classList.remove('hidden');
      sheetSubtitleInput.value = 'MOTS MÊLÉS / WORD SEARCH';
    }
    generateAndRender();
  });

  // Download AI Prompt Instructions
  btnAiInstructions.addEventListener('click', () => {
    const aiInstructionsText = `# AI Prompt Instructions for Generating Puzzle Vocabulary Lists

Copy and send the prompt template below to any AI model (such as ChatGPT, Claude, or Gemini) to automatically generate a vocabulary list perfectly formatted for Puzzle Craft.

---

## Copy & Paste AI Prompt Template

Please generate a vocabulary list for a puzzle generator based on the topic: [INSERT YOUR TOPIC HERE, e.g., "French Beginners - Food & Dining" or "Biology - Cell Structure"].

Strict Rules:
1. Provide between 15 to 25 words with matching concise clues.
2. Format each line strictly as:
   WORD: Clue description
3. Words should be in uppercase letters and contain no spaces or special characters (or use spaces if multi-word, accents are acceptable).
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

  // Live Update Event Listeners on Inputs
  [sheetTitleInput, sheetSubtitleInput, fontFamilySelect, primaryColorInput, cellBorderColorInput, clueColsSelect].forEach(input => {
    input.addEventListener('input', renderCurrentWorksheet);
  });

  vocabInput.addEventListener('input', () => {
    if (vocabInput.value.trim() === '') {
      currentPuzzleData = null;
      currentSVGString = '';
      sheetRenderTarget.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">Enter your vocabulary list above or upload a file to generate a preview.</div>';
      unplacedWarning.classList.add('hidden');
    }
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
      clueCols: clueColsSelect.value,
      viewMode: currentViewMode,
      type: puzzleTypeSelect.value
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
      type: puzzleTypeSelect.value,
      vocabText: vocabInput.value,
      styling: {
        title: sheetTitleInput.value,
        subtitle: sheetSubtitleInput.value,
        fontFamily: fontFamilySelect.value,
        primaryColor: primaryColorInput.value,
        cellBorderColor: cellBorderColorInput.value,
        clueCols: clueColsSelect.value
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
        if (project.vocabText) vocabInput.value = project.vocabText;
        if (project.type) puzzleTypeSelect.value = project.type;
        if (project.styling) {
          if (project.styling.title) sheetTitleInput.value = project.styling.title;
          if (project.styling.subtitle) sheetSubtitleInput.value = project.styling.subtitle;
          if (project.styling.fontFamily) fontFamilySelect.value = project.styling.fontFamily;
          if (project.styling.primaryColor) primaryColorInput.value = project.styling.primaryColor;
          if (project.styling.cellBorderColor) cellBorderColorInput.value = project.styling.cellBorderColor;
          if (project.styling.clueCols) clueColsSelect.value = project.styling.clueCols;
        }
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
