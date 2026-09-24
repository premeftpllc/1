# PremeOS workspace

Open **PremeOS.code-workspace** in VS Code. This repository holds operational evidence, remediation plans, and automation blueprints. It has no application build or development server.

## Daily workflow

1. Run **Terminal → Run Task → PremeOS: Check local AI**.
2. Open Continue; the profile is **Main Config** and the chat model is **Gemma 4 (LM Studio)**. If the configuration has not refreshed, run **Developer: Reload Window**.
3. Attach the relevant file or selection to your question. Start a new chat for a new task; the local context budget is 131,072 tokens.
4. Review proposed changes in Source Control and run **PremeOS: Validate JSON** after blueprint edits.

## Start here

- [Workspace setup and audit](docs/WORKSPACE.md)
- [Continue MCP setup](docs/CONTINUE-MCP-ARCHITECTURE.md)
- [Execution checkpoint](EXECUTION_STATUS_CHECKPOINT.md)
- [Blocker resolution ledger](BLOCKER_RESOLUTION_LEDGER.md)
- [Phase 4 reconciliation](PHASE_4_FINAL_RECONCILIATION_MATRIX.md)
- [Phase 5 recovery plan](PHASE-5-RECOVERY-PLAN.md)
- [Automation blueprint](final-complete-blueprint.json)

These reports describe past investigations. Their filenames and completion claims do not establish current live service health.

## Local AI

Continue → `http://127.0.0.1:1235/v1/` → LM Studio → `google/gemma-4-e2b`.
The active configuration is `~/.continue/config.yaml`; a reproducible copy is in `config/continue.local.yaml`.
Chat, editing, and apply use Gemma. Nomic provides optional embeddings. Background autocomplete and startup indexing are disabled for this document-focused 8 GB machine.

MCP servers are defined as secret-free blocks in `config/continue/mcpServers/` and activated per machine once their secrets are in `~/.continue/.env`. See [Continue MCP setup](docs/CONTINUE-MCP-ARCHITECTURE.md).

Other installed AI extensions have separate connections and are not redirected by this configuration.
