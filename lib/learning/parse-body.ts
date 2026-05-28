// ---------------------------------------------------------------------------
// parseBodyBlocks — converts lesson card body text to structured blocks.
//
// Lesson content is authored in a simple markdown-like format:
//   - Lines starting with "- " are unordered bullets
//   - Lines starting with "1. " etc. are numbered list items
//   - Lines starting with "|" are table rows (separator rows are dropped)
//   - All other non-empty lines are paragraph text
//   - **word** denotes bold inline text
//
// This is a pure function extracted from lesson-viewer.tsx so it can be
// unit-tested independently.
// ---------------------------------------------------------------------------

export type BodyBlock =
  | { kind: "para"; text: string }
  | { kind: "bullet"; items: string[] }
  | { kind: "ordered"; items: string[] }
  | { kind: "table"; rows: string[][] };

/** Parse body string into semantic blocks for structured rendering */
export function parseBodyBlocks(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  let currentBullets: string[] | null = null;
  let currentOrdered: string[] | null = null;
  let currentTable: string[][] | null = null;

  const flushBullets = () => {
    if (currentBullets) {
      blocks.push({ kind: "bullet", items: currentBullets });
      currentBullets = null;
    }
  };
  const flushOrdered = () => {
    if (currentOrdered) {
      blocks.push({ kind: "ordered", items: currentOrdered });
      currentOrdered = null;
    }
  };
  const flushTable = () => {
    if (currentTable) {
      blocks.push({ kind: "table", rows: currentTable });
      currentTable = null;
    }
  };

  for (const line of body.split("\n")) {
    // Table separator row (e.g. |---|------|): skip entirely
    if (/^\|[\s\-:|]+\|/.test(line)) continue;

    if (line.startsWith("|")) {
      // Table row — parse cells
      flushBullets();
      flushOrdered();
      const cells = line.split("|").slice(1, -1).map((s) => s.trim());
      if (!currentTable) currentTable = [];
      currentTable.push(cells);
    } else if (line.startsWith("- ")) {
      // Unordered bullet
      flushOrdered();
      flushTable();
      if (!currentBullets) currentBullets = [];
      currentBullets.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      // Numbered list item
      flushBullets();
      flushTable();
      if (!currentOrdered) currentOrdered = [];
      currentOrdered.push(line.replace(/^\d+\.\s/, ""));
    } else {
      // Regular paragraph or empty line — flush pending groups first
      flushBullets();
      flushOrdered();
      flushTable();
      if (line.trim()) blocks.push({ kind: "para", text: line });
    }
  }

  flushBullets();
  flushOrdered();
  flushTable();
  return blocks;
}
