// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import { generateAsync } from 'stability-client'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_URL: string;
      WALLETCONNECT_PROJECT_ID: string;
    }
  }
}

interface ResponseData {
  isOk: boolean;
  status: string;
  code: number;
  message: string;
  trailers: any;
};

interface ImageResponseData {
  res: ResponseData;
  images: {
    buffer: Buffer;
    filePath: string;
    seed: number;
    mimeType: string;
    classifications: {
        realizedAction: number;
    };
  }[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { prompt } = req.query as { prompt: string };
  const { data, status } = await axios.get('https://ik.imagekit.io/bcfqh1dt2/image_generate.png?ik-sdk-version=javascript-1.4.3&updatedAt=1668505872453', {
    responseType: 'arraybuffer',
  });
  if (data && status >= 200 && status < 302) {
    return res.json({
      ok: true,
      response: {
        mimeType: 'image/png',
        base64: Buffer.from(data).toString('base64')
      }
    });
  }
  // const image = await generateAsync({
  //   prompt,
  //   apiKey: 'sk-orcI02jiYxEiIDMNIkZnofc8k9MUToSQJrFco508uVELTciH',
  //   noStore: true
  // }) as ImageResponseData;

  // if (image.res.isOk) {
  //   const [imageItem] = image.images;
  //   return res.json({
  //     ok: true,
  //     response: {
  //       mimeType: imageItem.mimeType,
  //       base64: Buffer.from(imageItem.buffer).toString('base64')
  //     }
  //   });
  // }

  // return res.json(image);
}
