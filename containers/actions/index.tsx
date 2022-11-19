import React, { useContext, useState } from "react";
import { Input, Button } from "antd";
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

export default function Actions(props: {
  visible: boolean;
  onImageGenerated: (image: string) => void;
}) {
  const canvasContext = useContext(CanvasContext);
  const requestContext = useContext(RequestContext);
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
      const focusedMeta = canvasContext.canvasMeta[
        getIdFromPoint(canvasContext.focusedPoint as Point)
      ] as blockMetaData;
      if (focusedMeta.image) {
        const cid = await nftClient.storeBlob(dataURLToFile(focusedMeta.image));
        let latestJson: Record<string, blockMetaData> = {};
        try {
          latestJson = await getLatestCanvas() || {};
        } catch (e) {
          latestJson = {}
        }
        latestJson[getIdFromPoint(canvasContext.focusedPoint as Point)] = {
          ...focusedMeta,
          image: cid
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
          disabled={loading}
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
      >
        Upload
      </Button>
    </div>
  ) : null;
}
