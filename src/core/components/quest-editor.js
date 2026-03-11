import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  syntaxHighlighting,
  HighlightStyle,
  indentUnit,
} from "@codemirror/language";
import {
  history,
  defaultKeymap,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { linter, lintGutter } from "@codemirror/lint";
import {
  autocompletion,
  completionKeymap,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { tags } from "@lezer/highlight";

import { eqfLanguage } from "../data/eqf-language";
import { createEqfLinter } from "../data/eqf-lint";
import { eqfCompletionSource } from "../data/eqf-completions";
import scrollbarStyles from "../styles/scrollbar";

const INITIAL_DOC = `Main
{
\tquestname\t"New Quest"
\tversion\t\t1.0
}

State Begin
{
\t// desc "Objective text shown in quest log"
\t// action AddNpcText(13, "Hello.");
\t// rule TalkedToNpc(13) goto Begin
}
`;

// One Dark-inspired dark theme
const eqfTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      fontSize: "13px",
      fontFamily: "'Source Code Pro', Monaco, Consolas, monospace",
      backgroundColor: "var(--eqf-editor-bg)",
      color: "var(--eqf-editor-fg)",
    },
    ".cm-scroller": {
      overflow: "auto",
      lineHeight: "1.6",
    },
    ".cm-content": {
      caretColor: "var(--eqf-cursor)",
      padding: "12px 0",
    },
    ".cm-line": {
      padding: "0 16px",
    },
    ".cm-gutters": {
      backgroundColor: "var(--eqf-gutter-bg)",
      color: "var(--eqf-gutter-fg)",
      border: "none",
      borderRight: "1px solid var(--eqf-nav-border)",
      minWidth: "48px",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 8px 0 4px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--eqf-gutter-active-bg)",
      color: "var(--eqf-gutter-active-fg)",
    },
    ".cm-activeLine": {
      backgroundColor: "var(--eqf-line-active-bg)",
    },
    ".cm-selectionBackground": {
      backgroundColor: "var(--eqf-selection-bg) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--eqf-selection-focused-bg)",
    },
    ".cm-cursor": {
      borderLeftColor: "var(--eqf-cursor)",
      borderLeftWidth: "2px",
    },
    // Lint squiggles
    ".cm-lintRange-error": {
      backgroundImage: "none",
      textDecoration: "underline wavy var(--eqf-lint-error)",
      textUnderlineOffset: "3px",
    },
    ".cm-lintRange-warning": {
      backgroundImage: "none",
      textDecoration: "underline wavy var(--eqf-lint-warning)",
      textUnderlineOffset: "3px",
    },
    // Lint gutter markers
    ".cm-gutter-lint": {
      width: "18px",
    },
    ".cm-lint-marker-error": {
      content: "none",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "var(--eqf-lint-error)",
      display: "block",
      margin: "auto",
    },
    ".cm-lint-marker-warning": {
      content: "none",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "var(--eqf-lint-warning)",
      display: "block",
      margin: "auto",
    },
    // Tooltips
    ".cm-tooltip": {
      backgroundColor: "var(--eqf-tooltip-bg)",
      border: "1px solid var(--eqf-tooltip-border)",
      borderRadius: "4px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      fontSize: "12px",
      color: "var(--eqf-tooltip-fg)",
      padding: "0",
    },
    ".cm-tooltip-lint": {
      padding: "6px 10px",
    },
    // Autocomplete dropdown
    ".cm-tooltip.cm-tooltip-autocomplete": {
      padding: "0",
      "& > ul": {
        fontFamily: "'Source Code Pro', Monaco, Consolas, monospace",
        fontSize: "12px",
        maxHeight: "220px",
      },
      "& > ul > li": {
        padding: "3px 10px 3px 6px",
        lineHeight: "1.5",
        color: "var(--eqf-tooltip-fg)",
      },
      "& > ul > li[aria-selected]": {
        backgroundColor: "var(--eqf-completion-selected-bg)",
        color: "var(--eqf-completion-selected-fg)",
      },
    },
    ".cm-completionLabel": {
      fontFamily: "'Source Code Pro', Monaco, Consolas, monospace",
    },
    ".cm-completionDetail": {
      color: "var(--eqf-completion-detail)",
      fontStyle: "normal",
      marginLeft: "6px",
    },
    "li[aria-selected] .cm-completionDetail": {
      color: "var(--eqf-completion-detail-selected)",
    },
    ".cm-completionInfo": {
      backgroundColor: "var(--eqf-completion-info-bg)",
      border: "1px solid var(--eqf-completion-info-border)",
      borderRadius: "4px",
      padding: "6px 10px",
      fontSize: "12px",
      maxWidth: "280px",
      lineHeight: "1.5",
      color: "var(--eqf-completion-info-fg)",
    },
    // Snippet tab stops
    ".cm-snippetField": {
      backgroundColor: "rgba(97,175,239,0.15)",
      borderRadius: "2px",
    },
    ".cm-snippetFieldPosition": {
      borderLeft: "2px solid var(--eqf-completion-selected-fg)",
    },
  },
  { dark: true },
);

const eqfHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--eqf-keyword)", fontWeight: "700" },
  { tag: tags.operator, color: "var(--eqf-operator)", fontWeight: "600" },
  { tag: tags.string, color: "var(--eqf-string)" },
  { tag: tags.number, color: "var(--eqf-number)" },
  { tag: tags.comment, color: "var(--eqf-comment)", fontStyle: "italic" },
  { tag: tags.bracket, color: "var(--eqf-bracket)" },
  { tag: tags.punctuation, color: "var(--eqf-punctuation)" },
  { tag: tags.attributeName, color: "var(--eqf-attribute)" },
  { tag: tags.variableName, color: "var(--eqf-variable)" },
]);

function parseNav(text) {
  const states = [];
  const randoms = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const stateMatch = lines[i].match(/^State\s+(\S+)/i);
    if (stateMatch) {
      states.push({ name: stateMatch[1], line: i });
      continue;
    }
    const randomMatch = lines[i].match(/^random\s+(\S+)/i);
    if (randomMatch) {
      randoms.push({ name: randomMatch[1], line: i });
    }
  }
  return { states, randoms };
}

@customElement("eomap-quest-editor")
export class QuestEditor extends LitElement {
  static get styles() {
    return [
      scrollbarStyles,
      css`
        :host {
          display: grid;
          grid-template-columns: 200px minmax(0, 1fr);
          grid-template-rows: 100%;
          background-color: var(--eqf-nav-bg);
          color: var(--eqf-nav-text);
          overflow: hidden;
        }

        /* ── Left nav pane ── */

        .nav-pane {
          display: grid;
          grid-template-rows: minmax(0, 1fr) min-content;
          background-color: var(--eqf-nav-bg);
          border-right: 1px solid var(--eqf-nav-border);
          overflow: hidden;
        }

        .nav-count {
          font-weight: 400;
          color: var(--eqf-nav-muted);
        }

        .nav-list {
          overflow: auto;
          padding: 4px 0 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          height: 22px;
          padding: 0 8px 0 16px;
          font-family: "Source Code Pro", Monaco, Consolas, monospace;
          font-size: 12px;
          color: var(--eqf-nav-text);
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border-radius: 0;
          box-sizing: border-box;
        }

        .nav-item:hover {
          background-color: var(--eqf-nav-hover-bg);
        }

        .nav-item--selected {
          background-color: var(--eqf-nav-selected-bg);
          color: var(--eqf-nav-selected-fg);
        }

        .nav-section-label {
          padding: 10px 12px 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--eqf-nav-muted);
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-section-label:not(:first-child) {
          border-top: 1px solid var(--eqf-nav-border);
          margin-top: 4px;
        }

        .nav-actions {
          display: flex;
          gap: 6px;
          padding: 8px 10px;
          border-top: 1px solid var(--eqf-nav-border);
          flex-wrap: wrap;
        }

        .nav-btn {
          flex: 1;
          min-width: 0;
          padding: 3px 6px;
          font-size: 11px;
          font-family: inherit;
          color: var(--eqf-button-fg);
          background-color: var(--eqf-button-bg);
          border: 1px solid var(--eqf-button-border);
          border-radius: 3px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          line-height: 1.4;
        }

        .nav-btn:hover {
          background-color: var(--eqf-button-hover-bg);
          color: var(--eqf-nav-text);
        }

        .nav-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }

        /* ── Editor pane ── */

        .editor-pane {
          display: grid;
          grid-template-rows: min-content minmax(0, 1fr);
          overflow: hidden;
        }

        .editor-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          background-color: var(--eqf-toolbar-bg);
          border-bottom: 1px solid var(--eqf-toolbar-border);
          min-height: 0;
        }

        .toolbar-filename {
          flex: 1;
          font-family: "Source Code Pro", Monaco, Consolas, monospace;
          font-size: 12px;
          color: var(--eqf-filename-fg);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .toolbar-status {
          font-size: 12px;
          color: var(--eqf-status-fg);
          white-space: nowrap;
        }

        .toolbar-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .toolbar-btn {
          padding: 3px 10px;
          font-size: 12px;
          font-family: inherit;
          color: var(--eqf-button-fg);
          background-color: transparent;
          border: 1px solid var(--eqf-button-border);
          border-radius: 3px;
          cursor: pointer;
          line-height: 1.4;
        }

        .toolbar-btn:hover {
          background-color: var(--eqf-button-hover-bg);
          color: var(--eqf-nav-text);
        }

        .toolbar-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .cm-host {
          overflow: hidden;
          height: 100%;
        }

        .cm-host .cm-editor {
          height: 100%;
        }

        .cm-host .cm-editor.cm-focused {
          outline: none;
        }
      `,
    ];
  }

  @state()
  navStates = [];

  @state()
  navRandoms = [];

  @state()
  selectedNavState = null;

  @state()
  selectedNavType = null; // "state" | "random"

  @state()
  saveStatus = "";

  @state()
  copyStatus = "";

  @state()
  questFileHandle = null;

  @property({ type: Object })
  fileSystemProvider = null;

  editorView = null;

  render() {
    const canRemove =
      this.selectedNavType === "random" ||
      (this.selectedNavType === "state" &&
        this.selectedNavState &&
        this.selectedNavState.toLowerCase() !== "begin");

    return html`
      <div class="nav-pane">
        <div class="nav-list">
          <div class="nav-section-label">
            <span>States</span>
            <span class="nav-count">${this.navStates.length}</span>
          </div>
          ${this.navStates.map((s) => this.renderNavItem(s, "state"))}
          ${this.navRandoms.length > 0
            ? html`
                <div class="nav-section-label">
                  <span>Random</span>
                  <span class="nav-count">${this.navRandoms.length}</span>
                </div>
                ${this.navRandoms.map((r) => this.renderNavItem(r, "random"))}
              `
            : null}
        </div>
        <div class="nav-actions">
          <button class="nav-btn" @click=${this.onAddState}>+ State</button>
          <button class="nav-btn" @click=${this.onAddRandom}>+ Random</button>
          <button
            class="nav-btn"
            ?disabled=${!canRemove}
            @click=${this.onRemove}
          >
            Remove
          </button>
        </div>
      </div>

      <div class="editor-pane">
        <div class="editor-toolbar">
          <span class="toolbar-filename">
            ${this.questFileHandle?.name ?? "unsaved.eqf"}
          </span>
          ${this.saveStatus
            ? html`<span class="toolbar-status">${this.saveStatus}</span>`
            : null}
          <div class="toolbar-actions">
            <button
              class="toolbar-btn"
              ?disabled=${!this.canSaveQuest}
              @click=${this.saveQuest}
            >
              Save
            </button>
            <button
              class="toolbar-btn"
              ?disabled=${!this.canSaveQuest}
              @click=${this.saveQuestAs}
            >
              Save As
            </button>
            <button class="toolbar-btn" @click=${this.copyEqf}>
              ${this.copyStatus || "Copy"}
            </button>
          </div>
        </div>
        <div class="cm-host"></div>
      </div>
    `;
  }

  renderNavItem(navEntry, type) {
    const isSelected =
      this.selectedNavType === type && this.selectedNavState === navEntry.name;
    return html`
      <div
        class="nav-item ${isSelected ? "nav-item--selected" : ""}"
        @click=${() => this.onNavItemClick(navEntry, type)}
      >
        ${navEntry.name}
      </div>
    `;
  }

  firstUpdated() {
    this.initEditor();
  }

  initEditor() {
    const host = this.shadowRoot.querySelector(".cm-host");
    if (!host) return;

    this.editorView = new EditorView({
      state: EditorState.create({
        doc: INITIAL_DOC,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          indentUnit.of("\t"),
          keymap.of([
            ...closeBracketsKeymap,
            ...completionKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            indentWithTab,
          ]),
          eqfLanguage,
          syntaxHighlighting(eqfHighlightStyle),
          eqfTheme,
          lintGutter(),
          linter(createEqfLinter(), { delay: 400 }),
          autocompletion({
            override: [eqfCompletionSource],
            defaultKeymap: false, // using completionKeymap above
            activateOnTyping: true,
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.syncNavStates();
            }
          }),
        ],
      }),
      parent: host,
      root: this.shadowRoot,
    });

    this.syncNavStates();
  }

  syncNavStates() {
    if (!this.editorView) return;
    const { states, randoms } = parseNav(this.editorView.state.doc.toString());
    this.navStates = states;
    this.navRandoms = randoms;
  }

  onNavItemClick(navEntry, type) {
    this.selectedNavState = navEntry.name;
    this.selectedNavType = type;
    if (!this.editorView) return;

    const line = this.editorView.state.doc.line(navEntry.line + 1);
    this.editorView.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, {
        y: "start",
        yMargin: 32,
      }),
    });
    this.editorView.focus();
  }

  onAddState = () => {
    if (!this.editorView) return;
    const existing = new Set(this.navStates.map((s) => s.name.toLowerCase()));
    let index = 1;
    while (existing.has(`state${index}`)) index++;
    this.appendBlock(`State State${index}`);
  };

  onAddRandom = () => {
    if (!this.editorView) return;
    const existing = new Set(this.navRandoms.map((r) => r.name.toLowerCase()));
    let index = 1;
    while (existing.has(`random${index}`)) index++;
    this.appendBlock(`random Random${index}`);
  };

  appendBlock(header) {
    const snippet = `\n${header}\n{\n}\n`;
    const end = this.editorView.state.doc.length;
    this.editorView.dispatch({ changes: { from: end, insert: snippet } });
    this.editorView.focus();
  }

  onRemove = () => {
    if (!this.editorView || !this.selectedNavState || !this.selectedNavType)
      return;

    const keyword = this.selectedNavType === "random" ? "random" : "State";
    this.removeBlock(keyword, this.selectedNavState);
    this.selectedNavState = null;
    this.selectedNavType = null;
  };

  removeBlock(keyword, name) {
    const text = this.editorView.state.doc.toString();
    const lines = text.split("\n");

    const pattern = new RegExp(`^${keyword}\\s+${name}\\b`, "i");
    let blockStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        blockStart = i;
        break;
      }
    }
    if (blockStart === -1) return;

    let depth = 0;
    let blockEnd = blockStart;
    let foundOpen = false;
    for (let i = blockStart; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === "{") {
          depth++;
          foundOpen = true;
        }
        if (ch === "}") depth--;
      }
      if (foundOpen && depth === 0) {
        blockEnd = i;
        break;
      }
    }

    let fromPos = 0;
    for (let i = 0; i < blockStart; i++) fromPos += lines[i].length + 1;
    if (fromPos > 0 && text[fromPos - 1] === "\n") fromPos--;

    let toPos = 0;
    for (let i = 0; i <= blockEnd; i++) toPos += lines[i].length + 1;
    toPos = Math.min(toPos - 1, text.length);

    this.editorView.dispatch({
      changes: { from: fromPos, to: toPos, insert: "" },
    });
    this.editorView.focus();
  }

  copyEqf = async () => {
    const text = this.editorView?.state.doc.toString() ?? "";
    try {
      await navigator.clipboard.writeText(text);
      this.copyStatus = "Copied";
      setTimeout(() => {
        if (this.copyStatus === "Copied") this.copyStatus = "";
      }, 1200);
    } catch {
      this.copyStatus = "Failed";
      setTimeout(() => {
        if (this.copyStatus === "Failed") this.copyStatus = "";
      }, 1600);
    }
  };

  saveQuest = async () => {
    if (!this.canSaveQuest) return;
    if (!this.questFileHandle) {
      await this.saveQuestAs();
      return;
    }
    await this.writeQuestFile(this.questFileHandle);
  };

  saveQuestAs = async () => {
    if (!this.canSaveQuest) return;
    let handle;
    try {
      handle = await this.fileSystemProvider.showSaveFilePicker({
        suggestedName: "quest.eqf",
        types: [
          {
            description: "Endless Quest File",
            accept: { "*/*": [".eqf"] },
          },
        ],
      });
    } catch (e) {
      if (e.name === "AbortError") return;
      this.setSaveStatus("Failed to open save dialog.");
      return;
    }
    await this.writeQuestFile(handle);
  };

  async writeQuestFile(handle) {
    try {
      const text = this.editorView?.state.doc.toString() ?? "";
      await handle.write(new TextEncoder().encode(text));
      this.questFileHandle = handle;
      this.setSaveStatus(`Saved ${handle.name}`);
    } catch {
      this.setSaveStatus("Save failed.");
    }
  }

  setSaveStatus(message) {
    this.saveStatus = message;
    setTimeout(() => {
      if (this.saveStatus === message) this.saveStatus = "";
    }, 1800);
  }

  get canSaveQuest() {
    return !!this.fileSystemProvider?.supported;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.editorView?.destroy();
  }
}
