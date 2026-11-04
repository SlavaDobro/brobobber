#!/usr/bin/env node
// Runs the Astra edit jobs through the Codex MCP server, a few at a time.
// Skips outputs that already exist; delete a file to regenerate it.
// Usage: node scripts/layers/generate.mjs [name-filter] [--concurrency=3]
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { jobs } from './jobs.mjs'

const filter = process.argv.slice(2).find(a => !a.startsWith('--')) || ''
const concurrency = Number((process.argv.find(a => a.startsWith('--concurrency=')) || '=3').split('=')[1])
const queue = jobs().filter(job => job.name.includes(filter) && !existsSync(job.output))
const done = new Set(jobs().filter(job => existsSync(job.output)).map(job => job.name))
const failed = new Set()
console.log(`${queue.length} job(s) to run, concurrency ${concurrency}`)

function run(job) {
  return new Promise(resolve => {
    const args = { prompt: job.prompt, output_path: job.output, reference_images: job.refs, timeout_sec: 900 }
    const child = spawn(process.execPath, ['scripts/codex-mcp/call.mjs', 'codex_image', JSON.stringify(args)], { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    child.stdout.on('data', d => { out += d })
    child.stderr.on('data', d => { out += d })
    child.on('close', code => resolve({ ok: code === 0 && existsSync(job.output), out }))
  })
}

const started = Date.now()
const running = new Set()
await new Promise(finish => {
  const pump = () => {
    if (!queue.length && !running.size) return finish()
    for (let i = 0; i < queue.length && running.size < concurrency; i++) {
      const job = queue[i]
      if (job.after && failed.has(job.after)) { queue.splice(i--, 1); failed.add(job.name); console.log(`skip ${job.name} (needs ${job.after})`); continue }
      if (job.after && !done.has(job.after)) continue
      queue.splice(i--, 1)
      running.add(job.name)
      console.log(`start ${job.name}`)
      run(job).then(({ ok, out }) => {
        running.delete(job.name)
        const seconds = Math.round((Date.now() - started) / 1000)
        if (ok) { done.add(job.name); console.log(`done  ${job.name} (${seconds}s)`) }
        else { failed.add(job.name); console.log(`FAIL  ${job.name}\n${out.trim().split('\n').slice(-6).join('\n')}`) }
        pump()
      })
    }
    if (!running.size && queue.length) { for (const job of queue) console.log(`blocked ${job.name}`); finish() }
  }
  pump()
})
console.log(`finished: ${done.size} present, ${failed.size} failed`)
process.exit(failed.size ? 1 : 0)
