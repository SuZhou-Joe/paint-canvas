import axios from "axios";
import { blockMetaData, Point } from "../interface";

export const CANVAS_CID_KEY = 'canvas_cid';

export const getIdFromPoint = (point: Point): string => {
  return `${point.x}-${point.y}`;
};

export const getPointFromId = (id: string): Point => {
  const [x, y] = id.split("-");
  return {
    x: Number(x),
    y: Number(y),
  };
};

export function dataURLToFile(dataURL: string): File {
  const arr = dataURL.split(",");
  const mime = (arr[0].match(/:(.*?);/) as string[])[1]; //mime类型 image/png
  const bstr = atob(arr[1]);

  let n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], "file", { type: mime });
}

export function getIpfsUrl(cid: string) {
  return `https://nftstorage.link/ipfs/${cid}`;
}

export function getContentOfCid(cid: string) {
  return fetch(getIpfsUrl(cid)).then(res => res.json());
}

export async function getLatestCanvas() {
  const cidResult = await axios.request<{ response: string }>({
    url: `/api/store_get?key=${CANVAS_CID_KEY}`,
  });
  if (cidResult.data.response) {
    return getContentOfCid(cidResult.data.response);
  }

  return {};
}

export function formatCanvas(canvas: Record<string, blockMetaData>): Record<string, blockMetaData> {
  return Object.entries(canvas).reduce((total, current) => {
    return {
      ...total,
      [current[0]]: {
        ...current[1],
        image: getIpfsUrl(current[1].image as string)
      }
    };
  }, {} as Record<string, blockMetaData>);
}