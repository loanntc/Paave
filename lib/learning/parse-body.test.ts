import { describe, it, expect } from "vitest";
import { parseBodyBlocks } from "./parse-body";

// ---------------------------------------------------------------------------
// parseBodyBlocks
// ---------------------------------------------------------------------------

describe("parseBodyBlocks", () => {
  // ── Paragraph blocks ───────────────────────────────────────────────────────

  it("returns a single para block for plain text", () => {
    const result = parseBodyBlocks("Hello world");
    expect(result).toEqual([{ kind: "para", text: "Hello world" }]);
  });

  it("returns multiple para blocks for multiple lines", () => {
    const result = parseBodyBlocks("Line one\nLine two");
    expect(result).toEqual([
      { kind: "para", text: "Line one" },
      { kind: "para", text: "Line two" },
    ]);
  });

  it("skips empty lines between paragraphs", () => {
    const result = parseBodyBlocks("Para one\n\nPara two");
    expect(result).toEqual([
      { kind: "para", text: "Para one" },
      { kind: "para", text: "Para two" },
    ]);
  });

  it("returns empty array for empty string", () => {
    expect(parseBodyBlocks("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(parseBodyBlocks("   \n  \n  ")).toEqual([]);
  });

  // ── Bullet lists ───────────────────────────────────────────────────────────

  it("groups consecutive bullet lines into a single bullet block", () => {
    const result = parseBodyBlocks("- First\n- Second\n- Third");
    expect(result).toEqual([
      { kind: "bullet", items: ["First", "Second", "Third"] },
    ]);
  });

  it("strips the leading dash-space from bullet items", () => {
    const result = parseBodyBlocks("- Hello");
    expect(result).toEqual([{ kind: "bullet", items: ["Hello"] }]);
  });

  it("flushes bullet group when a paragraph line breaks it", () => {
    const result = parseBodyBlocks("- Item A\n- Item B\nIntro line\n- Item C");
    expect(result).toEqual([
      { kind: "bullet", items: ["Item A", "Item B"] },
      { kind: "para", text: "Intro line" },
      { kind: "bullet", items: ["Item C"] },
    ]);
  });

  // ── Ordered lists ──────────────────────────────────────────────────────────

  it("groups consecutive numbered lines into a single ordered block", () => {
    const result = parseBodyBlocks("1. First\n2. Second\n3. Third");
    expect(result).toEqual([
      { kind: "ordered", items: ["First", "Second", "Third"] },
    ]);
  });

  it("strips the leading number-dot-space from ordered items", () => {
    const result = parseBodyBlocks("1. Hello");
    expect(result).toEqual([{ kind: "ordered", items: ["Hello"] }]);
  });

  it("handles multi-digit numbering", () => {
    const result = parseBodyBlocks("10. Tenth item");
    expect(result).toEqual([{ kind: "ordered", items: ["Tenth item"] }]);
  });

  it("flushes ordered group when bullet line interrupts", () => {
    const result = parseBodyBlocks("1. Step one\n2. Step two\n- Bullet");
    expect(result).toEqual([
      { kind: "ordered", items: ["Step one", "Step two"] },
      { kind: "bullet", items: ["Bullet"] },
    ]);
  });

  // ── Tables ─────────────────────────────────────────────────────────────────

  it("parses a simple two-column table", () => {
    const body = "| Header A | Header B |\n|---|---|\n| Cell 1 | Cell 2 |";
    const result = parseBodyBlocks(body);
    expect(result).toEqual([
      { kind: "table", rows: [["Header A", "Header B"], ["Cell 1", "Cell 2"]] },
    ]);
  });

  it("drops separator rows (dashes-only cells)", () => {
    const body = "| A | B |\n|---|---|\n| 1 | 2 |";
    const result = parseBodyBlocks(body);
    expect(result).toEqual([
      { kind: "table", rows: [["A", "B"], ["1", "2"]] },
    ]);
  });

  it("trims whitespace from table cells", () => {
    const body = "|  Left  |  Right  |";
    const result = parseBodyBlocks(body);
    expect(result).toEqual([
      { kind: "table", rows: [["Left", "Right"]] },
    ]);
  });

  it("flushes table when paragraph line interrupts", () => {
    const body = "| A | B |\nNote below";
    const result = parseBodyBlocks(body);
    expect(result).toEqual([
      { kind: "table", rows: [["A", "B"]] },
      { kind: "para", text: "Note below" },
    ]);
  });

  // ── Mixed content ──────────────────────────────────────────────────────────

  it("handles mixed paragraphs, bullets, and ordered lists", () => {
    const body = "Intro\n- A\n- B\n1. One\n2. Two\nOutro";
    const result = parseBodyBlocks(body);
    expect(result).toEqual([
      { kind: "para", text: "Intro" },
      { kind: "bullet", items: ["A", "B"] },
      { kind: "ordered", items: ["One", "Two"] },
      { kind: "para", text: "Outro" },
    ]);
  });

  it("flushes all pending blocks at end of input", () => {
    const result = parseBodyBlocks("- Last bullet");
    expect(result).toEqual([{ kind: "bullet", items: ["Last bullet"] }]);
  });
});
