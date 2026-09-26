#!/usr/bin/env python3
"""PremeOS workspace helper: machine setup, Continue config/secret/MCP sync, local AI checks.

Standard library only; no external service mutations. Runs on Windows (the PC) and macOS
(MacBook, Mac mini). See docs/NEW-MACHINE-SETUP.md for the order to run things in."""
import argparse
import datetime
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:1235"
MODEL = "nvidia/nemotron-3-nano-4b"
EMBED = "text-embedding-nomic-embed-text-v1.5"
WINDOWS = os.name == "nt"
ROOT = Path(__file__).resolve().parents[1]
CONTINUE_HOME = Path.home() / ".continue"
CONFIG_TEMPLATE = ROOT / "config" / "continue" / "config.template.yaml"
MCP_BLOCKS = ROOT / "config" / "continue" / "mcpServers"
MCP_ACTIVE = CONTINUE_HOME / "mcpServers"
AGE_KEY = Path(os.environ.get("SOPS_AGE_KEY_FILE", Path.home() / ".config" / "sops" / "age" / "keys.txt"))
LMS = Path.home() / ".lmstudio" / "bin" / ("lms.exe" if WINDOWS else "lms")
SECRET = re.compile(r"\$\{\{\s*secrets\.([A-Za-z0-9_]+)\s*\}\}")
PLAIN = re.compile(r"(?<!\$)\$\{(?!\{)[A-Za-z_][A-Za-z0-9_]*\}")
REPO_PATH = re.compile(r"\{\{PREMEOS_REPO\}\}/([^\"'\s]+)")


def profile():
    """Per-machine model settings.

    PC: LM Studio loads Nemotron with its saved per-model defaults (401,719 context), so Continue
    uses 400,000. Macs: 32,768 with parallel 1, the setting verified on the 8 GB MacBook.
    PREMEOS_CONTEXT overrides both (e.g. a Mac mini with more memory)."""
    if WINDOWS:
        load, context, max_tokens = None, 400000, 16384
    else:
        load, context, max_tokens = 32768, 32768, 8192
    override = os.environ.get("PREMEOS_CONTEXT")
    if override:
        load = context = int(override)
    return {"load": load, "context": context, "max_tokens": max_tokens}


def request(path, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(BASE + path, data=data,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120 if data else 10) as response:
        return json.load(response)


def env_names():
    """Names (never values) of non-empty assignments in ~/.continue/.env."""
    path = CONTINUE_HOME / ".env"
    names = set()
    if not path.exists():
        return names
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line.startswith("export "):
            line = line[7:].strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() and value.strip().strip("\"'"):
            names.add(key.strip())
    return names


def rendered_config():
    """config.template.yaml with this machine's context and output limits filled in."""
    settings = profile()
    return (CONFIG_TEMPLATE.read_text(encoding="utf-8")
            .replace("{{CONTEXT}}", str(settings["context"]))
            .replace("{{MAX_TOKENS}}", str(settings["max_tokens"])))


def rendered_block(block):
    """A block's text with {{PREMEOS_REPO}} set to this clone, plus repo files it needs but lacks."""
    text = block.read_text(encoding="utf-8")
    missing = [rel for rel in REPO_PATH.findall(text) if not (ROOT / rel).exists()]
    return text.replace("{{PREMEOS_REPO}}", ROOT.as_posix()), missing


def sync_secrets():
    """Decrypt secrets/premeos.env from origin/main (SOPS + age) into ~/.continue/.env."""
    if not AGE_KEY.exists():
        raise ValueError(f"age key missing at {AGE_KEY}; see docs/NEW-MACHINE-SETUP.md.")
    try:
        subprocess.run(["git", "-C", str(ROOT), "fetch", "-q", "origin", "main"], check=True)
        encrypted = subprocess.run(["git", "-C", str(ROOT), "show", "origin/main:secrets/premeos.env"],
                                   check=True, capture_output=True).stdout
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "premeos.env"
            source.write_bytes(encrypted)
            plain = subprocess.run(["sops", "--decrypt", str(source)], check=True, capture_output=True,
                                   env={**os.environ, "SOPS_AGE_KEY_FILE": str(AGE_KEY)}).stdout
    except FileNotFoundError as error:
        raise ValueError(f"{error.filename} not installed (macOS: brew install sops age; "
                         "Windows: winget install FiloSottile.age SecretsOPerationS.SOPS).")
    except subprocess.CalledProcessError as error:
        detail = (error.stderr or b"").decode(errors="replace")
        if "none were" in detail or "no master key" in detail.lower():
            raise ValueError(f"this machine's age key is not a recipient of secrets/premeos.env yet; "
                             f"add its public key (age-keygen -y {AGE_KEY}) to .sops.yaml on main, "
                             "then run sops updatekeys there.")
        lines = detail.strip().splitlines()
        raise ValueError(f"{error.cmd[0]} failed: {lines[-1] if lines else error.returncode}")
    target = CONTINUE_HOME / ".env"
    staging = CONTINUE_HOME / ".env.sync"
    CONTINUE_HOME.mkdir(exist_ok=True)
    fd = os.open(staging, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "wb") as handle:
        handle.write(plain)
    os.replace(staging, target)
    target.chmod(0o600)
    names = env_names()
    print(f"Wrote ~/.continue/.env from origin/main: {len(names)} variables (values not shown).")
    slack = re.search(rb"^SLACK_MCP_XOXP_TOKEN=[\"']?(\S*)", plain, re.M)
    if slack and not slack.group(1).startswith(b"xoxp-"):
        print("WARN: SLACK_MCP_XOXP_TOKEN is not an xoxp- user token; the Slack server will fail.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["setup", "secrets", "config", "mcp", "server", "load",
                                           "health", "chat", "embed", "validate"])
    parser.add_argument("--apply", action="store_true",
                        help="config: write ~/.continue/config.yaml; mcp: install ready MCP blocks")
    args = parser.parse_args()
    action = args.action
    if action == "secrets":
        sync_secrets()
        action, args.apply = "mcp", True
    if action == "setup":
        npm = shutil.which("npm")
        npx = shutil.which("npx")
        if not npm or not npx:
            raise ValueError("npm/npx not found; install Node.js 20 or newer first.")
        web = ROOT / "web-search-mcp"
        for command, cwd in [([npm, "ci"], ROOT), ([npm, "ci"], web), ([npm, "run", "build"], web),
                             ([npx, "playwright", "install", "chromium"], web)]:
            print(f"$ {Path(command[0]).stem} {' '.join(command[1:])}   (in {cwd.relative_to(ROOT)})", flush=True)
            subprocess.run(command, cwd=cwd, check=True)
        print("PASS: repo dependencies installed and web-search-mcp built.")
    elif action == "config":
        settings = profile()
        text = rendered_config()
        target = CONTINUE_HOME / "config.yaml"
        current = target.read_text(encoding="utf-8") if target.exists() else None
        if current == text:
            print(f"PASS: ~/.continue/config.yaml matches the template (context {settings['context']}).")
        elif not args.apply:
            print("DIFFERS: ~/.continue/config.yaml is not the rendered template; "
                  "run `workspace.py config --apply` to replace it (the old file is backed up).")
        else:
            if current is not None:
                backup = CONTINUE_HOME / "backups" / f"config-{datetime.datetime.now():%Y%m%d-%H%M%S}.yaml"
                backup.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(target, backup)
                print(f"Backed up the previous config to {backup}")
            CONTINUE_HOME.mkdir(exist_ok=True)
            target.write_text(text, encoding="utf-8")
            print(f"Wrote ~/.continue/config.yaml (context {settings['context']}, "
                  f"maxTokens {settings['max_tokens']}). Reload the VS Code window.")
    elif action == "validate":
        files = sorted(ROOT.glob("*.json")) + sorted((ROOT / ".vscode").glob("*.json"))
        files += sorted(ROOT.glob("*.code-workspace"))
        failures = []
        for path in files:
            try:
                json.loads(path.read_text(encoding="utf-8"))
            except (ValueError, OSError) as error:
                failures.append(f"{path.name}: {error}")
        if failures:
            raise ValueError("\n".join(failures))
        print(f"PASS: {len(files)} JSON/workspace files parse successfully.")
    elif action in ("server", "load"):
        if not LMS.exists():
            raise ValueError(f"LM Studio CLI not found at {LMS}; install LM Studio and open it once.")
        if action == "server":
            subprocess.run([str(LMS), "server", "start", "--port", "1235"], check=True)
        elif MODEL in subprocess.run([str(LMS), "ps"], capture_output=True, text=True).stdout:
            print(f"{MODEL} is already loaded.")
        else:
            load = profile()["load"]
            sizing = [] if load is None else ["--context-length", str(load), "--parallel", "1"]
            subprocess.run([str(LMS), "load", MODEL, *sizing, "--identifier", MODEL, "-y"], check=True)
    elif action == "health":
        models = request("/v1/models")["data"]
        ids = {item["id"] for item in models}
        missing = {MODEL, EMBED} - ids
        if missing:
            raise ValueError("Missing configured models: " + ", ".join(sorted(missing)))
        print(f"PASS: {BASE} reachable; both configured models available.")
        wanted = profile()["context"]
        for item in request("/api/v0/models")["data"]:
            if item["id"] == MODEL:
                context = item.get("loaded_context_length")
                print(f"{MODEL}: {item.get('state')}; loaded context: {context}")
                if context and context < wanted:
                    print(f"NOTE: Continue is configured for {wanted} tokens but LM Studio loaded {context}; "
                          "unload the model and run the Load local model task.")
        print("Availability does not prove inference; run chat and embedding tests separately.")
    elif action == "chat":
        result = request("/v1/chat/completions", {
            "model": MODEL, "messages": [{"role": "user", "content": "Reply with exactly: PREMEOS_OK"}],
            "max_tokens": 128, "temperature": 0, "stream": False})
        message = result["choices"][0]["message"]
        content = message.get("content") or ""
        if "PREMEOS_OK" not in content:
            raise ValueError("Chat returned no expected marker; inspect model response/settings.")
        print("PASS: local chat generated PREMEOS_OK.")
    elif action == "mcp":
        names = env_names()
        blocks = sorted(MCP_BLOCKS.glob("*.yaml"))
        active_count = 0
        for block in blocks:
            text, missing_files = rendered_block(block)
            target = MCP_ACTIVE / block.name
            current = target.read_text(encoding="utf-8") if target.exists() else None
            missing = [s for s in sorted(set(SECRET.findall(text))) if s not in names]
            missing += [f"file {rel} (run workspace.py setup)" for rel in missing_files]
            if missing:
                state = "MISSING " + ", ".join(missing)
                if args.apply and current is not None:
                    target.unlink()
                    state = "REMOVED (missing " + ", ".join(missing) + ")"
            elif args.apply or current == text:
                if current != text:
                    MCP_ACTIVE.mkdir(parents=True, exist_ok=True)
                    target.write_text(text, encoding="utf-8")
                state = "ACTIVE"
                active_count += 1
            else:
                state = "READY" if current is None else "READY (active copy is stale; run --apply)"
            print(f"{block.name}: {state}")
        managed = {block.name for block in blocks}
        active_files = sorted(MCP_ACTIVE.glob("*.y*ml")) if MCP_ACTIVE.exists() else []
        for path in active_files:
            if path.name in managed:
                continue
            if args.apply and path.name.startswith("premeos-"):
                path.unlink()
                print(f"{path.name}: REMOVED (no longer in the repo)")
            else:
                print(f"WARN: unmanaged block in ~/.continue/mcpServers: {path.name}")
        config = CONTINUE_HOME / "config.yaml"
        for path in [config] + [p for p in active_files if p.exists()]:
            text = path.read_text(encoding="utf-8") if path.exists() else ""
            if PLAIN.search(text):
                print(f"WARN: {path.name} uses literal ${{VAR}}; Continue only expands secrets templates.")
            if path == config and re.search(r"^mcpServers:", text, re.M):
                print("WARN: ~/.continue/config.yaml defines mcpServers; they now come from the repo blocks.")
        if config.exists() and config.read_text(encoding="utf-8") != rendered_config():
            print("WARN: ~/.continue/config.yaml differs from the template; run `workspace.py config`.")
        env_file = CONTINUE_HOME / ".env"
        if not WINDOWS and env_file.exists() and env_file.stat().st_mode & 0o077:
            print("WARN: ~/.continue/.env should be mode 600 (chmod 600 ~/.continue/.env).")
        print(f"PASS: {len(blocks)} blocks checked; {active_count} active.")
    else:
        result = request("/v1/embeddings", {"model": EMBED, "input": "search_document: PremeOS workspace health check"})
        vector = result["data"][0]["embedding"]
        if not vector or not all(isinstance(x, (int, float)) for x in vector):
            raise ValueError("Invalid embedding response")
        print(f"PASS: local embedding returned {len(vector)} numeric dimensions.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, IndexError, urllib.error.URLError,
            subprocess.CalledProcessError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
