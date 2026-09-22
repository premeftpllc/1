#!/usr/bin/env python3
"""PremeOS local checks; standard library only, no external service mutations."""
import argparse
import json
from pathlib import Path
import sys
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:1235"
MODEL = "google/gemma-4-e2b"
EMBED = "text-embedding-nomic-embed-text-v1.5"
ROOT = Path(__file__).resolve().parents[1]


def request(path, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(BASE + path, data=data,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120 if data else 10) as response:
        return json.load(response)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["health", "chat", "embed", "validate"])
    action = parser.parse_args().action
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
