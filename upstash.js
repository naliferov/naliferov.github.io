

import { Redis } from '@upstash/redis'
import fs from 'node:fs'

function connectToUpstash() {
  const url = 'https://holy-redfish-7937.upstash.io'
  const token = 'Ah8BAAIgcDH8iJl1rQK-FZD7U3lrmcixchbsva9z2HQRDxtGlxLOrA' //read only token

  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in environment variables.')
  }

  return new Redis({
    url,
    token,
  })
}

async function downloadAllSysKeysToFiles() {
  const redis = connectToUpstash()
  const entries = await redis.hgetall('sys')

  for (const [key, value] of Object.entries(entries)) {
    const filePath = `./src/${key}.js`
    fs.writeFileSync(filePath, JSON.stringify(value), 'utf8')
  }
}

downloadAllSysKeysToFiles()
