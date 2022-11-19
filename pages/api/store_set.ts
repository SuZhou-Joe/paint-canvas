// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import redis from '../../redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { key, value } = req.query as { key: string, value: string };
  await redis.set(key, value);
  return res.json({
    ok: true
  });
}
