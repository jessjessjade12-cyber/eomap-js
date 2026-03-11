const THEME_VARIABLE_NAMES = [
  "--app-accent",
  "--app-accent-foreground",
  "--app-bg",
  "--app-surface-1",
  "--app-surface-2",
  "--app-surface-3",
  "--app-border",
  "--app-text",
  "--app-text-muted",
  "--app-selection",
  "--app-hover",
  "--app-error",
  "--app-success",
  "--eqf-editor-bg",
  "--eqf-editor-fg",
  "--eqf-gutter-bg",
  "--eqf-gutter-fg",
  "--eqf-gutter-active-bg",
  "--eqf-gutter-active-fg",
  "--eqf-line-active-bg",
  "--eqf-selection-bg",
  "--eqf-selection-focused-bg",
  "--eqf-cursor",
  "--eqf-lint-error",
  "--eqf-lint-warning",
  "--eqf-tooltip-bg",
  "--eqf-tooltip-border",
  "--eqf-tooltip-fg",
  "--eqf-completion-selected-bg",
  "--eqf-completion-selected-fg",
  "--eqf-completion-detail",
  "--eqf-completion-detail-selected",
  "--eqf-completion-info-bg",
  "--eqf-completion-info-border",
  "--eqf-completion-info-fg",
  "--eqf-nav-bg",
  "--eqf-nav-border",
  "--eqf-nav-text",
  "--eqf-nav-muted",
  "--eqf-nav-hover-bg",
  "--eqf-nav-selected-bg",
  "--eqf-nav-selected-fg",
  "--eqf-toolbar-bg",
  "--eqf-toolbar-border",
  "--eqf-filename-fg",
  "--eqf-status-fg",
  "--eqf-button-bg",
  "--eqf-button-hover-bg",
  "--eqf-button-border",
  "--eqf-button-fg",
  "--eqf-input-bg",
  "--eqf-input-border",
  "--eqf-input-fg",
  "--eqf-keyword",
  "--eqf-operator",
  "--eqf-string",
  "--eqf-number",
  "--eqf-comment",
  "--eqf-bracket",
  "--eqf-punctuation",
  "--eqf-attribute",
  "--eqf-variable",
  "--pub-bg",
  "--pub-surface-1",
  "--pub-surface-2",
  "--pub-surface-3",
  "--pub-border",
  "--pub-text",
  "--pub-muted",
  "--pub-accent-bg",
  "--pub-accent-fg",
  "--pub-input-bg",
  "--pub-input-border",
  "--pub-input-fg",
  "--pub-hover-bg",
  "--pub-button-bg",
  "--pub-button-hover-bg",
  "--pub-button-border",
  "--pub-button-fg",
  "--pub-success",
  "--pub-error",
];

const SPECTRUM_OVERRIDE_VARIABLES = [
  "--spectrum-global-color-gray-200",
  "--spectrum-global-color-gray-300",
  "--spectrum-global-color-gray-400",
  "--spectrum-global-color-gray-800",
  "--spectrum-alias-highlight-hover",
  "--spectrum-alias-highlight-down",
];

const MAX_THEME_INCLUDE_DEPTH = 32;

function stripBOM(text) {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

function stripJSONComments(text) {
  let result = "";
  let inString = false;
  let escape = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < text.length; ++i) {
    const ch = text[i];
    const next = i + 1 < text.length ? text[i + 1] : "";

    if (inLineComment) {
      if (ch === "\n") {
        inLineComment = false;
        result += ch;
      } else if (ch === "\r") {
        inLineComment = false;
        result += ch;
      } else {
        result += " ";
      }
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        result += "  ";
        ++i;
      } else if (ch === "\n" || ch === "\r") {
        result += ch;
      } else {
        result += " ";
      }
      continue;
    }

    if (inString) {
      result += ch;
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      result += ch;
      continue;
    }

    if (ch === "/" && next === "/") {
      inLineComment = true;
      result += "  ";
      ++i;
      continue;
    }

    if (ch === "/" && next === "*") {
      inBlockComment = true;
      result += "  ";
      ++i;
      continue;
    }

    result += ch;
  }

  return result;
}

function stripTrailingCommas(text) {
  let result = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; ++i) {
    const ch = text[i];

    if (inString) {
      result += ch;
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      result += ch;
      continue;
    }

    if (ch === ",") {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) {
        ++j;
      }

      if (j < text.length && (text[j] === "}" || text[j] === "]")) {
        continue;
      }
    }

    result += ch;
  }

  return result;
}

function normalizePathSeparators(fsPath) {
  return fsPath.replace(/\\/g, "/");
}

function splitPathRootAndRest(fsPath) {
  const normalized = normalizePathSeparators(fsPath);

  if (/^[A-Za-z]:\//.test(normalized)) {
    return {
      root: normalized.slice(0, 3),
      rest: normalized.slice(3),
    };
  }

  if (normalized.startsWith("//")) {
    const parts = normalized.slice(2).split("/");
    if (parts.length >= 2) {
      return {
        root: `//${parts[0]}/${parts[1]}/`,
        rest: parts.slice(2).join("/"),
      };
    }
  }

  if (normalized.startsWith("/")) {
    return {
      root: "/",
      rest: normalized.slice(1),
    };
  }

  return {
    root: "",
    rest: normalized,
  };
}

function normalizePath(fsPath) {
  const { root, rest } = splitPathRootAndRest(fsPath);
  const segments = rest.split("/").filter((segment) => segment.length > 0);
  const stack = [];

  for (const segment of segments) {
    if (segment === ".") {
      continue;
    }

    if (segment === "..") {
      if (stack.length > 0 && stack[stack.length - 1] !== "..") {
        stack.pop();
      } else if (!root) {
        stack.push("..");
      }
      continue;
    }

    stack.push(segment);
  }

  const joined = stack.join("/");

  if (root) {
    return `${root}${joined}`;
  }

  return joined.length > 0 ? joined : ".";
}

function dirname(fsPath) {
  const normalized = normalizePathSeparators(fsPath).replace(/\/+$/, "");
  const index = normalized.lastIndexOf("/");

  if (index === -1) {
    return ".";
  }

  if (index === 0) {
    return "/";
  }

  return normalized.slice(0, index);
}

function basename(fsPath) {
  const normalized = normalizePathSeparators(fsPath).replace(/\/+$/, "");
  const index = normalized.lastIndexOf("/");

  if (index === -1) {
    return normalized;
  }

  return normalized.slice(index + 1);
}

function isAbsolutePath(fsPath) {
  const normalized = normalizePathSeparators(fsPath);
  return (
    normalized.startsWith("/") ||
    normalized.startsWith("//") ||
    /^[A-Za-z]:\//.test(normalized)
  );
}

function pathSeparator(fsPath) {
  return fsPath.includes("\\") ? "\\" : "/";
}

function normalizeTokenColors(tokenColors) {
  if (Array.isArray(tokenColors)) {
    return tokenColors;
  }
  return [];
}

function mergeThemeObjects(baseTheme, extensionTheme) {
  const mergedTheme = {
    ...baseTheme,
    ...extensionTheme,
  };

  const baseColors =
    baseTheme &&
    typeof baseTheme.colors === "object" &&
    !Array.isArray(baseTheme.colors)
      ? baseTheme.colors
      : {};
  const extensionColors =
    extensionTheme &&
    typeof extensionTheme.colors === "object" &&
    !Array.isArray(extensionTheme.colors)
      ? extensionTheme.colors
      : {};

  const mergedColors = {
    ...baseColors,
    ...extensionColors,
  };

  if (Object.keys(mergedColors).length > 0) {
    mergedTheme.colors = mergedColors;
  }

  const mergedTokenColors = [
    ...normalizeTokenColors(baseTheme?.tokenColors),
    ...normalizeTokenColors(extensionTheme?.tokenColors),
  ];

  if (mergedTokenColors.length > 0) {
    mergedTheme.tokenColors = mergedTokenColors;
  } else {
    delete mergedTheme.tokenColors;
  }

  const baseSemanticColors =
    baseTheme &&
    typeof baseTheme.semanticTokenColors === "object" &&
    !Array.isArray(baseTheme.semanticTokenColors)
      ? baseTheme.semanticTokenColors
      : {};
  const extensionSemanticColors =
    extensionTheme &&
    typeof extensionTheme.semanticTokenColors === "object" &&
    !Array.isArray(extensionTheme.semanticTokenColors)
      ? extensionTheme.semanticTokenColors
      : {};

  const mergedSemanticTokenColors = {
    ...baseSemanticColors,
    ...extensionSemanticColors,
  };

  if (Object.keys(mergedSemanticTokenColors).length > 0) {
    mergedTheme.semanticTokenColors = mergedSemanticTokenColors;
  } else {
    delete mergedTheme.semanticTokenColors;
  }

  delete mergedTheme.include;

  return mergedTheme;
}

function normalizeSemanticTokenColorValue(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (
    value &&
    typeof value === "object" &&
    typeof value.foreground === "string" &&
    value.foreground.trim()
  ) {
    return value.foreground.trim();
  }

  return null;
}

function semanticTokenColor(semanticTokenColors, keys, fallback) {
  if (
    !semanticTokenColors ||
    typeof semanticTokenColors !== "object" ||
    Array.isArray(semanticTokenColors)
  ) {
    return fallback;
  }

  for (const key of keys) {
    const value = normalizeSemanticTokenColorValue(semanticTokenColors[key]);
    if (value) {
      return value;
    }
  }

  return fallback;
}

function pickColor(colors, keys, fallback) {
  if (!colors) {
    return fallback;
  }

  for (const key of keys) {
    const value = colors[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function normalizeScopes(scope) {
  if (!scope) {
    return [];
  }

  if (Array.isArray(scope)) {
    return scope
      .filter((item) => typeof item === "string")
      .map((item) => item.toLowerCase());
  }

  if (typeof scope === "string") {
    return [scope.toLowerCase()];
  }

  return [];
}

function tokenColor(tokenColors, scopeMatchers, fallback) {
  if (!Array.isArray(tokenColors)) {
    return fallback;
  }

  for (let i = tokenColors.length - 1; i >= 0; --i) {
    const token = tokenColors[i];
    const foreground = token?.settings?.foreground;
    if (!foreground || typeof foreground !== "string") {
      continue;
    }

    const scopes = normalizeScopes(token.scope);
    if (scopes.length === 0) {
      continue;
    }

    const matches = scopeMatchers.some((matcher) =>
      scopes.some(
        (scope) =>
          scope === matcher ||
          scope.startsWith(`${matcher}.`) ||
          scope.includes(matcher),
      ),
    );

    if (matches) {
      return foreground.trim();
    }
  }

  return fallback;
}

async function resolveTokenColorReference(themeJson, options) {
  if (typeof themeJson?.tokenColors !== "string") {
    return themeJson;
  }

  if (!options.sourcePath || typeof options.loadByPath !== "function") {
    return themeJson;
  }

  const tokenColorPath = resolveRelativeThemePath(
    options.sourcePath,
    themeJson.tokenColors,
  );

  let tokenColorText;
  try {
    tokenColorText = await options.loadByPath(tokenColorPath);
  } catch {
    return themeJson;
  }

  if (typeof tokenColorText !== "string" || !tokenColorText.trim()) {
    return themeJson;
  }

  if (tokenColorText.trimStart().startsWith("<")) {
    return themeJson;
  }

  let parsed;
  try {
    parsed = parseVSCodeJson(
      tokenColorText,
      `token colors '${tokenColorPath}'`,
    );
  } catch {
    return themeJson;
  }

  if (Array.isArray(parsed)) {
    return {
      ...themeJson,
      tokenColors: parsed,
    };
  }

  if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.tokenColors)) {
      return {
        ...themeJson,
        tokenColors: parsed.tokenColors,
      };
    }

    if (Array.isArray(parsed.settings)) {
      return {
        ...themeJson,
        tokenColors: parsed.settings,
      };
    }
  }

  return themeJson;
}

export function parseVSCodeJson(text, sourceName = "theme file") {
  if (typeof text !== "string") {
    throw new Error(`${sourceName} must be text.`);
  }

  const sanitizedText = stripTrailingCommas(stripJSONComments(stripBOM(text)));

  try {
    return JSON.parse(sanitizedText);
  } catch (error) {
    throw new Error(`Failed to parse ${sourceName}: ${error.message}`);
  }
}

export function deriveVSCodeThemeTypeFromUiTheme(uiTheme) {
  if (typeof uiTheme !== "string") {
    return "dark";
  }

  const normalized = uiTheme.toLowerCase();
  if (normalized.includes("light")) {
    return "light";
  }

  return "dark";
}

export function getVSCodeThemeEntriesFromPackageJson(packageJson) {
  const themes = packageJson?.contributes?.themes;

  if (!Array.isArray(themes)) {
    return [];
  }

  return themes
    .filter(
      (theme) =>
        theme && typeof theme === "object" && typeof theme.path === "string",
    )
    .map((theme, index) => {
      const label =
        typeof theme.label === "string" && theme.label.trim()
          ? theme.label.trim()
          : typeof theme.id === "string" && theme.id.trim()
            ? theme.id.trim()
            : `Theme ${index + 1}`;

      return {
        index,
        label,
        path: theme.path,
        type: deriveVSCodeThemeTypeFromUiTheme(theme.uiTheme),
      };
    });
}

export function resolveRelativeThemePath(baseThemePath, relativeThemePath) {
  if (typeof baseThemePath !== "string" || !baseThemePath.trim()) {
    throw new Error("A base theme path is required to resolve includes.");
  }

  if (typeof relativeThemePath !== "string" || !relativeThemePath.trim()) {
    throw new Error("Theme include path must be a non-empty string.");
  }

  const separator = pathSeparator(baseThemePath);
  const normalizedRelativePath = normalizePathSeparators(
    relativeThemePath.trim(),
  );

  const resolvedPath = isAbsolutePath(normalizedRelativePath)
    ? normalizePath(normalizedRelativePath)
    : normalizePath(
        `${dirname(normalizePathSeparators(baseThemePath))}/${normalizedRelativePath}`,
      );

  return resolvedPath.replace(/\//g, separator);
}

export async function resolveVSCodeTheme(themeJson, options = {}) {
  if (!themeJson || typeof themeJson !== "object") {
    throw new Error("Theme file must be a JSON object.");
  }

  const loadByPath =
    typeof options.loadByPath === "function" ? options.loadByPath : null;
  const sourcePath =
    typeof options.sourcePath === "string" && options.sourcePath.trim()
      ? options.sourcePath
      : null;
  const maxDepth =
    typeof options.maxDepth === "number"
      ? options.maxDepth
      : MAX_THEME_INCLUDE_DEPTH;
  const depth = typeof options.depth === "number" ? options.depth : 0;
  const seenPaths =
    options.seenPaths instanceof Set ? options.seenPaths : new Set();

  if (depth > maxDepth) {
    throw new Error("Theme include depth limit exceeded.");
  }

  let resolvedTheme = {
    ...themeJson,
  };

  const include =
    typeof resolvedTheme.include === "string"
      ? resolvedTheme.include.trim()
      : "";

  if (include) {
    if (!sourcePath || !loadByPath) {
      throw new Error(
        "Theme includes are not supported in this environment for the selected file.",
      );
    }

    const includePath = resolveRelativeThemePath(sourcePath, include);
    const includePathKey = normalizePathSeparators(includePath).toLowerCase();

    if (seenPaths.has(includePathKey)) {
      throw new Error(`Circular theme include detected at '${includePath}'.`);
    }

    seenPaths.add(includePathKey);

    let includeText;
    try {
      includeText = await loadByPath(includePath);
    } catch (error) {
      throw new Error(
        `Failed to load included theme '${include}': ${error.message}`,
      );
    }

    const includeThemeJson = parseVSCodeJson(
      includeText,
      `included theme '${include}'`,
    );
    const resolvedIncludeTheme = await resolveVSCodeTheme(includeThemeJson, {
      ...options,
      sourcePath: includePath,
      seenPaths,
      depth: depth + 1,
      maxDepth,
    });

    seenPaths.delete(includePathKey);
    resolvedTheme = mergeThemeObjects(resolvedIncludeTheme, resolvedTheme);
  }

  resolvedTheme = await resolveTokenColorReference(resolvedTheme, {
    sourcePath,
    loadByPath,
  });

  delete resolvedTheme.include;

  return resolvedTheme;
}

export function convertVSCodeThemeToCustomTheme(themeJson) {
  if (!themeJson || typeof themeJson !== "object") {
    throw new Error("Theme file must be a JSON object.");
  }

  const colors = themeJson.colors || {};
  const tokenColors = Array.isArray(themeJson.tokenColors)
    ? themeJson.tokenColors
    : [];
  const semanticTokenColors = themeJson.semanticTokenColors || {};

  const uiText = pickColor(
    colors,
    ["foreground", "editor.foreground"],
    "#d4d4d4",
  );
  const uiMuted = pickColor(
    colors,
    ["descriptionForeground", "disabledForeground"],
    "#9f9f9f",
  );
  const uiBg = pickColor(
    colors,
    ["editor.background", "sideBar.background", "activityBar.background"],
    "#1e1e1e",
  );
  const surface1 = pickColor(
    colors,
    ["sideBar.background", "editorGroupHeader.tabsBackground"],
    "#252526",
  );
  const surface2 = pickColor(
    colors,
    [
      "titleBar.activeBackground",
      "panel.background",
      "editorWidget.background",
    ],
    "#2d2d2d",
  );
  const surface3 = pickColor(
    colors,
    ["dropdown.background", "list.inactiveSelectionBackground"],
    "#2b2b2b",
  );
  const border = pickColor(
    colors,
    ["panel.border", "editorGroup.border", "contrastBorder"],
    "#3e3e3e",
  );
  const accent = pickColor(
    colors,
    ["button.background", "list.activeSelectionBackground", "focusBorder"],
    "#0e639c",
  );
  const accentForeground = pickColor(
    colors,
    ["button.foreground", "list.activeSelectionForeground"],
    "#ffffff",
  );
  const selection = pickColor(
    colors,
    ["editor.selectionBackground", "selection.background"],
    "rgba(97,175,239,0.25)",
  );
  const hover = pickColor(
    colors,
    ["list.hoverBackground", "editorHoverWidget.background"],
    "#2c313c",
  );
  const error = pickColor(
    colors,
    ["errorForeground", "editorError.foreground"],
    "#e06c75",
  );
  const warning = pickColor(
    colors,
    ["editorWarning.foreground", "warningForeground"],
    "#e5c07b",
  );
  const success = pickColor(colors, ["terminal.ansiGreen"], "#98c379");

  const keyword = tokenColor(
    tokenColors,
    ["keyword", "storage.type", "storage.modifier"],
    semanticTokenColor(semanticTokenColors, ["keyword"], "#61afef"),
  );
  const operator = tokenColor(
    tokenColors,
    ["keyword.operator", "operator"],
    semanticTokenColor(semanticTokenColors, ["operator"], "#c678dd"),
  );
  const string = tokenColor(
    tokenColors,
    ["string"],
    semanticTokenColor(semanticTokenColors, ["string"], "#98c379"),
  );
  const number = tokenColor(
    tokenColors,
    ["constant.numeric", "number"],
    semanticTokenColor(semanticTokenColors, ["number"], "#d19a66"),
  );
  const comment = tokenColor(
    tokenColors,
    ["comment"],
    semanticTokenColor(semanticTokenColors, ["comment"], "#5c6370"),
  );
  const bracket = tokenColor(
    tokenColors,
    ["punctuation.bracket", "punctuation.section.brackets"],
    semanticTokenColor(semanticTokenColors, ["regexp"], "#56b6c2"),
  );
  const punctuation = tokenColor(tokenColors, ["punctuation"], uiText);
  const attribute = tokenColor(
    tokenColors,
    ["entity.other.attribute-name", "variable.parameter"],
    semanticTokenColor(
      semanticTokenColors,
      ["property", "parameter"],
      "#e5c07b",
    ),
  );
  const variable = tokenColor(
    tokenColors,
    ["variable", "entity.name"],
    semanticTokenColor(semanticTokenColors, ["variable", "parameter"], uiText),
  );

  const variables = {
    "--app-accent": accent,
    "--app-accent-foreground": accentForeground,
    "--app-bg": uiBg,
    "--app-surface-1": surface1,
    "--app-surface-2": surface2,
    "--app-surface-3": surface3,
    "--app-border": border,
    "--app-text": uiText,
    "--app-text-muted": uiMuted,
    "--app-selection": selection,
    "--app-hover": hover,
    "--app-error": error,
    "--app-success": success,
    "--eqf-editor-bg": uiBg,
    "--eqf-editor-fg": uiText,
    "--eqf-gutter-bg": pickColor(colors, ["editorGutter.background"], surface1),
    "--eqf-gutter-fg": pickColor(
      colors,
      ["editorLineNumber.foreground", "editorLineNumber.activeForeground"],
      uiMuted,
    ),
    "--eqf-gutter-active-bg": pickColor(
      colors,
      ["editor.lineHighlightBackground"],
      hover,
    ),
    "--eqf-gutter-active-fg": pickColor(
      colors,
      ["editorLineNumber.activeForeground"],
      uiText,
    ),
    "--eqf-line-active-bg": pickColor(
      colors,
      ["editor.lineHighlightBackground"],
      "rgba(255,255,255,0.04)",
    ),
    "--eqf-selection-bg": selection,
    "--eqf-selection-focused-bg": selection,
    "--eqf-cursor": pickColor(colors, ["editorCursor.foreground"], accent),
    "--eqf-lint-error": error,
    "--eqf-lint-warning": warning,
    "--eqf-tooltip-bg": pickColor(
      colors,
      ["editorHoverWidget.background"],
      surface1,
    ),
    "--eqf-tooltip-border": pickColor(
      colors,
      ["editorHoverWidget.border", "editorWidget.border"],
      border,
    ),
    "--eqf-tooltip-fg": uiText,
    "--eqf-completion-selected-bg": pickColor(
      colors,
      [
        "list.activeSelectionBackground",
        "editorSuggestWidget.selectedBackground",
      ],
      hover,
    ),
    "--eqf-completion-selected-fg": pickColor(
      colors,
      [
        "list.activeSelectionForeground",
        "editorSuggestWidget.selectedForeground",
      ],
      accentForeground,
    ),
    "--eqf-completion-detail": uiMuted,
    "--eqf-completion-detail-selected": uiMuted,
    "--eqf-completion-info-bg": pickColor(
      colors,
      ["editorWidget.background"],
      surface1,
    ),
    "--eqf-completion-info-border": pickColor(
      colors,
      ["editorWidget.border"],
      border,
    ),
    "--eqf-completion-info-fg": uiText,
    "--eqf-nav-bg": surface1,
    "--eqf-nav-border": border,
    "--eqf-nav-text": uiText,
    "--eqf-nav-muted": uiMuted,
    "--eqf-nav-hover-bg": hover,
    "--eqf-nav-selected-bg": accent,
    "--eqf-nav-selected-fg": accentForeground,
    "--eqf-toolbar-bg": surface2,
    "--eqf-toolbar-border": border,
    "--eqf-filename-fg": uiMuted,
    "--eqf-status-fg": success,
    "--eqf-button-bg": surface3,
    "--eqf-button-hover-bg": hover,
    "--eqf-button-border": border,
    "--eqf-button-fg": uiText,
    "--eqf-input-bg": surface3,
    "--eqf-input-border": border,
    "--eqf-input-fg": uiText,
    "--eqf-keyword": keyword,
    "--eqf-operator": operator,
    "--eqf-string": string,
    "--eqf-number": number,
    "--eqf-comment": comment,
    "--eqf-bracket": bracket,
    "--eqf-punctuation": punctuation,
    "--eqf-attribute": attribute,
    "--eqf-variable": variable,
    "--pub-bg": uiBg,
    "--pub-surface-1": surface1,
    "--pub-surface-2": surface2,
    "--pub-surface-3": surface3,
    "--pub-border": border,
    "--pub-text": uiText,
    "--pub-muted": uiMuted,
    "--pub-accent-bg": accent,
    "--pub-accent-fg": accentForeground,
    "--pub-input-bg": surface3,
    "--pub-input-border": border,
    "--pub-input-fg": uiText,
    "--pub-hover-bg": hover,
    "--pub-button-bg": surface3,
    "--pub-button-hover-bg": hover,
    "--pub-button-border": border,
    "--pub-button-fg": uiText,
    "--pub-success": success,
    "--pub-error": error,
  };

  return {
    name: themeJson.name || "Custom VSCode Theme",
    type: themeJson.type || "dark",
    colorMode: themeJson.type === "light" ? "light" : "darkest",
    variables,
  };
}

export function applyCustomTheme(customTheme) {
  const themeNode =
    document.querySelector("body > sp-theme") ||
    document.querySelector("sp-theme");
  if (!themeNode) {
    return;
  }

  for (const name of THEME_VARIABLE_NAMES) {
    themeNode.style.removeProperty(name);
  }
  for (const name of SPECTRUM_OVERRIDE_VARIABLES) {
    themeNode.style.removeProperty(name);
  }

  if (!customTheme) {
    themeNode.setAttribute("color", "darkest");
    return;
  }

  themeNode.setAttribute(
    "color",
    customTheme.colorMode === "light" ? "light" : "darkest",
  );

  const variables = customTheme.variables || {};
  for (const [name, value] of Object.entries(variables)) {
    if (typeof value === "string" && value.trim()) {
      themeNode.style.setProperty(name, value.trim());
    }
  }

  const appBg = variables["--app-bg"];
  const surface1 = variables["--app-surface-1"];
  const surface3 = variables["--app-surface-3"];
  const appText = variables["--app-text"];
  const hover = variables["--app-hover"];

  if (appBg) {
    themeNode.style.setProperty("--spectrum-global-color-gray-200", appBg);
  }
  if (surface1) {
    themeNode.style.setProperty("--spectrum-global-color-gray-300", surface1);
  }
  if (surface3) {
    themeNode.style.setProperty("--spectrum-global-color-gray-400", surface3);
  }
  if (appText) {
    themeNode.style.setProperty("--spectrum-global-color-gray-800", appText);
  }
  if (hover) {
    themeNode.style.setProperty("--spectrum-alias-highlight-hover", hover);
    themeNode.style.setProperty("--spectrum-alias-highlight-down", hover);
  }
}
