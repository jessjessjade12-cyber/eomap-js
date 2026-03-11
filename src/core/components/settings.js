import { html, LitElement } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";

import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/field-group/sp-field-group.js";
import "@spectrum-web-components/accordion/sp-accordion-item.js";
import "@spectrum-web-components/button/sp-button.js";

import "./accordion";
import "./modal";
import "./folderfield";
import "./textfield";

import { SettingsState } from "../state/settings-state";
import { FileSystemProvider } from "../filesystem/file-system-provider";
import {
  convertVSCodeThemeToCustomTheme,
  getVSCodeThemeEntriesFromPackageJson,
  parseVSCodeJson,
  resolveRelativeThemePath,
  resolveVSCodeTheme,
} from "../util/vscode-theme-utils";

@customElement("eomap-settings")
export class Settings extends LitElement {
  @query("eomap-accordion")
  accordion;

  @query("#gfx", true)
  gfx;

  @query("#assets", true)
  assets;

  @query("#connected-mode-enabled", true)
  connectedModeEnabled;

  @query("#connected-mode-url", true)
  connectedModeURL;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: FileSystemProvider })
  fileSystemProvider = null;

  @state({ type: Boolean })
  connectedModeEnabledState = false;

  @state({ type: String })
  connectedModeURLState = false;

  @state({ type: Object })
  customThemeState = null;

  @state({ type: String })
  themeStatusMessage = "";

  @state({ type: Boolean })
  themeStatusError = false;

  updated(changed) {
    if (changed.has("open")) {
      this.manageOpen();
    }
  }

  manageOpen() {
    if (this.open) {
      this.accordion.expand();
    }
  }

  renderGraphics() {
    return html`
      <sp-field-group vertical>
        <eomap-folderfield
          id="gfx"
          label="Path to GFX"
          .fileSystemProvider=${this.fileSystemProvider}
        ></eomap-folderfield>
        <eomap-folderfield
          id="assets"
          label="Path to Mapper Assets"
          placeholder="<Use default>"
          .fileSystemProvider=${this.fileSystemProvider}
        ></eomap-folderfield>
      </sp-field-group>
    `;
  }

  renderConnectedMode() {
    return html`
      <sp-field-group vertical>
        <sp-field-label for="connected-mode-enabled"> Enabled </sp-field-label>
        <sp-switch
          id="connected-mode-enabled"
          .checked=${!!FORCE_CONNECTED_MODE_URL ||
          this.connectedModeEnabledState}
          .disabled=${!!FORCE_CONNECTED_MODE_URL}
          @click=${() => {
            this.connectedModeEnabledState = !this.connectedModeEnabledState;
            if (this.connectedModeEnabledState) {
              this.gfx.invalid = false;
            } else if (!this.connectedModeURL.value) {
              this.connectedModeURL.invalid = false;
            }
          }}
          emphasized
        >
        </sp-switch>
        <sp-field-label for="connected-mode-url">
          Mapper Service URL
        </sp-field-label>
        <eomap-textfield
          id="connected-mode-url"
          placeholder="https://example.com"
          pattern="https://.*"
          .disabled=${!!FORCE_CONNECTED_MODE_URL}
          @input=${(e) => {
            this.connectedModeURLState = e.target.value;
          }}
        >
        </eomap-textfield>
      </sp-field-group>
    `;
  }

  renderTheme() {
    return html`
      <sp-field-group vertical>
        <sp-field-label for="theme-name">Current Theme</sp-field-label>
        <div id="theme-name" class="theme-name">
          ${this.customThemeState?.name || "Default EOSTUDIO Theme"}
        </div>
        <div class="theme-actions">
          <sp-button variant="secondary" @click=${this.importVSCodeTheme}>
            Import VSCode Theme
          </sp-button>
          <sp-button
            variant="secondary"
            ?disabled=${!this.customThemeState}
            @click=${this.clearCustomTheme}
          >
            Use Default Theme
          </sp-button>
        </div>
        ${this.themeStatusMessage
          ? html`
              <p class="theme-status ${this.themeStatusError ? "error" : ""}">
                ${this.themeStatusMessage}
              </p>
            `
          : null}
      </sp-field-group>
    `;
  }

  render() {
    return html`
      <eomap-modal
        headline="Settings"
        confirm-label="Save"
        cancel-label="Cancel"
        .open=${this.open}
        .width=${532}
        @confirm=${this.confirm}
        @cancel=${this.cancel}
        @close=${this.close}
      >
        <style>
          eomap-folderfield {
            --spectrum-folderfield-min-width: 388px;
            margin-bottom: 10px;
          }
          eomap-textfield {
            --spectrum-textfield-texticon-min-width: 388px;
            margin-bottom: 10px;
          }
          .theme-name {
            width: 388px;
            color: var(--spectrum-alias-component-text-color-default);
            font-size: 12px;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .theme-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 8px;
          }
          .theme-status {
            font-size: 11px;
            color: var(--spectrum-semantic-positive-color-default);
            margin-top: 0;
            margin-bottom: 0;
          }
          .theme-status.error {
            color: var(--spectrum-semantic-negative-color-default);
          }
        </style>
        <eomap-accordion>
          <sp-accordion-item
            label="Graphics"
            style="${!!FORCE_CONNECTED_MODE_URL ? "display: none;" : ""}"
          >
            ${this.renderGraphics()}
          </sp-accordion-item>
          <sp-accordion-item label="Connected Mode">
            ${this.renderConnectedMode()}
          </sp-accordion-item>
          <sp-accordion-item label="Theme"
            >${this.renderTheme()}</sp-accordion-item
          >
        </eomap-accordion>
      </eomap-modal>
    `;
  }

  populate(settingsState) {
    this.gfx.selected = settingsState.gfxDirectory;
    this.gfx.invalid = false;
    this.assets.selected = settingsState.customAssetsDirectory;
    this.connectedModeURL.value =
      FORCE_CONNECTED_MODE_URL || settingsState.connectedModeURL;
    this.connectedModeURL.invalid = false;

    this.connectedModeEnabledState = settingsState.connectedModeEnabled;
    this.connectedModeURLState = settingsState.connectedModeURL;
    this.customThemeState = settingsState.customTheme ?? null;
    this.themeStatusMessage = "";
    this.themeStatusError = false;
  }

  validateFields() {
    if (FORCE_CONNECTED_MODE_URL || this.connectedModeEnabledState) {
      this.gfx.invalid = false;
      if (!this.connectedModeURL.value) {
        this.connectedModeURL.invalid = true;
      }
    } else {
      if (!this.gfx.selected) {
        this.gfx.invalid = true;
      }
      if (!this.connectedModeURL.value) {
        this.connectedModeURL.invalid = false;
      }
    }

    return !this.gfx.invalid && !this.connectedModeURL.invalid;
  }

  confirm(_event) {
    if (this.validateFields()) {
      this.open = false;
      this.dispatchEvent(
        new CustomEvent("save", {
          detail: SettingsState.fromValues(
            this.gfx.selected,
            this.assets.selected,
            this.connectedModeEnabledState,
            this.connectedModeURLState,
            this.customThemeState,
          ),
        }),
      );
    }
  }

  canResolveLinkedThemeFiles(handle) {
    if (!handle || typeof handle.path !== "string") {
      return false;
    }

    const normalizedPath = handle.path.replace(/\\/g, "/");
    return normalizedPath.lastIndexOf("/") > 0;
  }

  basename(path) {
    const normalizedPath = path.replace(/\\/g, "/");
    const index = normalizedPath.lastIndexOf("/");
    return index === -1 ? normalizedPath : normalizedPath.slice(index + 1);
  }

  async readThemeTextAtPath(path) {
    const handle = this.fileSystemProvider.deserializeHandle({
      name: this.basename(path),
      path,
      kind: "file",
    });
    const file = await handle.getFile();
    return file.text();
  }

  async resolveImportedTheme(handle) {
    const file = await handle.getFile();
    const rawText = await file.text();
    const selectedJson = parseVSCodeJson(rawText, handle.name || "theme file");

    const linkedFileSupport = this.canResolveLinkedThemeFiles(handle);
    const loadByPath = linkedFileSupport
      ? async (path) => this.readThemeTextAtPath(path)
      : null;

    const manifestEntries = getVSCodeThemeEntriesFromPackageJson(selectedJson);
    const looksLikeManifest =
      manifestEntries.length > 0 &&
      !selectedJson.colors &&
      !selectedJson.tokenColors;

    if (looksLikeManifest) {
      if (!linkedFileSupport) {
        throw new Error(
          "Theme packages can only be imported in the desktop app.",
        );
      }

      const preferredEntry =
        manifestEntries.find((entry) => entry.type !== "light") ||
        manifestEntries[0];
      const themePath = resolveRelativeThemePath(
        handle.path,
        preferredEntry.path,
      );
      const themeText = await loadByPath(themePath);
      const themeJson = parseVSCodeJson(
        themeText,
        `theme '${preferredEntry.label}'`,
      );

      const resolvedTheme = await resolveVSCodeTheme(themeJson, {
        sourcePath: themePath,
        loadByPath,
      });

      if (!resolvedTheme.name) {
        resolvedTheme.name = preferredEntry.label;
      }
      if (!resolvedTheme.type) {
        resolvedTheme.type = preferredEntry.type;
      }

      return {
        themeJson: resolvedTheme,
        sourceLabel:
          manifestEntries.length > 1
            ? `extension package: ${preferredEntry.label}`
            : "extension package",
      };
    }

    const resolvedTheme = await resolveVSCodeTheme(selectedJson, {
      sourcePath: linkedFileSupport ? handle.path : null,
      loadByPath,
    });

    return {
      themeJson: resolvedTheme,
      sourceLabel: "",
    };
  }

  setThemeStatus(message, isError) {
    this.themeStatusMessage = message;
    this.themeStatusError = !!isError;
  }

  clearCustomTheme = () => {
    this.customThemeState = null;
    this.setThemeStatus("Using default EOSTUDIO theme.", false);
  };

  importVSCodeTheme = async () => {
    if (!this.fileSystemProvider?.supported) {
      this.setThemeStatus(
        "Theme import is unavailable in this environment.",
        true,
      );
      return;
    }

    let handle;
    try {
      [handle] = await this.fileSystemProvider.showOpenFilePicker({
        types: [
          {
            description: "VSCode Theme or Extension JSON",
            accept: { "*/*": [".json", ".jsonc"] },
          },
        ],
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        this.setThemeStatus("Failed to open theme file picker.", true);
      }
      return;
    }

    try {
      const { themeJson, sourceLabel } =
        await this.resolveImportedTheme(handle);
      const convertedTheme = convertVSCodeThemeToCustomTheme(themeJson);
      this.customThemeState = convertedTheme;
      this.setThemeStatus(
        `Loaded theme: ${convertedTheme.name}${
          sourceLabel ? ` (${sourceLabel})` : ""
        }`,
        false,
      );
    } catch (error) {
      console.error("Failed to import VSCode theme", error);
      this.setThemeStatus(`Theme import failed: ${error.message}`, true);
    }
  };

  cancel(_event) {
    this.open = false;
  }

  close(_event) {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }
}
