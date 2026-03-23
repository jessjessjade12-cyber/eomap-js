import { Tool } from "./tool";
import { LIGHTING_LAYER } from "../scenes/palette-scene";

export class DrawTool extends Tool {
  handleLeftPointerDown(mapEditor) {
    if (mapEditor.selectedLayer === LIGHTING_LAYER) {
      mapEditor.doPlaceLightCommand();
    } else {
      mapEditor.doDrawCommand(mapEditor.selectedDrawID);
    }
  }

  handleRightPointerDown(mapEditor) {
    mapEditor.doEraseCommand();
  }

  handleLeftPointerUp(mapEditor) {
    mapEditor.finalizeDraw();
  }

  handleRightPointerUp(mapEditor) {
    mapEditor.finalizeDraw();
  }

  shouldPointerDownOnMove() {
    return true;
  }
}
