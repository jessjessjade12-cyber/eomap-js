export class SettingsState {
  constructor() {
    this.gfxDirectory = null;
    this.customAssetsDirectory = null;
    this.connectedModeEnabled = false;
    this.connectedModeURL = "";
    this.customTheme = null;
  }

  static fromValues(
    gfxDirectory,
    customAssetsDirectory,
    connectedModeEnabled,
    connectedModeURL,
    customTheme,
  ) {
    let result = new SettingsState();
    result.gfxDirectory = gfxDirectory;
    result.customAssetsDirectory = customAssetsDirectory;
    result.connectedModeEnabled = connectedModeEnabled;
    result.connectedModeURL = connectedModeURL;
    result.customTheme = customTheme ?? null;
    return result;
  }

  static fromIDB(settings) {
    if (settings === undefined) {
      settings = {};
    }

    return SettingsState.fromValues(
      settings.gfxDirectory ?? null,
      settings.customAssetsDirectory ?? null,
      settings.connectedModeEnabled ?? false,
      settings.connectedModeURL ?? "",
      settings.customTheme ?? null,
    );
  }
}
