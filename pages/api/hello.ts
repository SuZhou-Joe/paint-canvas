// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { generateAsync } from 'stability-client'

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
  const image = await generateAsync({
    prompt: 'A Stunning House',
    apiKey: 'sk-twzUaAQyKXXoRzPG2SQC4GuB5SFGs57eYWo3Sb0d6wyF7Y3q',
    noStore: true
  }) as ImageResponseData;

  if (image.res.isOk) {
    const [imageItem] = image.images;
    res
      .setHeader('Content-Type', imageItem.mimeType)
      .send(imageItem.buffer);
    return ;
  }

  res.json(image);
}
