import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { set } from "lodash";
import { Spin } from "antd";
import ConnectButton from "../connect-button";
import ImageBlock, { IImageBlockProps } from "../image-block";
import Actions from "../../containers/actions";
import { blockMetaData, Point } from "../../interface";
import CanvasContext from "../../context/canvas-context";
import styles from "./index.module.css";
import { formatCanvas, getIdFromPoint, getLatestCanvas } from "../../utils";
import abi from "../../abi/abi.json";

export default function App() {
  const wrapperRef = useRef<ReactZoomPanPinchRef>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [canvasMetadata, updateCanvasMetadata] = useState<
    Record<string, blockMetaData>
  >({});
  const [focusedPoint, setFocusedPoint] = useState({} as Point);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const payload: {}[][] = [];
  for (let i = 0; i < 100; i++) {
    payload.push([]);
    for (let j = 0; j < 100; j++) {
      payload[i].push({});
    }
  }
  const [payloadState, setPayloadState] = useState(payload);
  const onZoomIn: IImageBlockProps["onClick"] = useCallback((point: Point) => {
    const blockWidth = 512;
    const { x, y } = point;
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    const calculatedPoint: Point = {
      x: -(x + 1 / 2) * blockWidth + innerWidth / 2,
      y: -(y + 1 / 2) * blockWidth + innerHeight / 2,
    };
    console.log("point is: ", point)
    setFocusedPoint(point);
    setGenerateModalVisible(true);
    wrapperRef.current?.setTransform(calculatedPoint.x, calculatedPoint.y, 1);
  }, []);
  const onImageGenerated = (image: string) => {
    set(payloadState, `${focusedPoint.y}.${focusedPoint.x}.image`, image);
    setPayloadState([...payloadState]);
  };
  useEffect(() => {
    (async () => {
      setLoading(true);
      const json = await getLatestCanvas();
      updateCanvasMetadata(formatCanvas(json));
      setLoading(false);
    })();
  }, []);
  return (
    <CanvasContext.Provider
      value={{
        focusedPoint,
        updateFocusedPoint: setFocusedPoint,
        canvasMeta: canvasMetadata,
        focusedMetaData: typeof focusedPoint.x === 'number' ? canvasMetadata[getIdFromPoint(focusedPoint)] : undefined,
        updateCanvasMeta(point, payload) {
          canvasMetadata[getIdFromPoint(point)] = {
            ...(canvasMetadata[getIdFromPoint(point)] as object),
            ...(payload as object),
          } as blockMetaData;
          updateCanvasMetadata({ ...canvasMetadata });
          return Promise.resolve(true);
        },
      }}
    >
      <div
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "20px",
        }}
      >
        <ConnectButton />
      </div>
      <TransformWrapper
        centerZoomedOut
        minScale={0.005}
        ref={wrapperRef}
        doubleClick={{
          disabled: true,
        }}
      >
        <TransformComponent>
          <Spin spinning={loading}>
            <div className={styles.bodyContainer}>
              {payloadState.map((rowBlocks, rowIndex) => {
                return (
                  <div key={rowIndex} className={styles.blockRow}>
                    {rowBlocks.map((block, blockIndex) => {
                      const point = { y: rowIndex, x: blockIndex };
                      const isFocused =
                        getIdFromPoint(focusedPoint) === getIdFromPoint(point);
                      return (
                        <ImageBlock
                          blockData={canvasMetadata[getIdFromPoint(point)]}
                          isFocused={isFocused}
                          point={point}
                          onClick={onZoomIn}
                          key={getIdFromPoint(point)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Spin>
        </TransformComponent>
        <Actions
          visible={generateModalVisible}
          onImageGenerated={onImageGenerated}
        />
      </TransformWrapper>
    </CanvasContext.Provider>
  );
}
