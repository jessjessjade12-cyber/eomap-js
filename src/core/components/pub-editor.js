import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import scrollbarStyles from "../styles/scrollbar";
import { EIFParser } from "../data/pub/eif";
import { ENFParser } from "../data/pub/enf";
import { ECFParser } from "../data/pub/ecf";
import { ESFParser } from "../data/pub/esf";

const TYPE_CONFIG = {
  eif: {
    label: "Items",
    extension: ".eif",
    defaultFilename: "dat001.eif",
    description: "Endless Item File",
    parser: EIFParser,
  },
  enf: {
    label: "NPCs",
    extension: ".enf",
    defaultFilename: "dtn001.enf",
    description: "Endless NPC File",
    parser: ENFParser,
  },
  ecf: {
    label: "Classes",
    extension: ".ecf",
    defaultFilename: "dat001.ecf",
    description: "Endless Class File",
    parser: ECFParser,
  },
  esf: {
    label: "Skills",
    extension: ".esf",
    defaultFilename: "dat001.esf",
    description: "Endless Skill File",
    parser: ESFParser,
  },
};

const TYPE_ORDER = Object.keys(TYPE_CONFIG);

const FIELD_CONFIG = {
  eif: [
    { key: "name", label: "Name", type: "text" },
    { key: "graphic", label: "Graphic", type: "number" },
    { key: "type", label: "Type", type: "number" },
    { key: "subType", label: "Sub Type", type: "number" },
    { key: "special", label: "Special", type: "number" },
    { key: "hp", label: "HP", type: "number" },
    { key: "tp", label: "TP", type: "number" },
    { key: "minDamage", label: "Min Damage", type: "number" },
    { key: "maxDamage", label: "Max Damage", type: "number" },
    { key: "accuracy", label: "Accuracy", type: "number" },
    { key: "evade", label: "Evade", type: "number" },
    { key: "armor", label: "Armor", type: "number" },
    { key: "str", label: "STR", type: "number" },
    { key: "int", label: "INT", type: "number" },
    { key: "wis", label: "WIS", type: "number" },
    { key: "agi", label: "AGI", type: "number" },
    { key: "con", label: "CON", type: "number" },
    { key: "cha", label: "CHA", type: "number" },
    { key: "dollGraphic", label: "Doll Graphic", type: "number" },
    { key: "gender", label: "Gender", type: "number" },
    { key: "levelReq", label: "Level Req", type: "number" },
    { key: "classReq", label: "Class Req", type: "number" },
    { key: "strReq", label: "STR Req", type: "number" },
    { key: "intReq", label: "INT Req", type: "number" },
    { key: "wisReq", label: "WIS Req", type: "number" },
    { key: "agiReq", label: "AGI Req", type: "number" },
    { key: "conReq", label: "CON Req", type: "number" },
    { key: "chaReq", label: "CHA Req", type: "number" },
    { key: "weight", label: "Weight", type: "number" },
    { key: "size", label: "Size", type: "number" },
  ],
  enf: [
    { key: "name", label: "Name", type: "text" },
    { key: "graphic", label: "Graphic", type: "number" },
    { key: "race", label: "Race", type: "number" },
    { key: "boss", label: "Boss", type: "boolean" },
    { key: "child", label: "Child", type: "boolean" },
    { key: "type", label: "Type", type: "number" },
    { key: "behaviorId", label: "Behavior ID", type: "number" },
    { key: "hp", label: "HP", type: "number" },
    { key: "tp", label: "TP", type: "number" },
    { key: "minDamage", label: "Min Damage", type: "number" },
    { key: "maxDamage", label: "Max Damage", type: "number" },
    { key: "accuracy", label: "Accuracy", type: "number" },
    { key: "evade", label: "Evade", type: "number" },
    { key: "armor", label: "Armor", type: "number" },
    { key: "returnDamage", label: "Return Damage", type: "number" },
    { key: "element", label: "Element", type: "number" },
    { key: "elementDamage", label: "Element Damage", type: "number" },
    { key: "elementWeakness", label: "Element Weakness", type: "number" },
    {
      key: "elementWeaknessDamage",
      label: "Element Weakness Damage",
      type: "number",
    },
    { key: "level", label: "Level", type: "number" },
    { key: "exp", label: "EXP", type: "number" },
  ],
  ecf: [
    { key: "name", label: "Name", type: "text" },
    { key: "parentType", label: "Parent Type", type: "number" },
    { key: "statGroup", label: "Stat Group", type: "number" },
    { key: "str", label: "STR", type: "number" },
    { key: "int", label: "INT", type: "number" },
    { key: "wis", label: "WIS", type: "number" },
    { key: "agi", label: "AGI", type: "number" },
    { key: "con", label: "CON", type: "number" },
    { key: "cha", label: "CHA", type: "number" },
  ],
  esf: [
    { key: "name", label: "Name", type: "text" },
    { key: "chant", label: "Chant", type: "text" },
    { key: "iconId", label: "Icon ID", type: "number" },
    { key: "graphicId", label: "Graphic ID", type: "number" },
    { key: "tpCost", label: "TP Cost", type: "number" },
    { key: "spCost", label: "SP Cost", type: "number" },
    { key: "castTime", label: "Cast Time", type: "number" },
    { key: "nature", label: "Nature", type: "number" },
    { key: "type", label: "Type", type: "number" },
    { key: "element", label: "Element", type: "number" },
    { key: "elementPower", label: "Element Power", type: "number" },
    { key: "targetRestrict", label: "Target Restrict", type: "number" },
    { key: "targetType", label: "Target Type", type: "number" },
    { key: "targetTime", label: "Target Time", type: "number" },
    { key: "maxSkillLevel", label: "Max Skill Level", type: "number" },
    { key: "minDamage", label: "Min Damage", type: "number" },
    { key: "maxDamage", label: "Max Damage", type: "number" },
    { key: "accuracy", label: "Accuracy", type: "number" },
    { key: "evade", label: "Evade", type: "number" },
    { key: "armor", label: "Armor", type: "number" },
    { key: "returnDamage", label: "Return Damage", type: "number" },
    { key: "hpHeal", label: "HP Heal", type: "number" },
    { key: "tpHeal", label: "TP Heal", type: "number" },
    { key: "spHeal", label: "SP Heal", type: "number" },
    { key: "str", label: "STR", type: "number" },
    { key: "intl", label: "INT", type: "number" },
    { key: "wis", label: "WIS", type: "number" },
    { key: "agi", label: "AGI", type: "number" },
    { key: "con", label: "CON", type: "number" },
    { key: "cha", label: "CHA", type: "number" },
  ],
};

const EMPTY_DATA = {
  eif: () => ({ version: 1, rid: [0, 0], records: [] }),
  enf: () => ({ version: 1, records: [] }),
  ecf: () => ({ version: 1, rid: [0, 0], records: [] }),
  esf: () => ({ version: 1, rid: [0, 0], records: [] }),
};

function createDefaultRecord(type, id) {
  switch (type) {
    case "eif":
      return {
        id,
        name: `New Item ${id}`,
        graphic: 1,
        type: 1,
        subType: 0,
        special: 0,
        hp: 0,
        tp: 0,
        minDamage: 0,
        maxDamage: 0,
        accuracy: 0,
        evade: 0,
        armor: 0,
        str: 0,
        int: 0,
        wis: 0,
        agi: 0,
        con: 0,
        cha: 0,
        dollGraphic: 0,
        gender: 0,
        levelReq: 0,
        classReq: 0,
        strReq: 0,
        intReq: 0,
        wisReq: 0,
        agiReq: 0,
        conReq: 0,
        chaReq: 0,
        weight: 0,
        size: 1,
      };
    case "enf":
      return {
        id,
        name: `New NPC ${id}`,
        graphic: 1,
        race: 0,
        boss: false,
        child: false,
        type: 0,
        behaviorId: 0,
        hp: 10,
        tp: 0,
        minDamage: 1,
        maxDamage: 2,
        accuracy: 5,
        evade: 5,
        armor: 0,
        returnDamage: 0,
        element: 0,
        elementDamage: 0,
        elementWeakness: 0,
        elementWeaknessDamage: 0,
        level: 1,
        exp: 10,
      };
    case "ecf":
      return {
        id,
        name: `New Class ${id}`,
        parentType: 0,
        statGroup: 0,
        str: 0,
        int: 0,
        wis: 0,
        agi: 0,
        con: 0,
        cha: 0,
      };
    case "esf":
      return {
        id,
        name: `New Skill ${id}`,
        chant: "",
        iconId: 0,
        graphicId: 0,
        tpCost: 0,
        spCost: 0,
        castTime: 0,
        nature: 0,
        type: 0,
        element: 0,
        elementPower: 0,
        targetRestrict: 0,
        targetType: 0,
        targetTime: 0,
        maxSkillLevel: 1,
        minDamage: 0,
        maxDamage: 0,
        accuracy: 0,
        evade: 0,
        armor: 0,
        returnDamage: 0,
        hpHeal: 0,
        tpHeal: 0,
        spHeal: 0,
        str: 0,
        intl: 0,
        wis: 0,
        agi: 0,
        con: 0,
        cha: 0,
      };
    default:
      return { id, name: `Record ${id}` };
  }
}

function createInitialTypeState() {
  return TYPE_ORDER.reduce((result, type) => {
    result[type] = {
      fileHandle: null,
      data: EMPTY_DATA[type](),
      dirty: false,
      selectedId: null,
      filter: "",
    };
    return result;
  }, {});
}

function coerceNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getItemPaperdollFileID(type, gender) {
  if (type === 12) {
    return gender === 0 ? 14 : 13;
  }

  switch (type) {
    case 10:
      return 17;
    case 11:
      return 19;
    case 13:
      return 15;
    case 14:
    case 15:
    case 17:
    case 18:
    case 19:
    case 20:
    case 21:
      return 16;
    default:
      return null;
  }
}

const PREVIEW_ANIMATION_TICK_MS = 120;

const DEFAULT_SPELL_METADATA = {
  frames: 4,
  loops: 2,
};

const SPELL_METADATA = {
  10: { frames: 5, loops: 1 },
  14: { frames: 6, loops: 1 },
  15: { frames: 6, loops: 1 },
  16: { frames: 6, loops: 1 },
  17: { frames: 6, loops: 1 },
  18: { frames: 9, loops: 1 },
  19: { frames: 9, loops: 1 },
  20: { frames: 9, loops: 1 },
  21: { frames: 9, loops: 1 },
  31: { frames: 15, loops: 1 },
};

function getSpellMetadata(graphicID) {
  return SPELL_METADATA[graphicID] || DEFAULT_SPELL_METADATA;
}

@customElement("eomap-pub-editor")
export class PubEditor extends LitElement {
  static get styles() {
    return [
      scrollbarStyles,
      css`
        :host {
          display: grid;
          grid-template-rows: min-content minmax(0, 1fr) min-content;
          grid-template-columns: 100%;
          background-color: var(--pub-bg);
          color: var(--pub-text);
          overflow: hidden;
          font-size: 12px;
        }

        .toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) max-content;
          gap: 10px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--pub-border);
          background-color: var(--pub-surface-1);
        }

        .toolbar-main {
          display: grid;
          grid-template-rows: min-content min-content;
          gap: 8px;
          min-width: 0;
        }

        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tab {
          border: 1px solid var(--pub-border);
          background-color: var(--pub-button-bg);
          color: var(--pub-text);
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 12px;
        }

        .tab:hover {
          background-color: var(--pub-button-hover-bg);
        }

        .tab[data-active] {
          border-color: var(--pub-accent-bg);
          color: var(--pub-accent-fg);
          background-color: var(--pub-accent-bg);
        }

        .file-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          min-width: 0;
          color: var(--pub-muted);
        }

        .filename {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .action-btn {
          border: 1px solid var(--pub-button-border);
          background-color: var(--pub-button-bg);
          color: var(--pub-button-fg);
          border-radius: 4px;
          padding: 4px 10px;
          cursor: pointer;
          font-size: 12px;
          line-height: 1.3;
        }

        .action-btn:hover {
          background-color: var(--pub-button-hover-bg);
        }

        .action-btn:disabled {
          opacity: 0.45;
          cursor: default;
        }

        .workspace {
          display: grid;
          grid-template-columns: 290px minmax(0, 1fr);
          min-height: 0;
        }

        .list-pane {
          display: grid;
          grid-template-rows: min-content minmax(0, 1fr);
          border-right: 1px solid var(--pub-border);
          min-height: 0;
          background-color: var(--pub-surface-2);
        }

        .filter-box {
          border-bottom: 1px solid var(--pub-border);
          padding: 8px;
        }

        .filter-input {
          width: 100%;
          box-sizing: border-box;
          background-color: var(--pub-input-bg);
          border: 1px solid var(--pub-input-border);
          color: var(--pub-input-fg);
          border-radius: 4px;
          padding: 6px 8px;
          outline: none;
          font-size: 12px;
        }

        .filter-input:focus {
          border-color: var(--pub-accent-bg);
        }

        .record-list {
          overflow: auto;
          min-height: 0;
        }

        .record-item {
          border: 0;
          background-color: transparent;
          color: var(--pub-text);
          width: 100%;
          text-align: left;
          padding: 7px 10px;
          cursor: pointer;
          display: grid;
          grid-template-columns: min-content minmax(0, 1fr);
          gap: 8px;
          border-bottom: 1px solid var(--pub-border);
          align-items: baseline;
        }

        .record-item:hover {
          background-color: var(--pub-hover-bg);
        }

        .record-item[data-selected] {
          background-color: var(--pub-accent-bg);
          color: var(--pub-accent-fg);
        }

        .record-id {
          color: var(--pub-muted);
          font-variant-numeric: tabular-nums;
          min-width: 2.3em;
        }

        .record-item[data-selected] .record-id {
          color: var(--pub-accent-fg);
        }

        .record-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .detail-pane {
          display: grid;
          grid-template-rows: min-content minmax(0, 1fr);
          min-height: 0;
          overflow: hidden;
        }

        .detail-header {
          border-bottom: 1px solid var(--pub-border);
          padding: 8px 12px;
          color: var(--pub-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-strip {
          border-bottom: 1px solid var(--pub-border);
          padding: 10px 12px;
          display: flex;
          gap: 10px;
          overflow: auto;
          background-color: var(--pub-surface-2);
        }

        .preview-card {
          border: 1px solid var(--pub-border);
          border-radius: 4px;
          background-color: var(--pub-surface-1);
          min-width: 130px;
          max-width: 180px;
          display: grid;
          grid-template-rows: min-content minmax(0, 1fr);
          overflow: hidden;
        }

        .preview-title {
          font-size: 11px;
          color: var(--pub-muted);
          padding: 6px 8px;
          border-bottom: 1px solid var(--pub-border);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-body {
          min-height: 92px;
          max-height: 120px;
          display: grid;
          place-items: center;
          padding: 8px;
        }

        .preview-image {
          max-width: 100%;
          max-height: 100px;
          object-fit: contain;
          image-rendering: pixelated;
        }

        .preview-message {
          color: var(--pub-muted);
          font-size: 11px;
          text-align: center;
        }

        .detail-form {
          overflow: auto;
          padding: 12px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 10px;
          align-content: start;
        }

        .field {
          display: grid;
          grid-template-rows: min-content min-content;
          gap: 4px;
        }

        .field[data-full-width] {
          grid-column: 1 / -1;
        }

        .field label {
          color: var(--pub-muted);
          font-size: 11px;
          letter-spacing: 0.02em;
        }

        .text-input,
        .number-input {
          width: 100%;
          box-sizing: border-box;
          background-color: var(--pub-input-bg);
          border: 1px solid var(--pub-input-border);
          color: var(--pub-input-fg);
          border-radius: 4px;
          padding: 6px 8px;
          outline: none;
          font-size: 12px;
        }

        .text-input:focus,
        .number-input:focus {
          border-color: var(--pub-accent-bg);
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 30px;
          border: 1px solid var(--pub-input-border);
          border-radius: 4px;
          padding: 0 8px;
          background-color: var(--pub-input-bg);
        }

        .empty-state {
          display: grid;
          place-items: center;
          color: var(--pub-muted);
          padding: 20px;
          text-align: center;
        }

        .statusbar {
          border-top: 1px solid var(--pub-border);
          min-height: 24px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          color: var(--pub-muted);
          background-color: var(--pub-surface-1);
        }

        .statusbar[data-level="error"] {
          color: var(--pub-error);
        }

        .statusbar[data-level="success"] {
          color: var(--pub-success);
        }
      `,
    ];
  }

  @property({ type: Object })
  fileSystemProvider = null;

  @property({ type: Object })
  gfxLoader = null;

  @state({ type: String })
  activeType = "eif";

  @state({ type: Object })
  typeState = createInitialTypeState();

  @state({ type: String })
  statusMessage = "";

  @state({ type: String })
  statusLevel = "idle";

  @state({ type: Array })
  previewEntries = [];

  @state({ type: Number })
  animationTick = 0;

  previewLoadToken = 0;
  previewSignature = "";
  previewAnimationTimer = null;

  get canSave() {
    return !!this.fileSystemProvider?.supported;
  }

  get currentTypeConfig() {
    return TYPE_CONFIG[this.activeType];
  }

  get currentState() {
    return this.typeState[this.activeType];
  }

  get currentRecords() {
    const records = this.currentState.data.records || [];
    return [...records].sort((a, b) => (a.id || 0) - (b.id || 0));
  }

  get filteredRecords() {
    const query = this.currentState.filter.trim().toLowerCase();
    if (!query) {
      return this.currentRecords;
    }
    return this.currentRecords.filter((record) => {
      const idMatch = String(record.id || "").includes(query);
      const nameMatch = (record.name || "").toLowerCase().includes(query);
      return idMatch || nameMatch;
    });
  }

  get selectedRecord() {
    const selectedId = this.currentState.selectedId;
    if (selectedId === null || selectedId === undefined) {
      return null;
    }
    return (
      this.currentRecords.find((record) => record.id === selectedId) || null
    );
  }

  updated(changed) {
    super.updated(changed);

    if (changed.has("gfxLoader")) {
      this.previewSignature = "";
    }

    const signature = this.getPreviewSignature();
    if (this.previewSignature !== signature) {
      this.previewSignature = signature;
      this.refreshPreviews();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.previewAnimationTimer = setInterval(() => {
      if (this.hasAnimatedPreviews()) {
        this.animationTick = (this.animationTick + 1) % 1000000;
      }
    }, PREVIEW_ANIMATION_TICK_MS);
  }

  disconnectedCallback() {
    if (this.previewAnimationTimer) {
      clearInterval(this.previewAnimationTimer);
      this.previewAnimationTimer = null;
    }
    super.disconnectedCallback();
  }

  render() {
    return html`
      ${this.renderToolbar()}
      <div class="workspace">
        ${this.renderListPane()}
        <div class="detail-pane">${this.renderDetailPane()}</div>
      </div>
      <div class="statusbar" data-level=${this.statusLevel}>
        ${this.statusMessage || "Ready"}
      </div>
    `;
  }

  renderToolbar() {
    const state = this.currentState;
    const filename =
      state.fileHandle?.name || this.currentTypeConfig.defaultFilename;

    return html`
      <div class="toolbar">
        <div class="toolbar-main">
          <div class="tabs">
            ${TYPE_ORDER.map((type) => this.renderTypeTab(type))}
          </div>
          <div class="file-meta">
            <span class="filename">
              ${filename}${state.dirty ? " *" : ""}
            </span>
            <span>${this.currentRecords.length} records</span>
          </div>
        </div>
        <div class="actions">
          <button class="action-btn" @click=${this.openActiveFile}>Open</button>
          <button
            class="action-btn"
            ?disabled=${!this.canSave}
            @click=${this.saveActiveFile}
          >
            Save
          </button>
          <button
            class="action-btn"
            ?disabled=${!this.canSave}
            @click=${this.saveActiveFileAs}
          >
            Save As
          </button>
          <button class="action-btn" @click=${this.addRecord}>Add</button>
          <button
            class="action-btn"
            ?disabled=${!this.selectedRecord}
            @click=${this.duplicateRecord}
          >
            Duplicate
          </button>
          <button
            class="action-btn"
            ?disabled=${!this.selectedRecord}
            @click=${this.deleteRecord}
          >
            Delete
          </button>
        </div>
      </div>
    `;
  }

  renderTypeTab(type) {
    const state = this.typeState[type];
    const label = TYPE_CONFIG[type].label;
    return html`
      <button
        class="tab"
        data-active=${type === this.activeType ? "true" : null}
        @click=${() => this.switchType(type)}
      >
        ${label}${state.dirty ? " *" : ""}
      </button>
    `;
  }

  renderListPane() {
    return html`
      <div class="list-pane">
        <div class="filter-box">
          <input
            class="filter-input"
            type="text"
            placeholder="Filter records"
            .value=${this.currentState.filter}
            @input=${this.onFilterInput}
          />
        </div>
        <div class="record-list">
          ${this.filteredRecords.length > 0
            ? this.filteredRecords.map((record) =>
                this.renderRecordItem(record),
              )
            : html`
                <div class="empty-state">No records for this file type.</div>
              `}
        </div>
      </div>
    `;
  }

  renderRecordItem(record) {
    const selected = record.id === this.currentState.selectedId;
    return html`
      <button
        class="record-item"
        data-selected=${selected ? "true" : null}
        @click=${() => this.selectRecord(record.id)}
      >
        <span class="record-id">#${record.id}</span>
        <span class="record-name">${record.name || "Unnamed"}</span>
      </button>
    `;
  }

  renderDetailPane() {
    const record = this.selectedRecord;
    if (!record) {
      return html`
        <div class="detail-header">No record selected</div>
        <div class="empty-state">Choose a record to edit fields.</div>
      `;
    }

    return html`
      <div class="detail-header">
        Editing #${record.id} ${record.name || "Unnamed"}
      </div>
      ${this.renderPreviewStrip()}
      <div class="detail-form">
        ${FIELD_CONFIG[this.activeType].map((field) =>
          this.renderField(record, field),
        )}
      </div>
    `;
  }

  renderPreviewStrip() {
    if (this.previewEntries.length === 0) {
      const message = this.hasPreviewCapabilityForType()
        ? "No graphics to preview for this record."
        : "No graphics preview for this file type.";

      return html`
        <div class="preview-strip">
          <div class="preview-message">${message}</div>
        </div>
      `;
    }

    return html`
      <div class="preview-strip">
        ${this.previewEntries.map((entry) => this.renderPreviewCard(entry))}
      </div>
    `;
  }

  renderPreviewCard(entry) {
    let body;

    switch (entry.status) {
      case "ready": {
        const frameDataUrls = entry.frameDataUrls || [];
        const hasAnimationFrames = frameDataUrls.length > 1;
        const frameDuration = entry.frameDuration || PREVIEW_ANIMATION_TICK_MS;
        const frameIndex = hasAnimationFrames
          ? Math.floor(
              (this.animationTick * PREVIEW_ANIMATION_TICK_MS) / frameDuration,
            ) % frameDataUrls.length
          : 0;
        const dataUrl =
          frameDataUrls[frameIndex] || frameDataUrls[0] || entry.dataUrl || "";

        body = html`
          <img class="preview-image" src=${dataUrl} alt=${entry.label} />
        `;
        break;
      }
      case "loading":
        body = html`<span class="preview-message">Loading...</span>`;
        break;
      case "unavailable":
        body = html`<span class="preview-message">GFX unavailable</span>`;
        break;
      case "missing":
        body = html`<span class="preview-message">Not found</span>`;
        break;
      default:
        body = html`<span class="preview-message">Preview error</span>`;
        break;
    }

    return html`
      <div class="preview-card">
        <div class="preview-title">${entry.label}</div>
        <div class="preview-body">${body}</div>
      </div>
    `;
  }

  renderField(record, field) {
    const value = record[field.key];
    if (field.type === "boolean") {
      return html`
        <div class="field">
          <label>${field.label}</label>
          <label class="checkbox-row">
            <input
              type="checkbox"
              .checked=${!!value}
              @change=${(event) => this.onFieldChange(field, event)}
            />
            <span>${value ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
      `;
    }

    const isText = field.type === "text";
    return html`
      <div class="field" ?data-full-width=${isText}>
        <label>${field.label}</label>
        <input
          class=${isText ? "text-input" : "number-input"}
          type=${isText ? "text" : "number"}
          .value=${String(value ?? "")}
          @input=${(event) => this.onFieldChange(field, event)}
        />
      </div>
    `;
  }

  hasPreviewCapabilityForType() {
    return (
      this.activeType === "eif" ||
      this.activeType === "enf" ||
      this.activeType === "esf"
    );
  }

  hasAnimatedPreviews() {
    return this.previewEntries.some(
      (entry) =>
        entry.status === "ready" &&
        Array.isArray(entry.frameDataUrls) &&
        entry.frameDataUrls.length > 1,
    );
  }

  getPreviewSignature() {
    const record = this.selectedRecord;
    if (!record) {
      return `${this.activeType}:none:${!!this.gfxLoader}`;
    }

    switch (this.activeType) {
      case "eif":
        return [
          "eif",
          record.id,
          record.graphic,
          record.dollGraphic ?? record.dolGraphic,
          record.type,
          record.gender,
          !!this.gfxLoader,
        ].join(":");
      case "enf":
        return ["enf", record.id, record.graphic, !!this.gfxLoader].join(":");
      case "esf":
        return [
          "esf",
          record.id,
          record.iconId,
          record.graphicId,
          !!this.gfxLoader,
        ].join(":");
      default:
        return `${this.activeType}:${record.id}:${!!this.gfxLoader}`;
    }
  }

  getPreviewRequests() {
    const record = this.selectedRecord;
    if (!record) {
      return [];
    }

    if (this.activeType === "eif") {
      const requests = [];

      const graphic = coerceNumber(record.graphic);
      if (graphic > 0) {
        requests.push({
          key: `item-icon:${graphic}`,
          label: "Item Icon",
          fileID: 23,
          resourceID: 2 * graphic + 100,
        });
      }

      const dollGraphic = coerceNumber(record.dollGraphic ?? record.dolGraphic);
      const itemType = coerceNumber(record.type);
      const gender = coerceNumber(record.gender);
      const fileID = getItemPaperdollFileID(itemType, gender);
      if (fileID && dollGraphic > 0) {
        const baseGraphic = (dollGraphic - 1) * 50;
        requests.push({
          key: `item-paperdoll:${fileID}:${dollGraphic}:${gender}`,
          label: "Paperdoll",
          fileID,
          resourceID: baseGraphic + 1 + 100,
        });
      }

      return requests;
    }

    if (this.activeType === "enf") {
      const graphic = coerceNumber(record.graphic);
      if (graphic <= 0) {
        return [];
      }

      const baseGraphic = (graphic - 1) * 40;
      const frameOffsets = [5, 6, 7, 8, 9, 10, 11, 12];
      return [
        {
          key: `npc:${graphic}`,
          label: "NPC Animation",
          fileID: 21,
          resourceIDs: frameOffsets.map((offset) => baseGraphic + offset + 100),
          frameDuration: 120,
        },
      ];
    }

    if (this.activeType === "esf") {
      const requests = [];

      const iconID = coerceNumber(record.iconId);
      if (iconID > 0) {
        requests.push({
          key: `skill-icon:${iconID}`,
          label: "Skill Icon",
          fileID: 25,
          resourceID: iconID + 100,
        });
      }

      const graphicID = coerceNumber(record.graphicId);
      if (graphicID > 0) {
        const baseResourceID = 101 + (graphicID - 1) * 3;
        const spellMetadata = getSpellMetadata(graphicID);
        requests.push({
          key: `skill-spell:${graphicID}`,
          label: "Spell Animation",
          fileID: 24,
          resourceID: baseResourceID + 2,
          frameCount: spellMetadata.frames,
          loops: spellMetadata.loops,
          frameDuration: 200,
        });
      }

      return requests;
    }

    return [];
  }

  async refreshPreviews() {
    const requests = this.getPreviewRequests();
    const token = ++this.previewLoadToken;

    if (requests.length === 0) {
      this.previewEntries = [];
      return;
    }

    if (!this.gfxLoader) {
      this.previewEntries = requests.map((request) => ({
        ...request,
        status: "unavailable",
      }));
      return;
    }

    this.previewEntries = requests.map((request) => ({
      ...request,
      status: "loading",
    }));

    const entries = await Promise.all(
      requests.map((request) => this.loadPreviewEntry(request)),
    );

    if (token !== this.previewLoadToken) {
      return;
    }

    this.previewEntries = entries;
  }

  async loadPreviewEntry(request) {
    try {
      await this.gfxLoader.loadEGF(request.fileID);

      if (
        Array.isArray(request.resourceIDs) &&
        request.resourceIDs.length > 0
      ) {
        const frameDataUrls = [];

        for (const resourceID of request.resourceIDs) {
          const frameData = await this.gfxLoader.loadResource(
            request.fileID,
            resourceID,
          );
          if (!frameData || !frameData.width || !frameData.height) {
            continue;
          }
          const frameDataUrl = this.imageDataToDataURL(frameData);
          if (frameDataUrl) {
            frameDataUrls.push(frameDataUrl);
          }
        }

        if (frameDataUrls.length === 0) {
          return {
            ...request,
            status: "missing",
          };
        }

        return {
          ...request,
          status: "ready",
          dataUrl: frameDataUrls[0],
          frameDataUrls,
          frameDuration: request.frameDuration || PREVIEW_ANIMATION_TICK_MS,
        };
      }

      const imageData = await this.gfxLoader.loadResource(
        request.fileID,
        request.resourceID,
      );

      if (!imageData || !imageData.width || !imageData.height) {
        return {
          ...request,
          status: "missing",
        };
      }

      if ((request.frameCount || 0) > 1) {
        const frameDataUrls = this.extractFrameDataURLsFromSpriteSheet(
          imageData,
          request.frameCount,
          request.loops || 1,
        );

        if (frameDataUrls.length > 0) {
          return {
            ...request,
            status: "ready",
            dataUrl: frameDataUrls[0],
            frameDataUrls,
            frameDuration: request.frameDuration || PREVIEW_ANIMATION_TICK_MS,
          };
        }
      }

      const dataUrl = this.imageDataToDataURL(imageData);
      if (!dataUrl) {
        return {
          ...request,
          status: "missing",
        };
      }

      return {
        ...request,
        status: "ready",
        dataUrl,
        frameDuration: request.frameDuration || PREVIEW_ANIMATION_TICK_MS,
      };
    } catch (error) {
      console.error("Failed to load preview", request, error);
      return {
        ...request,
        status: "error",
      };
    }
  }

  imageDataToDataURL(imageData) {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  }

  extractFrameDataURLsFromSpriteSheet(imageData, frameCount, loops) {
    if (
      !imageData ||
      !imageData.width ||
      !imageData.height ||
      frameCount <= 1
    ) {
      const dataUrl = this.imageDataToDataURL(imageData);
      return dataUrl ? [dataUrl] : [];
    }

    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = imageData.width;
    sourceCanvas.height = imageData.height;

    const sourceContext = sourceCanvas.getContext("2d");
    if (!sourceContext) {
      return [];
    }

    sourceContext.putImageData(imageData, 0, 0);

    const frameWidth = Math.floor(imageData.width / frameCount);
    const frameHeight = imageData.height;
    if (frameWidth <= 0 || frameHeight <= 0) {
      return [];
    }

    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = frameWidth;
    frameCanvas.height = frameHeight;

    const frameContext = frameCanvas.getContext("2d");
    if (!frameContext) {
      return [];
    }

    const uniqueFrames = [];
    for (let index = 0; index < frameCount; ++index) {
      frameContext.clearRect(0, 0, frameWidth, frameHeight);
      frameContext.drawImage(
        sourceCanvas,
        index * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight,
      );
      uniqueFrames.push(frameCanvas.toDataURL("image/png"));
    }

    const loopsToUse = Math.max(1, loops || 1);
    const frameDataUrls = [];
    for (let loopIndex = 0; loopIndex < loopsToUse; ++loopIndex) {
      frameDataUrls.push(...uniqueFrames);
    }

    return frameDataUrls;
  }

  switchType(type) {
    if (type === this.activeType) {
      return;
    }
    this.activeType = type;
    this.ensureValidSelection(type);
  }

  onFilterInput = (event) => {
    this.updateTypeState(this.activeType, { filter: event.target.value || "" });
  };

  selectRecord(id) {
    this.updateTypeState(this.activeType, { selectedId: id });
  }

  onFieldChange(field, event) {
    if (!this.selectedRecord) {
      return;
    }

    let newValue;
    switch (field.type) {
      case "boolean":
        newValue = !!event.target.checked;
        break;
      case "number":
        newValue = coerceNumber(event.target.value);
        break;
      default:
        newValue = event.target.value || "";
        break;
    }

    const updatedRecord = { ...this.selectedRecord, [field.key]: newValue };
    const updatedRecords = this.currentState.data.records.map((record) =>
      record.id === this.selectedRecord.id ? updatedRecord : record,
    );

    this.updateTypeState(this.activeType, {
      data: {
        ...this.currentState.data,
        records: updatedRecords,
      },
      dirty: true,
    });
  }

  addRecord = () => {
    const records = this.currentRecords;
    const nextId = Math.max(0, ...records.map((record) => record.id || 0)) + 1;
    const newRecord = createDefaultRecord(this.activeType, nextId);
    this.updateTypeState(this.activeType, {
      data: {
        ...this.currentState.data,
        records: [...this.currentState.data.records, newRecord],
      },
      selectedId: nextId,
      dirty: true,
    });
    this.setStatus(`Added record #${nextId}.`, "success");
  };

  duplicateRecord = () => {
    const record = this.selectedRecord;
    if (!record) {
      return;
    }

    const records = this.currentRecords;
    const nextId = Math.max(0, ...records.map((item) => item.id || 0)) + 1;
    const duplicate = {
      ...record,
      id: nextId,
      name: `${record.name || "Unnamed"} (Copy)`,
    };

    this.updateTypeState(this.activeType, {
      data: {
        ...this.currentState.data,
        records: [...this.currentState.data.records, duplicate],
      },
      selectedId: nextId,
      dirty: true,
    });
    this.setStatus(`Duplicated record #${record.id}.`, "success");
  };

  deleteRecord = () => {
    const record = this.selectedRecord;
    if (!record) {
      return;
    }

    const confirmed = confirm(`Delete record #${record.id}?`);
    if (!confirmed) {
      return;
    }

    const nextRecords = this.currentState.data.records.filter(
      (item) => item.id !== record.id,
    );
    const nextSelectedId =
      nextRecords.length > 0
        ? [...nextRecords].sort((a, b) => (a.id || 0) - (b.id || 0))[0].id
        : null;

    this.updateTypeState(this.activeType, {
      data: { ...this.currentState.data, records: nextRecords },
      selectedId: nextSelectedId,
      dirty: true,
    });
    this.setStatus(`Deleted record #${record.id}.`, "success");
  };

  async openActiveFile() {
    if (!this.fileSystemProvider?.supported) {
      this.setStatus(
        "File picker is not available in this environment.",
        "error",
      );
      return false;
    }

    if (
      this.currentState.dirty &&
      !confirm("Discard unsaved changes for this file type?")
    ) {
      return false;
    }

    let fileHandle;
    const config = this.currentTypeConfig;

    try {
      [fileHandle] = await this.fileSystemProvider.showOpenFilePicker({
        types: [
          {
            description: config.description,
            accept: {
              "*/*": [config.extension],
            },
          },
        ],
      });
    } catch (error) {
      if (error.name === "AbortError") {
        return false;
      }
      this.setStatus(`Open failed: ${error.message}`, "error");
      return false;
    }

    return this.loadFileHandle(this.activeType, fileHandle);
  }

  async loadFileHandle(type, fileHandle) {
    try {
      const file = await fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      const parsed = TYPE_CONFIG[type].parser.parse(arrayBuffer);
      const records = [...(parsed.records || [])].sort(
        (a, b) => (a.id || 0) - (b.id || 0),
      );

      this.updateTypeState(type, {
        fileHandle,
        data: {
          version: parsed.version || 1,
          rid: parsed.rid || [records.length, records.length],
          records,
        },
        dirty: false,
        selectedId: records.length > 0 ? records[0].id : null,
      });

      this.setStatus(`Loaded ${fileHandle.name}.`, "success");
      return true;
    } catch (error) {
      this.setStatus(`Load failed: ${error.message}`, "error");
      return false;
    }
  }

  async saveActiveFile() {
    if (!this.fileSystemProvider?.supported) {
      this.setStatus("Saving is not available in this environment.", "error");
      return false;
    }

    if (!this.currentState.fileHandle) {
      return this.saveActiveFileAs();
    }

    try {
      const bytes = this.serializeType(this.activeType);
      await this.currentState.fileHandle.write(bytes);

      this.updateTypeState(this.activeType, { dirty: false });
      this.setStatus(`Saved ${this.currentState.fileHandle.name}.`, "success");
      return true;
    } catch (error) {
      this.setStatus(`Save failed: ${error.message}`, "error");
      return false;
    }
  }

  async saveActiveFileAs() {
    if (!this.fileSystemProvider?.supported) {
      this.setStatus("Saving is not available in this environment.", "error");
      return false;
    }

    const config = this.currentTypeConfig;
    const suggestedName =
      this.currentState.fileHandle?.name || config.defaultFilename;
    let fileHandle;

    try {
      fileHandle = await this.fileSystemProvider.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: config.description,
            accept: {
              "*/*": [config.extension],
            },
          },
        ],
      });
    } catch (error) {
      if (error.name === "AbortError") {
        return false;
      }
      this.setStatus(`Save As failed: ${error.message}`, "error");
      return false;
    }

    this.updateTypeState(this.activeType, { fileHandle });
    return this.saveActiveFile();
  }

  serializeType(type) {
    const state = this.typeState[type];
    const records = [...(state.data.records || [])].sort(
      (a, b) => (a.id || 0) - (b.id || 0),
    );
    const payload = {
      ...state.data,
      records,
      totalLength: records.length,
    };
    if (!payload.rid && (type === "eif" || type === "ecf" || type === "esf")) {
      payload.rid = [records.length, records.length];
    }
    return TYPE_CONFIG[type].parser.serialize(payload);
  }

  ensureValidSelection(type) {
    const state = this.typeState[type];
    const records = [...(state.data.records || [])].sort(
      (a, b) => (a.id || 0) - (b.id || 0),
    );
    if (records.length === 0) {
      if (state.selectedId !== null) {
        this.updateTypeState(type, { selectedId: null });
      }
      return;
    }
    if (records.some((record) => record.id === state.selectedId)) {
      return;
    }
    this.updateTypeState(type, { selectedId: records[0].id });
  }

  updateTypeState(type, patch) {
    const current = this.typeState[type];
    this.typeState = {
      ...this.typeState,
      [type]: {
        ...current,
        ...patch,
      },
    };
  }

  setStatus(message, level) {
    this.statusMessage = message;
    this.statusLevel = level;
  }
}
