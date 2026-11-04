#!/usr/bin/env node
// Calls a tool of the Codex MCP server from the command line (same code path Claude uses).
// Usage: node scripts/codex-mcp/call.mjs <tool> '<json arguments>'
//   node scripts/codex-mcp/call.mjs codex_image '{"prompt":"...","output_path":"tmp/x.png","reference_images":["public/images/vrod/right.png"]}'
import { spawn } from 'node:child_process'
import readline from 'node:readline'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const [tool, json] = process.argv.slice(2)
if (!tool || !json) {
  console.error('Usage: node scripts/codex-mcp/call.mjs <tool> <json-arguments>')
  process.exit(2)
}
const server = path.join(path.dirname(fileURLToPath(import.meta.url)), 'server.mjs')
const child = spawn(process.execPath, [server], { stdio: ['pipe', 'pipe', 'inherit'] })
const pending = new Map()
let nextId = 1
readline.createInterface({ input: child.stdout }).on('line', line => {
  const message = JSON.parse(line)
  pending.get(message.id)?.(message)
})
const request = (method, params) => new Promise(resolve => {
  const id = nextId++
  pending.set(id, resolve)
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
})

await request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'cli', version: '1' } })
const result = await request('tools/call', { name: tool, arguments: JSON.parse(json) })
child.kill()
const text = result.result?.content?.[0]?.text ?? JSON.stringify(result.error)
console.log(text)
process.exit(result.result?.isError || result.error ? 1 : 0)
