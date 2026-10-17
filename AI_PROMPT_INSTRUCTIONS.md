# AI Prompt Instructions for Generating Puzzle Vocabulary Lists (v1.2.0)

Copy and send the prompt template below to any AI model (such as ChatGPT, Claude, or Gemini) to automatically generate a vocabulary list perfectly formatted for **Puzzle Craft** (supporting Crosswords, Fill-In Puzzles, and Word Searches).

---

## Copy & Paste AI Prompt Template

```text
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
```

---

## Supported Formats in Puzzle Craft

1. **Colon Separated (Recommended):**
   ```text
   WORD: Clue text goes here
   ```
2. **Comma / Dash Separated:**
   ```text
   WORD, Clue text goes here
   WORD - Clue text goes here
   ```
3. **Markdown Table:**
   ```markdown
   | Word | Clue |
   | --- | --- |
   | APPLE | A round fruit |
   | BREAD | Baked food |
   ```
4. **JSON Array:**
   ```json
   [
     { "word": "APPLE", "clue": "A round fruit" },
     { "word": "BREAD", "clue": "Baked food" }
   ]
   ```
