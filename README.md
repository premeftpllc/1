# PremeOS workspace

**Setting up a machine (PC, MacBook Neo, Mac mini)? Follow [docs/NEW-MACHINE-SETUP.md](docs/NEW-MACHINE-SETUP.md).** The PC is the reference setup; every machine tracks `main`.

Open **PremeOS.code-workspace** in VS Code. This repository holds operational evidence, remediation plans, and automation blueprints. It has no application build or development server.

## Daily workflow

1. `git pull`, then run **Terminal → Run Task → PremeOS: Sync MCP secrets** and **PremeOS: Check local AI**.
2. Open Continue; the profile is **PremeOS (Nemotron 3 Nano 4B, local LM Studio)** and the model for Chat, Autocomplete, Edit and Apply is **nvidia/nemotron-3-nano-4b**. If the configuration has not refreshed, run **Developer: Reload Window**.
3. Attach the relevant file or selection to your question. Start a new chat for a new task; the context budget is 32,768 tokens on the Macs and 400,000 on the PC.
4. Review proposed changes in Source Control and run **PremeOS: Validate JSON** after blueprint edits.

## Start here

- [New machine setup](docs/NEW-MACHINE-SETUP.md)
- [Continue MCP setup](docs/CONTINUE-MCP-ARCHITECTURE.md)
- [Execution checkpoint](EXECUTION_STATUS_CHECKPOINT.md)
- [Blocker resolution ledger](BLOCKER_RESOLUTION_LEDGER.md)
- [Phase 4 reconciliation](PHASE_4_FINAL_RECONCILIATION_MATRIX.md)
- [Phase 5 recovery plan](PHASE-5-RECOVERY-PLAN.md)
- [Automation blueprint](final-complete-blueprint.json)

These reports describe past investigations. Their filenames and completion claims do not establish current live service health.

## Local AI

Continue → `http://127.0.0.1:1235/v1` → LM Studio → `nvidia/nemotron-3-nano-4b` for chat, edit and apply, with tool use enabled; `qwen2.5-coder-1.5b-instruct` (fill-in-the-middle code model) for autocomplete. Context is set per machine by `scripts/workspace.py`: 400,000 on the PC, 32,768 with 1 parallel request on the Macs (the largest setting that loads on the 8 GB MacBook). Nomic provides embeddings; Voyage rerank-2 (cloud) reranks @codebase/@docs results.

`~/.continue/config.yaml` is rendered from `config/continue/config.template.yaml` by `workspace.py config --apply`. MCP servers are secret-free blocks in `config/continue/mcpServers/`, activated per machine by `workspace.py secrets` once their secrets are in `~/.continue/.env`. The 8 Continue rules live in `.continue/rules/` and load whenever this repo is the open workspace. The VS Code tasks **Start LM Studio server** and **Load local model** run when the workspace opens; allow automatic tasks once when VS Code asks. See [New machine setup](docs/NEW-MACHINE-SETUP.md) and [Continue MCP setup](docs/CONTINUE-MCP-ARCHITECTURE.md).

Other installed AI extensions have separate connections and are not redirected by this configuration.
