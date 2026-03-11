import { snippet } from "@codemirror/autocomplete";

import {
  QUEST_ACTION_TEMPLATES,
  QUEST_RULE_TEMPLATES,
  QUEST_MAIN_DECLARATION_TEMPLATES,
} from "./quest-syntax";

// ── Snippet helpers ────────────────────────────────────────────────────────────

/**
 * Convert an EQF example snippet to a CodeMirror snippet template.
 * Numeric literals and quoted strings become named tab-stop fields.
 *
 * "AddNpcText(13, "Hi");"  →  snippet('AddNpcText(#{13}, "#{Hi}");')
 */
function toSnippetTemplate(rawSnippet) {
  // We only transform the content inside the first set of parens.
  return rawSnippet.replace(/\(([^)]*)\)/, (_match, inner) => {
    const fields = inner.split(",").map((arg) => {
      const trimmed = arg.trim();
      // Quoted string → #{content}
      const strMatch = trimmed.match(/^"(.*)"$/);
      if (strMatch) return `"#{${strMatch[1]}}"`;
      // Plain value → #{value}
      return `#{${trimmed}}`;
    });
    return `(${fields.join(", ")})`;
  });
}

// Pre-build completion options so we only do this work once.
const ACTION_COMPLETIONS = QUEST_ACTION_TEMPLATES.map((t) => ({
  label: t.name,
  detail: extractCallSignature(t.snippet),
  info: t.description || undefined,
  type: "function",
  apply: snippet(toSnippetTemplate(t.snippet)),
  boost: 1,
}));

const RULE_COMPLETIONS = QUEST_RULE_TEMPLATES.map((t) => ({
  label: t.name,
  detail: extractRuleSignature(t.snippet),
  type: "function",
  apply: snippet(toSnippetTemplate(t.snippet)),
  boost: 1,
}));

const STATE_DECLARATIONS = ["desc", "action", "rule"];
const STATE_DECLARATION_COMPLETIONS = STATE_DECLARATIONS.map((kw) => ({
  label: kw,
  type: "keyword",
}));

const MAIN_DECLARATION_COMPLETIONS = QUEST_MAIN_DECLARATION_TEMPLATES.map(
  (decl) => ({
    label: decl.split(/\s+/)[0], // just the keyword
    detail: decl.includes(" ") ? decl.slice(decl.indexOf(" ") + 1) : "",
    type: "keyword",
    apply: decl,
  }),
);

// ── Signature extractors ───────────────────────────────────────────────────────

function extractCallSignature(rawSnippet) {
  const m = rawSnippet.match(/\(([^)]*)\)/);
  return m ? `(${m[1]})` : "";
}

function extractRuleSignature(rawSnippet) {
  const m = rawSnippet.match(/(\([^)]*\))\s+goto\s+(\S+)/);
  return m ? `${m[1]} goto ${m[2]}` : "";
}

// ── Context parser ─────────────────────────────────────────────────────────────

/**
 * Scan backwards from lineIndex to figure out which block type we're in.
 * Returns "state" | "main" | "random" | "none".
 */
function enclosingBlockType(lines, lineIndex) {
  let depth = 0;
  for (let i = lineIndex; i >= 0; i--) {
    const text = lines[i].trim();
    // Count braces on this line (simplified: single-line blocks)
    for (const ch of lines[i]) {
      if (ch === "}") depth++;
      if (ch === "{") depth--;
    }
    if (depth < 0) {
      // We just crossed an opening brace — the header is likely on a prior line
      // Look for the block header on lines before the brace
      for (let j = i; j >= Math.max(0, i - 2); j--) {
        const header = lines[j].trim();
        if (/^State\b/i.test(header)) return "state";
        if (/^Main\b/i.test(header)) return "main";
        if (/^random\b/i.test(header)) return "random";
      }
      return "none";
    }
  }
  return "none";
}

function docStateNames(doc) {
  const names = [];
  const text = doc.toString();
  for (const line of text.split("\n")) {
    const m = line.match(/^State\s+(\S+)/i);
    if (m) names.push(m[1]);
  }
  return names;
}

// ── Main completion source ─────────────────────────────────────────────────────

export function eqfCompletionSource(context) {
  const line = context.state.doc.lineAt(context.pos);
  const lineText = line.text;
  const col = context.pos - line.from;
  const before = lineText.slice(0, col);

  // 1. After "action <typing>"
  const actionMatch = before.match(/^\s*action\s+([A-Za-z_]*)$/i);
  if (actionMatch) {
    return {
      from: context.pos - actionMatch[1].length,
      options: ACTION_COMPLETIONS,
      validFor: /^[A-Za-z_][A-Za-z0-9_]*$/,
    };
  }

  // 2. After "rule <typing>"
  const ruleMatch = before.match(/^\s*rule\s+([A-Za-z_]*)$/i);
  if (ruleMatch) {
    return {
      from: context.pos - ruleMatch[1].length,
      options: RULE_COMPLETIONS,
      validFor: /^[A-Za-z_][A-Za-z0-9_]*$/,
    };
  }

  // 3. After "goto <typing>" — complete with known state names
  const gotoMatch = before.match(/\bgoto\s+([A-Za-z_]*)$/i);
  if (gotoMatch) {
    const names = docStateNames(context.state.doc);
    return {
      from: context.pos - gotoMatch[1].length,
      options: names.map((n) => ({ label: n, type: "variable" })),
      validFor: /^[A-Za-z_][A-Za-z0-9_]*$/,
    };
  }

  // 4. At start-of-line keyword (e.g. typing "ac" → "action")
  const lineStartMatch = before.match(/^\s*([A-Za-z_]*)$/);
  if (lineStartMatch && (context.explicit || lineStartMatch[1].length > 0)) {
    const lines = context.state.doc.toString().split("\n");
    const lineIndex = context.state.doc.lineAt(context.pos).number - 1;
    const blockType = enclosingBlockType(lines, lineIndex);

    if (blockType === "state") {
      return {
        from: context.pos - lineStartMatch[1].length,
        options: STATE_DECLARATION_COMPLETIONS,
        validFor: /^[A-Za-z_]*$/,
      };
    }
    if (blockType === "main") {
      return {
        from: context.pos - lineStartMatch[1].length,
        options: MAIN_DECLARATION_COMPLETIONS,
        validFor: /^[A-Za-z_]*$/,
      };
    }
  }

  return null;
}
