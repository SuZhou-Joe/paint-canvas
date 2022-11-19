
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: 'https://apn1-correct-finch-34254.upstash.io',
  token: 'AYXOASQgNDUxMjM0MDItOTIzNS00MGU0LThiOGYtMDQ0YjQ5ZDJlY2U1ZmY0NTFiZjIyZmJmNDkyN2IxMTZhNmVmYmU0YjY4ZGQ=',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { key } = req.query as { key: string };
  return res.json({
    ok: true,
    response: await redis.get(key)
  });
}
