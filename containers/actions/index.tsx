import React, { useContext, useEffect, useState } from "react";
import { Input, Button, message, notification } from "antd";
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

export const getContract = (address: string) => {
  const ethereum = (global as any).ethereum;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner(address);
  const oasisContract = new ethers.Contract(
    "0x1C4C9CA5DB0a30227F709BEAD5039b4CD01751D1",
    abi,
    signer
  );

  return oasisContract;
}

export default function Actions(props: {
  visible: boolean;
  onImageGenerated: (image: string) => void;
}) {
  const canvasContext = useContext(CanvasContext);
  const requestContext = useContext(RequestContext);
  const { address } = useAccount();
  const [isOwner, setIsOwner] = useState(false);
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
        notification.info({
          message: 'Uploading your masterpiece...',
          placement: 'bottomRight'
        });
        const cid = await nftClient.storeBlob(dataURLToFile(focusedMeta.image));
        payload.image = cid;
        notification.success({
          message: 'Masterpiece uploaded',
          placement: 'bottomRight'
        });
        if (!focusedMeta.tokenAddress) {
          try {
            const oasisContract = getContract(address as string);
            const tokenId = await oasisContract.getCurrentTokenId();
            notification.info({
              message: 'Occupying the block for you...',
              placement: 'bottomRight'
            });
            const mint = await oasisContract.createOasis(
              getIpfsUrl(cid),
              focusedPoint.x,
              focusedPoint.y
            );
            payload.tokenAddress = mint.hash;
            payload.tokenId = tokenId;
            notification.success({
              message: 'The block is occupied...',
              placement: 'bottomRight'
            });
          } catch (e: any) {
            message.error(e.message.replace(/\([^\)]*\)/, ''));
            return ;
          }
        }
        
        notification.info({
          message: 'Congratulations! The block is yours and please add more idea on it.',
          placement: 'bottomRight'
        });
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
        notification.success({
          message: 'Metadata updated...',
          placement: 'bottomRight'
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
  useEffect(() => {
    setIsOwner(false);
    if (canvasContext.focusedMetaData?.tokenId) {
      if (!address) {
        return ;
      }
      const contract = getContract(address);
      const ownerAddress = contract.getOwner(canvasContext.focusedMetaData?.tokenId);
      setIsOwner(ownerAddress === address);
      return ;
    }
    setIsOwner(true);
  }, [address, canvasContext.focusedMetaData]);
  return props.visible ? (
    <div className={styles.inputContainer}>
      <Input.Group size="large" style={{ width: "50vw" }} compact>
        <Input
          size="large"
          style={{ width: "80%" }}
          placeholder={isOwner ? "Type something to generate your masterpiece" : "You are not the owner of this block"}
          disabled={loading || !isOwner}
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
