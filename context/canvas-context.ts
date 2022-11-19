import React from "react";
import { Point, blockMetaData } from "../interface";

export default React.createContext<{
  focusedPoint: Point | null;
  updateFocusedPoint: (focusedPoint: Point) => void;
  canvasMeta: Record<string, blockMetaData>;
  updateCanvasMeta: (point: Point, payload: Partial<blockMetaData>) => Promise<any>;
  focusedMetaData?: blockMetaData;
}>({
  focusedPoint: null,
  canvasMeta: {},
  updateCanvasMeta: () => {
    return Promise.resolve();
  },
  updateFocusedPoint: () => null
});
