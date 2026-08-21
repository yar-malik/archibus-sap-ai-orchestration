/**
 * Streaming example — audio starts arriving before the sentence is finished.
 *
 * On a live call, time to first audio is the number that gets measured.
 * Streaming keeps that roughly flat regardless of how long the text is.
 */
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'

const KEY = process.env.VOHO_API_KEY
const BASE = process.env.VOHO_BASE_URL ?? 'https://app.voho.ai'

if (!KEY) {
  console.error('Set VOHO_API_KEY first — see .env.example')
  process.exit(1)
}

const started = Date.now()

const res = await fetch(`${BASE}/v1/speech/stream`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'أهلاً بك في فوهو، معك سارة من خدمة العملاء. كيف أقدر أساعدك؟',
    voice: 'layla',
    // "mulaw" gives 8 kHz telephony audio instead.
    format: 'opus',
  }),
})

if (!res.ok) {
  console.error('Request failed:', res.status, await res.text())
  process.exit(1)
}

let first = null
const out = createWriteStream('stream.ogg')
for await (const chunk of Readable.fromWeb(res.body)) {
  if (first === null) {
    first = Date.now() - started
    console.log('First audio after', first, 'ms')
  }
  out.write(chunk)
}
out.end()
console.log('Wrote stream.ogg')
