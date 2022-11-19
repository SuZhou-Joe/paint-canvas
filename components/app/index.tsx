import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { create, set } from "lodash";
import { Spin } from "antd";
import ConnectButton from "../connect-button";
import ImageBlock, { IImageBlockProps } from "../image-block";
import Actions from "../../containers/actions";
import { blockMetaData, Point } from "../../interface";
import CanvasContext from "../../context/canvas-context";
import styles from "./index.module.css";
import { formatCanvas, getIdFromPoint, getLatestCanvas } from "../../utils";
import { useHover } from "ahooks";
import { ethers } from "ethers";
import abi from "../../abi/abi.json"

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

  async function createOasis() {
    // const ethereum = (window as any).ethereum;
    // const accounts = await ethereum.request({
    //   method: "eth_requestAccounts",
    // });
    // const provider = new ethers.providers.Web3Provider(ethereum)
    // const walletAddress = accounts[0]    // first account in MetaMask
    // const signer = provider.getSigner(walletAddress)

        // Second parameter is chainId, 1 for Ethereum mainnet 
        const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/UP7-vCgH4OfFwUygRDLg8dXpADY-zb3T", 31415);
        const signer = new ethers.Wallet("PRIVATE KEY", provider);

        const oasisContract = new ethers.Contract("0x7b35a95c5848C61741382a18A833ef460EBfCf22", abi, signer)

        const mint = await oasisContract.createOasis("//ipfs.moralis.io:2053/ipfs/QmR35ZYRTyt7sfMpwr2QpFvENCMAfrWzC7d7w7Pa6z3phf", "1", "5")

        console.log("Successfully minted" , mint)
  }
  return (
    <CanvasContext.Provider
      value={{
        focusedPoint,
        updateFocusedPoint: setFocusedPoint,
        canvasMeta: canvasMetadata,
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
        style={{ padding: "20px", display: "flex", justifyContent: "flex-end", gap: "20px" }}
      >
        <button style={{ padding: "20px", display: "flex", justifyContent: "flex-end", background: "white", borderRadius: "20px", fontWeight: "bold" }} 
        onClick={createOasis}>Mint NFT</button>
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
