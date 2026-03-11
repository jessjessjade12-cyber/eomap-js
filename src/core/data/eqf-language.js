import { StreamLanguage, LanguageSupport } from "@codemirror/language";

const BLOCK_KEYWORDS = new Set(["main", "state", "random"]);
const FIELD_KEYWORDS = new Set([
  // Main block declarations
  "questname",
  "version",
  "startnpc",
  "hidden",
  "hidden_end",
  "disabled",
  "minlevel",
  "maxlevel",
  "needadmin",
  "needclass",
  "needquest",
  // State declarations
  "desc",
  // Random block entries
  "coord",
  "item",
]);
const COMMAND_KEYWORDS = new Set(["action", "rule", "goto"]);

const eqfStreamParser = {
  token(stream) {
    if (stream.eatSpace()) return null;

    // Line comments
    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }

    // Strings
    if (stream.match('"')) {
      let escaped = false;
      while (!stream.eol()) {
        const ch = stream.next();
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') break;
      }
      return "string";
    }

    // Numbers (including decimals)
    if (stream.match(/^-?\d+(\.\d+)?/)) {
      return "number";
    }

    // Words: keywords or identifiers
    if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*/)) {
      const word = stream.current().toLowerCase();
      if (BLOCK_KEYWORDS.has(word)) return "keyword";
      if (FIELD_KEYWORDS.has(word)) return "attributeName";
      if (COMMAND_KEYWORDS.has(word)) return "operator";
      return "variableName";
    }

    // Braces
    if (stream.match(/^[{}]/)) return "bracket";

    // Parens and commas (argument lists)
    if (stream.match(/^[(),]/)) return "punctuation";

    // Semicolons
    if (stream.match(";")) return "punctuation";

    stream.next();
    return null;
  },
};

const eqfStreamLanguage = StreamLanguage.define(eqfStreamParser);

export const eqfLanguage = new LanguageSupport(eqfStreamLanguage);
