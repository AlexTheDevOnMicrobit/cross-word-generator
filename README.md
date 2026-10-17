# Puzzle Craft - Crossword & Word Search Generator (v1.0.0)

A web-based generator for creating printable **Crosswords** and **Word Searches ("Mots Mêlés")** from custom vocabulary lists. Designed for educators, content creators, and puzzle enthusiasts.

---

## Features

- **Dual Puzzle Modes:**
  - **Crossword Engine:** Automatic intersection grid placement with random-restart layout optimization and Across/Down numbering.
  - **Word Search ("Mots Mêlés"):** 8-directional word placement with custom filler alphabets (Standard English A–Z or French accented characters).

- **Multi-Format Vocabulary Import:**
  - Raw text input with syntax detection (`WORD: Clue`, `WORD, Clue`, or `WORD - Clue`).
  - File upload support for `.txt`, `.csv`, `.md` (Markdown tables), and `.json`.
  - Accent normalization and non-alphanumeric filtering.

- **Worksheet Styling & Customization:**
  - Custom title and subtitle headers.
  - Custom font selection (Sans-serif, Monospace, Serif, Casual/School).
  - Configurable grid line and accent colors.
  - Multi-column clue layouts (1, 2, or 3 columns).

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
