#!/usr/bin/env python3
"""PremeOS local checks; standard library only, no external service mutations."""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:1235"
MODEL = "google/gemma-4-e2b"
EMBED = "text-embedding-nomic-embed-text-v1.5"
ROOT = Path(__file__).resolve().parents[1]
CONTINUE_HOME = Path.home() / ".continue"
MCP_BLOCKS = ROOT / "config" / "continue" / "mcpServers"
MCP_ACTIVE = CONTINUE_HOME / "mcpServers"
AGE_KEY = Path(os.environ.get("SOPS_AGE_KEY_FILE", Path.home() / ".config" / "sops" / "age" / "keys.txt"))
SECRET = re.compile(r"\$\{\{\s*secrets\.([A-Za-z0-9_]+)\s*\}\}")
PLAIN = re.compile(r"(?<!\$)\$\{(?!\{)[A-Za-z_][A-Za-z0-9_]*\}")


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
    for line in path.read_text().splitlines():
        line = line.strip()
        if line.startswith("export "):
            line = line[7:].strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() and value.strip().strip("\"'"):
            names.add(key.strip())
    return names


def sync_secrets():
    """Decrypt secrets/premeos.env from origin/main (SOPS + age) into ~/.continue/.env."""
    if not AGE_KEY.exists():
        raise ValueError(f"age key missing at {AGE_KEY}; see docs/CONTINUE-MCP-ARCHITECTURE.md.")
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
        raise ValueError(f"{error.filename} not installed (macOS: brew install sops age).")
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
    slack = re.search(rb"^SLACK_MCP_XOXB_TOKEN=[\"']?(\S*)", plain, re.M)
    if slack and not slack.group(1).startswith(b"xoxb-"):
        print("WARN: SLACK_MCP_XOXB_TOKEN is not an xoxb- bot token; the Slack server will fail.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["health", "chat", "embed", "validate", "mcp", "secrets"])
    parser.add_argument("--apply", action="store_true", help="Apply ready MCP block files")
    args = parser.parse_args()
    action = args.action
    if action == "secrets":
        sync_secrets()
        action, args.apply = "mcp", True
    if action == "validate":
        files = sorted(ROOT.glob("*.json")) + sorted((ROOT / ".vscode").glob("*.json"))
        files += sorted(ROOT.glob("*.code-workspace"))
        failures = []
        for path in files:
            try:
                json.loads(path.read_text())
            except (ValueError, OSError) as error:
                failures.append(f"{path.name}: {error}")
        if failures:
            raise ValueError("\n".join(failures))
        print(f"PASS: {len(files)} JSON/workspace files parse successfully.")
    elif action == "health":
        models = request("/v1/models")["data"]
        ids = {item["id"] for item in models}
        missing = {MODEL, EMBED} - ids
        if missing:
            raise ValueError("Missing configured models: " + ", ".join(sorted(missing)))
        print(f"PASS: {BASE} reachable; both configured models available.")
        for item in request("/api/v0/models")["data"]:
            if item["id"] == MODEL:
                context = item.get("loaded_context_length")
                print(f"Gemma: {item.get('state')}; loaded context: {context}")
                if context and context != 131072:
                    print("NOTE: expected 131072 context; unload Gemma while idle, then run the load task.")
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
            text = block.read_text()
            target = MCP_ACTIVE / block.name
            current = target.read_text() if target.exists() else None
            missing = [s for s in sorted(set(SECRET.findall(text))) if s not in names]
            if missing:
                state = "MISSING " + ", ".join(missing)
                if args.apply and current is not None and block.name.startswith("premeos-"):
                    target.unlink()
                    state = "REMOVED (missing " + ", ".join(missing) + ")"
            elif args.apply or current == text:
                if current != text:
                    MCP_ACTIVE.mkdir(parents=True, exist_ok=True)
                    target.write_text(text)
                state = "ACTIVE"
                active_count += 1
            else:
                state = "READY" if current is None else "READY (active copy is stale; run --apply)"
            print(f"{block.name}: {state}")
        managed = {block.name for block in blocks}
        active_files = sorted(MCP_ACTIVE.glob("*.y*ml")) if MCP_ACTIVE.exists() else []
        for path in active_files:
            if path.name not in managed:
                print(f"WARN: unmanaged block in ~/.continue/mcpServers: {path.name}")
        config = CONTINUE_HOME / "config.yaml"
        for path in [config] + active_files:
            if path.exists() and PLAIN.search(path.read_text()):
                print(f"WARN: {path.name} uses literal ${{VAR}}; Continue only expands secrets templates.")
        copy = ROOT / "config" / "continue.local.yaml"
        if config.exists() and copy.exists() and config.read_text() != copy.read_text():
            print("WARN: ~/.continue/config.yaml differs from config/continue.local.yaml")
        env_file = CONTINUE_HOME / ".env"
        if env_file.exists() and env_file.stat().st_mode & 0o077:
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
    except (OSError, ValueError, KeyError, IndexError, urllib.error.URLError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
