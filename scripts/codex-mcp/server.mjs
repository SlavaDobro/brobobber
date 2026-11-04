#!/usr/bin/env node
// MCP server that lets Claude Code hand tasks to OpenAI Codex (codex exec).
// No dependencies: speaks MCP JSON-RPC over stdio, one JSON message per line.
//
// Tools:
//   codex        - send a task or question to Codex, optionally continuing a session
//   codex_image  - have Codex generate an image and save it into the project
//
// Env overrides:
//   CODEX_EXE          path to codex.exe (otherwise PATH, then the Codex desktop app)
//   CODEX_MODEL        model to use (otherwise ~/.codex/config.toml decides)
//   CODEX_PROJECT_DIR  default working directory (otherwise this server's cwd)

import { spawn, execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import readline from "node:readline";

const SERVER_INFO = { name: "codex", version: "1.0.0" };
const PROJECT_DIR = path.resolve(process.env.CODEX_PROJECT_DIR || process.cwd());
const CODEX_HOME = process.env.CODEX_HOME || path.join(homedir(), ".codex");
const DEFAULT_TIMEOUT_SEC = 900;

// ---------- finding codex.exe ----------

let cachedExe = null;
function findCodexExe() {
  if (cachedExe && existsSync(cachedExe)) return cachedExe;
  const candidates = [];
  if (process.env.CODEX_EXE) candidates.push(process.env.CODEX_EXE);
  try {
    const where = execFileSync("where.exe", ["codex.exe"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    candidates.push(...where.split(/\r?\n/).filter(Boolean));
  } catch {}
  try {
    // The Microsoft Store app lives in a versioned folder, so ask Windows where it is now.
    const loc = execFileSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", "(Get-AppxPackage -Name OpenAI.Codex).InstallLocation"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    if (loc) candidates.push(path.join(loc, "app", "resources", "codex.exe"));
  } catch {}
  cachedExe = candidates.find((p) => existsSync(p)) || null;
  if (!cachedExe) throw new Error("codex.exe not found. Install the Codex app or set CODEX_EXE.");
  return cachedExe;
}

// ---------- running codex exec ----------

function runCodex({ prompt, cwd, sessionId, model, sandbox, timeoutSec }) {
  const exe = findCodexExe();
  const args = ["exec"];
  if (sessionId) {
    // resume has no -s/-C flags: sandbox goes through config, cwd through the process.
    args.push("resume", "--json", "--skip-git-repo-check", "-c", `sandbox_mode="${sandbox}"`);
    if (model) args.push("-m", model);
    args.push(sessionId, "-");
  } else {
    args.push("--json", "--skip-git-repo-check", "-s", sandbox, "-C", cwd);
    if (model) args.push("-m", model);
    args.push("-");
  }

  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(exe, args, { cwd, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    const result = {
      threadId: sessionId || null,
      messages: [],
      commands: [],
      fileChanges: [],
      errors: [],
      usage: null,
      exitCode: null,
      timedOut: false,
      startedAt: started,
    };
    let stderr = "";

    const timer = setTimeout(() => {
      result.timedOut = true;
      child.kill();
    }, (timeoutSec || DEFAULT_TIMEOUT_SEC) * 1000);

    readline.createInterface({ input: child.stdout }).on("line", (line) => {
      let ev;
      try { ev = JSON.parse(line); } catch { return; }
      if (ev.type === "thread.started" && ev.thread_id) result.threadId = ev.thread_id;
      else if (ev.type === "turn.completed") result.usage = ev.usage || null;
      else if (ev.type === "turn.failed" || ev.type === "error") {
        result.errors.push(ev.error?.message || ev.message || JSON.stringify(ev));
      } else if (ev.type === "item.completed" && ev.item) {
        const it = ev.item;
        if (it.type === "agent_message" && it.text) result.messages.push(it.text.trim());
        else if (it.type === "command_execution") result.commands.push({ command: it.command, exit: it.exit_code });
        else if (it.type === "file_change") result.fileChanges.push(...(it.changes || []).map((c) => `${c.kind} ${c.path}`));
        else if (it.type === "error" && it.message) result.errors.push(it.message);
      }
    });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    child.on("error", (err) => {
      clearTimeout(timer);
      result.errors.push(`Failed to start codex: ${err.message}`);
      resolve(result);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      result.exitCode = code;
      if (code !== 0 && !result.errors.length) {
        const tail = stderr.split(/\r?\n/).filter((l) => l.trim() && !/Reading additional input/.test(l)).slice(-8).join("\n");
        if (tail) result.errors.push(tail);
      }
      resolve(result);
    });

    child.stdin.end(prompt, "utf8");
  });
}

function newImagesFor(threadId, sinceMs) {
  if (!threadId) return [];
  const dir = path.join(CODEX_HOME, "generated_images", threadId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((name) => path.join(dir, name))
    .filter((p) => /\.(png|jpe?g|webp)$/i.test(p) && statSync(p).mtimeMs >= sinceMs - 2000)
    .sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs);
}

function resolveInProject(p) {
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_DIR, p);
}

function describe(result, extra = []) {
  const lines = [];
  if (result.threadId) lines.push(`session_id: ${result.threadId}`);
  if (result.timedOut) lines.push("TIMED OUT: Codex was stopped before finishing.");
  if (result.errors.length) lines.push("Errors:\n" + result.errors.map((e) => "- " + e).join("\n"));
  lines.push(...extra);
  if (result.fileChanges.length) lines.push("Files changed by Codex:\n" + result.fileChanges.map((f) => "- " + f).join("\n"));
  if (result.commands.length) {
    lines.push(`Commands Codex ran: ${result.commands.length}` +
      (result.commands.some((c) => c.exit && c.exit !== 0) ? " (some failed)" : ""));
  }
  const final = result.messages[result.messages.length - 1];
  lines.push("Codex reply:\n" + (final || "(no reply text)"));
  return lines.join("\n\n");
}

// ---------- tools ----------

const SANDBOXES = ["read-only", "workspace-write"];

const TOOLS = [
  {
    name: "codex",
    description:
      "Send a task or question to OpenAI Codex (GPT-6 Astra by default) and get its final reply. " +
      "Pass session_id from a previous call to continue the same conversation. " +
      "By default Codex can only read files (sandbox read-only); use workspace-write to let it edit files in cwd.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "What Codex should do or answer." },
        session_id: { type: "string", description: "Continue an earlier Codex session (from a previous result)." },
        cwd: { type: "string", description: "Working directory. Defaults to the project root." },
        sandbox: { type: "string", enum: SANDBOXES, description: "read-only (default) or workspace-write." },
        model: { type: "string", description: "Override the model, e.g. gpt-6-astra." },
        timeout_sec: { type: "number", description: `Stop Codex after this many seconds (default ${DEFAULT_TIMEOUT_SEC}).` },
      },
      required: ["prompt"],
    },
  },
  {
    name: "codex_image",
    description:
      "Have Codex generate an image (its built-in image generation) and save it into the project. " +
      "Describe subject, style, composition, colors and aspect ratio in the prompt. " +
      "The file is saved as PNG; with count > 1 the files get -1, -2... suffixes.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Detailed image description." },
        output_path: { type: "string", description: "Where to save, relative to the project root, e.g. frontend/public/img/hero.png." },
        count: { type: "number", description: "How many variants (1-4, default 1)." },
        reference_images: { type: "array", items: { type: "string" }, description: "Optional image files Codex should use as reference or edit." },
        timeout_sec: { type: "number", description: `Stop after this many seconds (default ${DEFAULT_TIMEOUT_SEC}).` },
      },
      required: ["prompt", "output_path"],
    },
  },
];

async function callCodex(args) {
  const sandbox = SANDBOXES.includes(args.sandbox) ? args.sandbox : "read-only";
  const cwd = args.cwd ? resolveInProject(args.cwd) : PROJECT_DIR;
  const result = await runCodex({
    prompt: args.prompt,
    cwd,
    sessionId: args.session_id,
    model: args.model || process.env.CODEX_MODEL,
    sandbox,
    timeoutSec: args.timeout_sec,
  });
  const images = newImagesFor(result.threadId, result.startedAt);
  const extra = images.length ? ["Images Codex generated:\n" + images.map((p) => "- " + p).join("\n")] : [];
  return { text: describe(result, extra), isError: !!result.errors.length && !result.messages.length };
}

async function callCodexImage(args) {
  const count = Math.min(Math.max(Math.round(args.count || 1), 1), 4);
  let target = resolveInProject(args.output_path);
  if (path.extname(target).toLowerCase() !== ".png") target = target.slice(0, target.length - path.extname(target).length) + ".png";

  const refs = (args.reference_images || []).map(resolveInProject);
  const missing = refs.filter((p) => !existsSync(p));
  if (missing.length) return { text: "Reference images not found:\n" + missing.join("\n"), isError: true };

  const prompt = [
    `Use your image generation tool to create ${count === 1 ? "one image" : `${count} separate image variants`}.`,
    refs.length ? `Use these files as reference: ${refs.join(", ")}` : "",
    "Do not write code, do not edit project files, do not save files yourself: just generate the image(s).",
    "When done, reply with one short sentence describing the result.",
    "",
    "Image request:",
    args.prompt,
  ].filter(Boolean).join("\n");

  const result = await runCodex({
    prompt,
    cwd: PROJECT_DIR,
    model: process.env.CODEX_MODEL,
    sandbox: "read-only",
    timeoutSec: args.timeout_sec,
  });

  const images = newImagesFor(result.threadId, result.startedAt).slice(-count);
  if (!images.length) {
    return { text: describe(result, ["No image was produced."]), isError: true };
  }

  mkdirSync(path.dirname(target), { recursive: true });
  const saved = images.map((src, i) => {
    const dest = images.length === 1 ? target : target.replace(/\.png$/i, `-${i + 1}.png`);
    copyFileSync(src, dest);
    return dest;
  });
  return { text: describe(result, ["Saved:\n" + saved.map((p) => "- " + p).join("\n")]), isError: false };
}

// ---------- MCP plumbing ----------

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

async function handle(msg) {
  const { id, method, params } = msg;
  const isRequest = id !== undefined && id !== null;

  try {
    if (method === "initialize") {
      return send({
        jsonrpc: "2.0", id,
        result: {
          protocolVersion: params?.protocolVersion || "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        },
      });
    }
    if (method === "ping") return send({ jsonrpc: "2.0", id, result: {} });
    if (method === "tools/list") return send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    if (method === "tools/call") {
      const name = params?.name;
      const args = params?.arguments || {};
      let out;
      if (name === "codex") out = await callCodex(args);
      else if (name === "codex_image") out = await callCodexImage(args);
      else return send({ jsonrpc: "2.0", id, error: { code: -32602, message: `Unknown tool: ${name}` } });
      return send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: out.text }], isError: out.isError } });
    }
    if (isRequest) send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (err) {
    if (!isRequest) return;
    if (method === "tools/call") {
      send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true } });
    } else {
      send({ jsonrpc: "2.0", id, error: { code: -32603, message: err.message } });
    }
  }
}

readline.createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  handle(msg);
});
