# Project notes for Claude

## Working with Codex (GPT-6 Astra)

The `codex` MCP server (`scripts/codex-mcp/server.mjs`, registered in `.mcp.json`) runs the
Codex app's `codex exec` on this machine. Claude does design and code; Codex is a helper.

- **Images**: use the `codex_image` tool whenever the site needs a new picture (backgrounds,
  hero art, icons, illustrations). Save into `public/images/<topic>/`, next to similar files.
  Write a detailed prompt: subject, style, mood, colors, composition, aspect ratio. Look at the
  result before using it; regenerate if it doesn't fit. Output is always PNG.
- **Second opinion / delegation**: use the `codex` tool to ask Codex questions or give it a
  task. It is read-only unless `sandbox: "workspace-write"` is passed; only allow writes for
  work the user asked for. Pass `session_id` from the previous reply to continue a conversation.
- Codex reads `AGENTS.md` in this repo, so it follows the project rules written there.
