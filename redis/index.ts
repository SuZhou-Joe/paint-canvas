import Redis from "ioredis";

const redis = new Redis('redis://default:5628a300aa6a4f789f5a46211f9588b4@apn1-inspired-lioness-34254.upstash.io:34254');

export default redis;