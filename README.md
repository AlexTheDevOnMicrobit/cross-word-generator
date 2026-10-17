# Puzzle Craft - Crossword & Word Search Generator (v1.2.0)

A web-based generator for creating printable **Crosswords** and **Word Searches ("Mots Mêlés")** from custom vocabulary lists. Designed for educators, content creators, and puzzle enthusiasts.

---

## Features

- **Triple Puzzle Modes:**
  - **Crossword Engine:** Automatic intersection grid placement with random-restart layout optimization and Across/Down numbering.
  - **Fill-In Puzzle Engine:** Intersecting grid without clue numbers, displaying placed words organized neatly into letter-length groups (e.g. 3 Letters, 4 Letters, 5 Letters).
  - **Word Search ("Mots Mêlés"):** 8-directional word placement with custom filler alphabets (Standard English A–Z or French accented characters).

- **Multi-Format Vocabulary Import:**
  - Raw text input with syntax detection (`WORD: Clue`, `WORD, Clue`, or `WORD - Clue`).
  - File upload support for `.txt`, `.csv`, `.md` (Markdown tables), and `.json`.
  - Accent normalization and non-alphanumeric filtering.

- **Worksheet Styling & Customization:**
  - Custom title and subtitle headers.
  - Custom font selection & **Custom Font File Upload** (`.ttf`, `.otf`, `.woff`, `.woff2`).
  - **Worksheet Paper Theme Selector:** Classic Crisp White, Warm Vintage Parchment, and Cool Blue Slate.
  - Adjustable clue font size slider (8px - 18px).
  - Configurable grid line and accent colors.
  - Multi-column clue layouts (1, 2, 3, or 4 columns).
  - SVG multi-line text wrapping to eliminate text overlapping across columns.

- **Quality of Life & Multilingual UI:**
  - **Multi-language selector:** English (EN) & French (FR).
  - **Accent Support:** Preserves accented characters (`Â`, `Ä`, `É`, `È`, `Ê`, `Ë`, `Î`, `Ï`, `Ô`, `Ö`, `Ù`, `Û`, `Ü`, `Ç`, `Ñ`, etc.) in grid placement and clues.
  - Live **Word & Clue Counter** badge.
  - Interactive **AI Instructions Dropdown Menu** for prompt copying and markdown file downloading.
  - **Shuffle Grid Button** for quick layout reshuffling.
  - Live **Word Length Breakdown Stats** (pill badges showing 3L, 4L, 5L counts).
  - One-click **Clear Text** button.
  - Interactive **Preview Canvas Zoom** (Zoom In / Out / Reset Fit).
  - Direct **Print Worksheet** functionality.
  - One-click **Reset Settings to Default**.
  - Project JSON export/import with versioning (`"version": "1.2.0"`).

- **Export & View Modes:**
  - Real-time toggle between **Blank Worksheet** and **Answer Key** modes.
  - High-resolution **PNG** image export.
  - Scalable Vector Graphics (**SVG**) export.
  - High-quality **PDF** worksheet document export.
  - **JSON Project Save/Load** to store and resume your puzzle setups anytime.

- **AI Prompt Integration:**
  - Includes a one-click **AI Instructions** downloader (`AI_PROMPT_INSTRUCTIONS.md`) containing optimized prompts for ChatGPT, Claude, or Gemini to auto-generate formatted vocabulary lists.

---

## Quick Start

### Option 1: Direct File Usage
Open `index.html` directly in any modern browser.

### Option 2: Local Web Server
```bash
# Clone repository
git clone https://github.com/AlexTheDevOnMicrobit/cross-word-generator.git
cd cross-word-generator

# Start local server
npm start
```
Then visit `http://localhost:8080` in your browser.

---

## Vocabulary List Format

Enter vocabulary lines into the input area or import a file using one of these supported syntaxes:

### Colon / Comma / Dash Separated
```text
FALL: Season following summer
OWL: Known for its hooting calls
CINNAMON, A popular fall spice
MAPLE - Type of autumn tree
```

### Markdown Table
```markdown
| Word | Clue |
| --- | --- |
| APPLE | A round red fruit |
| BREAD | Baked dough food |
```

### JSON Format
```json
[
  { "word": "APPLE", "clue": "A round red fruit" },
  { "word": "BREAD", "clue": "Baked dough food" }
]
```

---

## Testing

Run the automated Node.js unit test suite for generator and parser verification:

```bash
npm test
```

---

## License

Distributed under the MIT License.
