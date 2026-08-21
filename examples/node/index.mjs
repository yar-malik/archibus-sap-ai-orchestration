/**
 * Archibus and SAP AI Orchestration — minimal Node example.
 *
 * Speaks Najdi Saudi Arabic through the Voho speech API and writes an MP3.
 * Nothing here is specific to a framework; it is one HTTP request.
 */
import { writeFileSync } from 'node:fs'

const KEY = process.env.VOHO_API_KEY
const BASE = process.env.VOHO_BASE_URL ?? 'https://app.voho.ai'

if (!KEY) {
  console.error('Set VOHO_API_KEY first — see .env.example')
  process.exit(1)
}

// Layla is a Najdi voice. Swap for faisal, nouf or omar, all Najdi too.
const body = {
  text: 'أهلاً بك في فوهو، كيف أقدر أساعدك اليوم؟',
  voice: 'layla',
  model: 'sada-1',
  // Use "mulaw" instead for telephony — 8 kHz, no transcoding needed.
  format: 'mp3',
}

const res = await fetch(`${BASE}/v1/speech`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})

if (!res.ok) {
  console.error('Request failed:', res.status, await res.text())
  process.exit(1)
}

writeFileSync('output.mp3', Buffer.from(await res.arrayBuffer()))
console.log('Wrote output.mp3')
console.log('Characters billed:', res.headers.get('x-voho-characters'))
