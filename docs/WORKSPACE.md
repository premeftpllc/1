> **⚠ SUPERSEDED (2026-09-26) - NOT A SOURCE OF TRUTH.** Describes a machine layout that no longer exists. To set up the PC, MacBook Neo or Mac mini, follow [docs/NEW-MACHINE-SETUP.md](NEW-MACHINE-SETUP.md); for current state see `../START_HERE.md`.

# Workspace audit — 2026-09-22

## Observed setup

- Apple Silicon Mac, 8 GB unified memory.
- Continue 2.0.0; LM Studio server bound to loopback on port 1235.
- Gemma `google/gemma-4-e2b`, Q4_K_M, 4.41 GB; initially loaded with 131,072 context and parallelism 4.
- Nomic embedding model installed (84 MB); API reports a 2,048-token maximum context.
- The downloaded `qwen3.5-9b-deepseek-v4-flash` is reported as CLIP architecture (922 MB). It was not validated as a standalone language model and is excluded from the configuration.
- Nine VS Code extensions installed: Continue, Claude Code, OpenAI, Git History, GitHub Actions, GitHub Pull Requests, Remote Repositories, Azure Repos, GitHub Repositories.
- No user settings.json, project settings, project tasks, or named workspace existed.
- Existing Continue MCP section contained only commented examples; no live external connections were configured.
- No application package manifest or test/build pipeline exists in this repository.

## Changes

Named workspace, readable document settings, explicit local model roles, 131,072-token client context, low temperature, background completion/indexing disabled, project AI rules, secret exclusions, and repeatable checks. Original reports remain in place. Continue configuration is shared across VS Code projects; workspace editor preferences are scoped to PremeOS.

Original Continue configuration backup: `/Users/premeftpllc/.continue/backups/20260922-022727/config.yaml`.
Restore it by copying it over `~/.continue/config.yaml`, then reload VS Code. New project files are visible in Source Control and can be removed independently. No commits or remote pushes were made.

## Operating notes

Run the Start LM Studio server task if the server is stopped. The Load local model task requests the original 131,072-token context and four concurrent generations. If Gemma is already loaded with another context, unload that model in LM Studio while idle before running the load task; loading an already-loaded identifier may not update its settings. This is an explicit load profile, not a change to LM Studio's global default for future manual loads.

Chat and embeddings tests send only synthetic text to localhost. JSON validation checks syntax, not Make blueprint semantics or external IDs. Large source files should be reviewed in sections. There is no claim that a small local model can reliably execute complex multi-service operations unattended.

Use Continue for this local model. The separately installed Claude and OpenAI extensions retain their own providers. No additional extension, model, paid service, or MCP package was installed.

## References

- [Continue configuration](https://docs.continue.dev/reference)
- [Continue LM Studio provider](https://docs.continue.dev/customize/model-providers/top-level/lmstudio)
- [LM Studio CLI](https://lmstudio.ai/docs/cli)

## Verification results

- Local API health passed; configured model identifiers found.
- Initial setup reduced context and concurrency without performance evidence. This was rejected by the owner; the load task and client configuration now preserve the original 131,072 context and parallelism 4.
- Synthetic chat test returned PREMEOS_OK.
- Embedding test returned a numeric vector successfully.
- Seven JSON/workspace files parsed successfully. Continue YAML parsed and matched the active copy; model property names were checked against the installed extension schema (not a full schema validation).
- Native UI automation was unavailable, so Continue panel selection and an end-to-end editor interaction were not visually verified. Open the named workspace, select PremeOS Local in Continue, and reload the window if needed.

## Addendum - 2026-09-24

The workspace profile is **Main Config** (the earlier PremeOS Local profile was rolled back on 2026-09-22). MCP servers are now defined as secret-free blocks in `config/continue/mcpServers/` and activated per machine once their secrets are in `~/.continue/.env`. See [Continue MCP Architecture](CONTINUE-MCP-ARCHITECTURE.md) for setup details, credential how-tos, and troubleshooting. The list of removed server templates has been cleaned up.
