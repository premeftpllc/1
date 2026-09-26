> **⚠ SUPERSEDED (2026-09-26) - NOT A SOURCE OF TRUTH.** Describes a machine layout that no longer exists. To set up the PC, MacBook Neo or Mac mini, follow [docs/NEW-MACHINE-SETUP.md](docs/NEW-MACHINE-SETUP.md); for current state see `START_HERE.md`.

# MacBook Neo Setup Guide

**Status:** Dual-machine setup ready  
**Created:** 2026-09-22  
**Architecture:** Master-Slave (PC → Mac via git)

---

## 🖥️ Dual Setup Overview

```
PC (Master) - Production
├─ LM Studio: 192.168.1.25:1235
├─ nemotron-3-nano-4b @ 500K context
├─ config.yaml (main config)
└─ .git → pushes to GitHub

Mac Neo - Replica
├─ LM Studio: localhost:1235 (local)
├─ nemotron-3-nano-4b @ 160K context
├─ config.mac.yaml (Mac-specific)
└─ .git → pulls from GitHub
```

**Key insight:** Both machines are identical except:
- **Context window:** PC (500K) vs Mac (160K)
- **LM Studio endpoint:** PC (network) vs Mac (local)
- **File paths:** PC (C:/Users/...) vs Mac (~/.continue/...)

---

## 📋 Mac Setup Checklist

### Phase 1: Initial Setup (One Time)

**1. Clone Repository on Mac**
```bash
cd ~
git clone https://github.com/premeftpllc/1.git .continue
cd ~/.continue
```

**2. Load nemotron-3-nano-4b in Mac's LM Studio**
- Open LM Studio on Mac
- Load model: `nvidia/nemotron-3-nano-4b`
- Enable API server: Developer > Start Server > Port 1235
- Verify: `curl http://localhost:1235/v1/models`

**3. Point Continue to Mac Config**
Open VS Code settings on Mac:
```json
{
  "continue.configPath": "~/.continue/config.mac.yaml"
}
```

Or via CLI:
```bash
# In VS Code on Mac
code ~/.continue/config.mac.yaml  # Open it to verify
```

**4. Create Mac's .env.local**
```bash
cp ~/.continue/.env.local ~/.continue/.env.local.bak
# Edit with YOUR Mac-specific credentials
nano ~/.continue/.env.local
```

**5. Restart Continue on Mac**
- Cmd+Shift+P > Reload Window
- Verify nemotron appears in model fields

---

### Phase 2: Keep in Sync (Ongoing)

**When you add new models on PC:**

1. **PC:** Edit `config.yaml` and `config.mac.yaml` together
   ```bash
   # Both files get the new model
   # PC config: contextLength: 500000
   # Mac config: contextLength: 160000
   ```

2. **PC:** Commit both
   ```bash
   git add config.yaml config.mac.yaml
   git commit -m "Add nvidia-rtx-70b model (PC 500K, Mac 160K context)"
   git push origin main
   ```

3. **Mac:** Pull changes
   ```bash
   cd ~/.continue
   git pull origin main
   # Automatically gets new model definition
   ```

4. **Mac:** Restart Continue
   - Cmd+Shift+P > Reload Window
   - New model available

---

## 📊 Key Differences: config.yaml vs config.mac.yaml

| Aspect | PC (config.yaml) | Mac (config.mac.yaml) |
|--------|------------------|----------------------|
| **LM Studio** | 192.168.1.25:1235 | localhost:1235 |
| **Context Window** | 500,000 tokens | 160,000 tokens |
| **Max Output** | 250,000 tokens | 80,000 tokens |
| **MCP Paths** | C:/Users/Administrator/... | ~/.continue/... |
| **When to use** | PC running Continue | Mac running Continue |

**Everything else is identical:**
- Same models
- Same MCPs
- Same credentials references
- Same settings

---

## 🔄 Sync Workflow

### Scenario 1: You Add a New Model on PC

**PC Steps:**
```bash
cd ~/.continue

# Edit BOTH files
nano config.yaml      # Add new Nvidia model
nano config.mac.yaml  # Add same model, same config, just different context

# Commit
git add config.yaml config.mac.yaml
git commit -m "Add nvidia-rtx-70b model"
git push origin main
```

**Mac Steps:**
```bash
cd ~/.continue
git pull origin main
# New model automatically in config.mac.yaml
# Restart Continue to use it
```

### Scenario 2: You Change a MCP Setting on PC

**PC Steps:**
```bash
# Edit make-custom-mcp timeout on BOTH files
nano config.yaml
nano config.mac.yaml
# Change same setting in both

git add config.yaml config.mac.yaml
git commit -m "Increase make-mcp timeout to 60s"
git push origin main
```

**Mac Steps:**
```bash
git pull origin main
# Mac automatically gets the timeout change
```

### Scenario 3: You Add a Credential on PC

**PC Steps:**
```bash
# Edit ONLY PC's .env.local (NOT committed)
nano .env.local
# Add: NEW_SERVICE_TOKEN=abc123
```

**Mac Steps:**
```bash
# Mac has its own .env.local (not synced)
nano ~/.continue/.env.local
# Add same credential (if needed): NEW_SERVICE_TOKEN=xyz789
# Can be different value than PC!
```

---

## ⚙️ Tuning Mac Context Window

Current: **160K tokens**

### If Mac has more VRAM:
```yaml
# config.mac.yaml line 25
contextLength: 200000  # Increase up to 200K if Mac supports it
maxTokens: 100000
```

### If Mac is struggling:
```yaml
# config.mac.yaml line 25
contextLength: 64000   # Reduce to 64K if needed
maxTokens: 32000
```

Then restart Continue to apply changes.

---

## 🧪 Test Setup on Mac

After initial setup, verify everything works:

```bash
# Terminal on Mac
cd ~/.continue
git status  # Should be clean
git log -3  # Should see PC's commits

# In VS Code on Mac (Continue chat)
"What's the current date and time?"  # Tests clock MCP
"Search for Claude AI docs"           # Tests web-search
"Can you search my Notion?"           # Tests Notion (if token added)
```

If all respond, you're good. 🎉

---

## 🚀 Update Model on Both Machines

**Example: Adding nvidia-rtx-70b in the future**

**PC - Create both configs:**
```yaml
# config.yaml (add to existing models section)
  - name: nvidia-rtx-70b
    provider: lmstudio
    model: nvidia/llama-3.1-70b-instruct
    apiBase: http://192.168.1.25:1235/v1
    capabilities:
      - tool_use
    defaultCompletionOptions:
      contextLength: 1000000  # Full 1M for PC
      maxTokens: 500000
    requestOptions:
      timeout: 300000

# Also add to config.mac.yaml (same, but different context)
  - name: nvidia-rtx-70b
    provider: lmstudio
    model: nvidia/llama-3.1-70b-instruct
    apiBase: http://localhost:1235/v1
    capabilities:
      - tool_use
    defaultCompletionOptions:
      contextLength: 200000   # Lower for Mac
      maxTokens: 100000
    requestOptions:
      timeout: 300000
```

**Then assign roles:**
```yaml
# In modelRoles section of BOTH files:
modelRoles:
  chat: nemotron-3-nano-4b
  autocomplete: nemotron-3-nano-4b    # Keep fast models fast
  refactor: nvidia-rtx-70b            # Use strong model for reasoning
  explain: nvidia-rtx-70b
  docs: nvidia-rtx-70b
```

**Commit:**
```bash
git add config.yaml config.mac.yaml
git commit -m "Add nvidia-rtx-70b for reasoning tasks (PC 1M, Mac 200K context)"
git push
```

**Mac pulls:**
```bash
cd ~/.continue && git pull
# Done - Mac has new model automatically
```

---

## 📞 Troubleshooting

### "Models not showing in Continue settings on Mac"
```bash
# 1. Verify config path
cat ~/.continue/.continue/settings.json | grep configPath

# 2. Verify config.mac.yaml exists
ls -la ~/.continue/config.mac.yaml

# 3. Check syntax
cat ~/.continue/config.mac.yaml | head -20

# 4. Restart VS Code fully
# Cmd+Shift+P > Reload Window
```

### "MCP servers failing on Mac"
```bash
# 1. Check MCP paths are using ~ or full /Users/username
grep -n "Users/Administrator" ~/.continue/config.mac.yaml
# Should show: 0 results (Mac uses ~ instead)

# 2. Verify .env.local exists
ls -la ~/.continue/.env.local

# 3. Check credentials
grep NOTION_TOKEN ~/.continue/.env.local
# Should show your actual token, not placeholder
```

### "LM Studio not responding"
```bash
# Verify local LM Studio is running
curl http://localhost:1235/v1/models
# Should return JSON with loaded models

# If not, open LM Studio on Mac:
# Developer > Start Server > Port 1235
```

### "Context window changed but not applying"
```bash
# Make sure you edited config.mac.yaml (not config.yaml)
grep contextLength ~/.continue/config.mac.yaml

# Restart VS Code fully
# Cmd+Shift+P > Reload Window
```

---

## 📈 Performance Notes

**PC (500K context):**
- Slower but more context for complex tasks
- Better for reasoning, docs, analysis
- Use for deep work

**Mac (160K context):**
- Faster, lighter footprint
- Still plenty for most tasks
- Portable, works on battery
- Use for dev work, quick fixes

Both use same nemotron model, so results are consistent.

---

## 🔐 Credentials on Mac

Mac has its own `.env.local` that **is NOT synced** from PC.

You can:
- Use same tokens as PC (if safe)
- Use different tokens per machine (recommended)
- Have different scope permissions per machine

Example:
```
PC .env.local:
  NOTION_TOKEN=secret_pc_123

Mac .env.local:
  NOTION_TOKEN=secret_mac_456
```

Both work independently.

---

## ✅ Checklist: Mac Ready to Go

- [ ] Clone repo to ~/.continue on Mac
- [ ] Load nemotron-3-nano-4b in Mac's LM Studio
- [ ] Enable API server on port 1235
- [ ] Point Continue to config.mac.yaml
- [ ] Create .env.local with Mac credentials
- [ ] Restart Continue on Mac
- [ ] Verify models appear in settings
- [ ] Test one MCP (clock or web-search)
- [ ] Ready to sync with PC via git

---

*Last Updated: 2026-09-22*  
*Master: PC at 192.168.1.25:1235*  
*Replica: Mac at localhost:1235*  
*Sync: Git via GitHub (github.com/premeftpllc/1)*
