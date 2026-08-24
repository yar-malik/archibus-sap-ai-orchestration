/**
 * Turn a reported fault into the work order a CAFM system accepts.
 *
 * No dependencies and no build step — Node 18 or newer.
 *
 *   export VOHO_API_KEY=voho_sk_live_...   # app.voho.ai -> API Tokens
 *   npm start
 *
 * New accounts start with $25 of credit, so this costs nothing to try.
 */
const KEY = process.env.VOHO_API_KEY
const BASE = process.env.VOHO_BASE_URL ?? 'https://app.voho.ai'

if (!KEY) {
  console.error('Set VOHO_API_KEY first — create one at https://app.voho.ai/tokens')
  process.exit(1)
}

async function voho(path, body, raw = false) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    console.error(`${detail.error?.code ?? res.status}: ${detail.error?.message ?? 'request failed'}`)
    process.exit(1)
  }
  return raw ? Buffer.from(await res.arrayBuffer()) : res.json()
}

function spent(cents) {
  console.log(`\nCharged $${(cents / 100).toFixed(2)} from your Voho balance.`)
}

const report = process.argv.slice(2).join(' ')
  || 'في ريحة حريق في الدور الرابع من جهة المكيف، والمكان صار حار مرة. عندنا اجتماع بعد ساعة في نفس الدور.'

console.log(`Reported: ${report}\n`)
const out = await voho('/v1/facilities/work-order', { text: report })

console.log(`${out.priority.toUpperCase()} · SLA ${out.sla_hours}h${out.escalate ? ' · page the on-call' : ''}`)
console.log(out.summary)
console.log(`asset: ${out.asset}\nlocation: ${out.location}\ntrade: ${out.trade}`)
if (out.missing.length) console.log(`still needed: ${out.missing.join(', ')}`)
spent(out.cost_cents)
