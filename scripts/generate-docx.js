// Генерация PRESENTATION.docx из PRESENTATION.md
// Запуск: node scripts/generate-docx.js

const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
} = require("docx");

const MD_PATH = path.join(__dirname, "..", "PRESENTATION.md");
const OUT_PATH = path.join(__dirname, "..", "PRESENTATION.docx");

const md = fs.readFileSync(MD_PATH, "utf-8");
const lines = md.split("\n");

const NAVY = "0F2A22";
const COPPER = "7CB342";
const TEXT_DARK = "0F1F3D";
const TEXT_MID = "404B5C";
const TEXT_LIGHT = "8A95A8";
const BG_LIGHT = "F5F6F8";

// Inline-форматирование: **жирный** и *курсив*
function parseInline(text) {
  if (!text) return [new TextRun({ text: "", color: TEXT_DARK })];
  const runs = [];
  let cursor = 0;
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > cursor) {
      runs.push(
        new TextRun({ text: text.slice(cursor, m.index), color: TEXT_DARK, size: 22 })
      );
    }
    if (m[2] !== undefined) {
      runs.push(new TextRun({ text: m[2], bold: true, color: TEXT_DARK, size: 22 }));
    } else if (m[3] !== undefined) {
      runs.push(new TextRun({ text: m[3], italics: true, color: TEXT_DARK, size: 22 }));
    } else if (m[4] !== undefined) {
      runs.push(
        new TextRun({
          text: m[4],
          color: COPPER,
          font: "Consolas",
          size: 20,
        })
      );
    }
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) {
    runs.push(new TextRun({ text: text.slice(cursor), color: TEXT_DARK, size: 22 }));
  }
  return runs;
}

function heading(text, level) {
  const sizes = { 1: 40, 2: 32, 3: 26, 4: 22 };
  const colors = { 1: NAVY, 2: NAVY, 3: COPPER, 4: TEXT_DARK };
  return new Paragraph({
    spacing: { before: level === 1 ? 480 : 320, after: 200 },
    children: [
      new TextRun({
        text: text.replace(/^#+\s*/, "").replace(/[📋🗺📊🟢📤🛡✨💡🎯❓🏠🛎🛒]/g, "").trim(),
        bold: true,
        size: sizes[level] || 22,
        color: colors[level] || TEXT_DARK,
      }),
    ],
    heading: ["Heading1", "Heading2", "Heading3", "Heading4"][level - 1],
  });
}

function paragraph(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    children: parseInline(text),
  });
}

function bullet(text, indent = 0) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 360 + indent * 360 },
    bullet: { level: indent },
    children: parseInline(text),
  });
}

function quote(text) {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    indent: { left: 360 },
    children: [
      new TextRun({
        text: text.replace(/^>\s*/, ""),
        italics: true,
        color: TEXT_MID,
        size: 22,
      }),
    ],
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text,
        font: "Consolas",
        size: 18,
        color: TEXT_DARK,
      }),
    ],
  });
}

function hr() {
  return new Paragraph({
    spacing: { before: 240, after: 240 },
    border: {
      bottom: { color: TEXT_LIGHT, space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [new TextRun({ text: "" })],
  });
}

function buildTable(headerCells, bodyRows) {
  const headerRow = new TableRow({
    children: headerCells.map(
      (h) =>
        new TableCell({
          shading: { fill: BG_LIGHT },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: h, bold: true, color: NAVY, size: 20 }),
              ],
            }),
          ],
        })
    ),
  });
  const rows = bodyRows.map(
    (cells) =>
      new TableRow({
        children: cells.map(
          (c) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: parseInline(c),
                }),
              ],
            })
        ),
      })
  );
  return new Table({
    rows: [headerRow, ...rows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { color: TEXT_LIGHT, size: 4, style: BorderStyle.SINGLE },
      bottom: { color: TEXT_LIGHT, size: 4, style: BorderStyle.SINGLE },
      left: { color: TEXT_LIGHT, size: 4, style: BorderStyle.SINGLE },
      right: { color: TEXT_LIGHT, size: 4, style: BorderStyle.SINGLE },
      insideHorizontal: { color: TEXT_LIGHT, size: 4, style: BorderStyle.SINGLE },
      insideVertical: { color: TEXT_LIGHT, size: 4, style: BorderStyle.SINGLE },
    },
  });
}

// ─────────────── Парсер MD ───────────────
const elements = [];
let i = 0;
let codeBuffer = [];
let inCodeBlock = false;

while (i < lines.length) {
  const line = lines[i];

  // Code block
  if (line.startsWith("```")) {
    if (inCodeBlock) {
      // Закрыть блок
      elements.push(
        new Paragraph({
          spacing: { before: 200, after: 200 },
          shading: { fill: BG_LIGHT },
          children: [
            new TextRun({
              text: codeBuffer.join("\n"),
              font: "Consolas",
              size: 18,
              color: TEXT_DARK,
            }),
          ],
        })
      );
      codeBuffer = [];
      inCodeBlock = false;
    } else {
      inCodeBlock = true;
    }
    i++;
    continue;
  }

  if (inCodeBlock) {
    codeBuffer.push(line);
    i++;
    continue;
  }

  // Headings
  if (/^#\s/.test(line)) {
    elements.push(heading(line, 1));
    i++;
    continue;
  }
  if (/^##\s/.test(line)) {
    elements.push(heading(line, 2));
    i++;
    continue;
  }
  if (/^###\s/.test(line)) {
    elements.push(heading(line, 3));
    i++;
    continue;
  }
  if (/^####\s/.test(line)) {
    elements.push(heading(line, 4));
    i++;
    continue;
  }

  // Tables — собираем все строки подряд начинающиеся с |
  if (line.trim().startsWith("|") && i + 1 < lines.length && lines[i + 1].trim().startsWith("|") && /^\|[\s\-:|]+\|/.test(lines[i + 1])) {
    const headerRow = line
      .trim()
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
    i += 2; // skip separator
    const bodyRows = [];
    while (i < lines.length && lines[i].trim().startsWith("|")) {
      const row = lines[i]
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      bodyRows.push(row);
      i++;
    }
    elements.push(buildTable(headerRow, bodyRows));
    elements.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
    continue;
  }

  // Bullets — обычный
  const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
  if (bulletMatch) {
    const indent = Math.floor(bulletMatch[1].length / 2);
    elements.push(bullet(bulletMatch[2], indent));
    i++;
    continue;
  }

  // Numbered bullets
  const numberedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
  if (numberedMatch) {
    const indent = Math.floor(numberedMatch[1].length / 2);
    elements.push(bullet(numberedMatch[2], indent));
    i++;
    continue;
  }

  // Quote
  if (line.startsWith(">")) {
    elements.push(quote(line));
    i++;
    continue;
  }

  // HR
  if (/^---+$/.test(line.trim())) {
    elements.push(hr());
    i++;
    continue;
  }

  // Empty
  if (line.trim() === "") {
    i++;
    continue;
  }

  // Default paragraph
  elements.push(paragraph(line));
  i++;
}

// ─────────────── Документ ───────────────
const doc = new Document({
  creator: "O'LINE Portal Team",
  title: "Клиентский портал O'LINE — Презентация",
  description: "Полная презентация клиентского портала",
  styles: {
    default: {
      document: {
        run: {
          font: "Calibri",
          size: 22,
          color: TEXT_DARK,
        },
        paragraph: {
          spacing: { line: 360 },
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
        },
      },
      children: elements,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUT_PATH, buffer);
  console.log(`✓ Готово: ${OUT_PATH}`);
  console.log(`  Размер: ${(buffer.length / 1024).toFixed(1)} КБ`);
});
