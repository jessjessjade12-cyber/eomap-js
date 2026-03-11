import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@spectrum-web-components/action-button/sp-action-button.js";

@customElement("eomap-workspace-switcher")
export class WorkspaceSwitcher extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: var(--spectrum-global-dimension-size-50)
          var(--spectrum-global-dimension-size-150);
        background-color: var(--spectrum-global-color-gray-300);
      }
      .buttons {
        display: flex;
        gap: var(--spectrum-global-dimension-size-75);
      }
      .workspace-button {
        --spectrum-actionbutton-m-textonly-background-color: var(
          --spectrum-global-color-gray-400
        );
        --spectrum-actionbutton-m-textonly-border-color: var(
          --spectrum-global-color-gray-300
        );
        --spectrum-actionbutton-m-textonly-background-color-hover: var(
          --spectrum-global-color-gray-300
        );
        --spectrum-actionbutton-m-textonly-border-color-hover: var(
          --spectrum-global-color-gray-300
        );
        --spectrum-actionbutton-m-textonly-background-color-down: var(
          --spectrum-global-color-gray-200
        );
        --spectrum-actionbutton-m-textonly-border-color-down: var(
          --spectrum-global-color-gray-200
        );
        --spectrum-actionbutton-textonly-height: 24px;
      }
    `;
  }

  @property({ type: String })
  selected = "map";

  renderButton(label, value) {
    return html`
      <sp-action-button
        class="workspace-button"
        ?selected=${this.selected === value}
        @click=${() => this.onWorkspaceClick(value)}
      >
        ${label}
      </sp-action-button>
    `;
  }

  render() {
    return html`
      <div class="buttons">
        ${this.renderButton("Map", "map")}
        ${this.renderButton("Quest", "quest")}
        ${this.renderButton("Pub", "pub")}
      </div>
    `;
  }

  onWorkspaceClick(value) {
    if (value === this.selected) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("workspace-selected", {
        detail: value,
      }),
    );
  }
}
