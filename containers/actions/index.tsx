import React, { useContext, useState } from "react";
import { Input, Button, message } from "antd";
import { EnterOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { NFTStorage } from "nft.storage";
const nftClient = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDlFOWE1YURGODY3OWZiQTFGNjc4ZmFjQmQzNTQ2QzlBRjM0NTAxNTIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2ODgzNzM4OTM3OCwibmFtZSI6InBhaW50LW1lIn0.MpCbrDKuJVNtNSwyxRjtxj5IQJ32RJceyXvccXn0bG8",
});
import RequestContext from "../../context/request-context";
import styles from "./index.module.css";
import CanvasContext from "../../context/canvas-context";
import { blockMetaData, Point } from "../../interface";
import { CANVAS_CID_KEY, dataURLToFile, getIdFromPoint, getIpfsUrl, getLatestCanvas } from "../../utils";
import abi from "../../abi/abi.json"
import { useAccount } from "wagmi";
import { ethers } from "ethers";

export default function Actions(props: {
  visible: boolean;
  onImageGenerated: (image: string) => void;
}) {
  const canvasContext = useContext(CanvasContext);
  const requestContext = useContext(RequestContext);
  const { address } = useAccount();
  const { loading, runAsync } = useRequest(
    (name) =>
      requestContext.requestWithSigned({
        url: "/api/image_generate?prompt=" + encodeURIComponent(name),
      }),
    {
      manual: true,
    }
  );
  const { loading: uploadLoading, runAsync: uploadRunAsync } = useRequest(
    async () => {
      const focusedPoint = canvasContext.focusedPoint as Point;
      const focusedMeta = canvasContext.focusedMetaData as blockMetaData;
      if (focusedMeta.image) {
        let payload: blockMetaData = {
          prompt,
        };
        if (!focusedMeta.tokenAddress) {
          const ethereum = (window as any).ethereum;
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner(address);
          const oasisContract = new ethers.Contract(
            "0x1C4C9CA5DB0a30227F709BEAD5039b4CD01751D1",
            abi,
            signer
          );
      
          try {
            const mint = await oasisContract.createOasis(
              "//ipfs.moralis.io:2053/ipfs/QmR35ZYRTyt7sfMpwr2QpFvENCMAfrWzC7d7w7Pa6z3phf",
              focusedPoint.x,
              focusedPoint.y
            );
            console.log(focusedPoint.x, focusedPoint.y)
            payload.tokenAddress = mint.hash;
          } catch (e: any) {
            message.error(e.message.replace(/\([^\)]*\)/, ''));
            return ;
          }
        }
        
        const cid = await nftClient.storeBlob(dataURLToFile(focusedMeta.image));
        payload.image = cid;

        let latestJson: Record<string, blockMetaData> = {};
        try {
          latestJson = await getLatestCanvas() || {};
        } catch (e) {
          latestJson = {}
        }

        latestJson[getIdFromPoint(focusedPoint)] = {
          ...focusedMeta,
          ...payload
        };

        const canvasCid = await nftClient.storeBlob(new File(
          JSON.stringify(latestJson).split(''),
          'canvas_cid.json',
          {
            type: 'application/json'
          }
        ));
        await requestContext.requestWithSigned({
          url: `/api/store_set?key=${CANVAS_CID_KEY}&value=${canvasCid}`,
        });
        canvasContext.updateCanvasMeta(canvasContext.focusedPoint as Point, {
          image: getIpfsUrl(cid),
        });
      }
    },
    {
      manual: true
    }
  );
  const [prompt, setPrompt] = useState("");
  return props.visible ? (
    <div className={styles.inputContainer}>
      <Input.Group size="large" style={{ width: "50vw" }} compact>
        <Input
          size="large"
          style={{ width: "80%" }}
          placeholder="Type something to generate your masterpiece"
          disabled={loading}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button
          onClick={async () => {
            const result = await runAsync(prompt);
            canvasContext.updateCanvasMeta(
              canvasContext.focusedPoint as Point,
              {
                image: `data:${result.data.response.mimeType};base64,${result.data.response.base64}`,
              }
            );
          }}
          loading={loading}
          disabled={loading || !prompt}
          size="large"
          style={{ width: "20%" }}
        >
          Generate
          <EnterOutlined />
        </Button>
      </Input.Group>
      <Button
        style={{
          margin: "30px auto",
        }}
        size="large"
        loading={uploadLoading}
        onClick={uploadRunAsync}
        disabled={uploadLoading || !canvasContext.focusedMetaData?.image || canvasContext.focusedMetaData?.image.startsWith('http')}
      >
        Upload
      </Button>
    </div>
  ) : null;
}
