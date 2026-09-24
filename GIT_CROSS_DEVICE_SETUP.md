# Git Cross-Device Access Setup

## Current Status

**SSH Remote:** `git@github.com:premeftpllc/1.git` ✅ Works  
**Branch:** `claude/worker-1-kz0ycj` (PremeOS workspace)  
**Tracking:** `origin/claude/worker-1-kz0ycj`  
**Commits:** In sync (0 ahead, 0 behind)

Verify with:
```bash
cd /Users/premeftpllc/PremeOS/1
git status -sb
```

---

## SSH Key Setup (Recommended)

SSH is more secure than storing tokens in plain text.

### Step 1: Generate SSH Key (if needed)
```bash
ssh-keygen -t ed25519 -C "premeftpllc@gmail.com"
# Press Enter for all prompts (use defaults)
```

### Step 2: Add Public Key to GitHub
```bash
cat ~/.ssh/id_ed25519.pub
# Copy the output, then:
# Go to https://github.com/settings/keys
# Click "New SSH key"
# Paste and title it "MacBook-Neo"
```

### Step 3: Test Connection
```bash
ssh -T git@github.com
# Should print: "Hi premeftpllc! You've successfully authenticated..."
```

### Step 4: Verify Remote
```bash
cd /Users/premeftpllc/PremeOS/1
git remote -v
# Should show: origin git@github.com:premeftpllc/1.git
```

---

## GitHub CLI Alternative

If you prefer using `gh`:

```bash
brew install gh
gh auth login
# Follow prompts to authenticate with GitHub
cd /Users/premeftpllc/PremeOS/1
git push origin claude/worker-1-kz0ycj
```

---

## Do NOT Use Credential Store

Plain-text credential storage is insecure. Avoid:
```bash
# DO NOT run this:
git config --global credential.helper store
```

Use SSH or `gh` instead.

---

## Daily Workflow

### Push Changes
```bash
cd /Users/premeftpllc/PremeOS/1
git push origin claude/worker-1-kz0ycj
```

### Pull Changes from Another Device
```bash
git pull origin claude/worker-1-kz0ycj
```

### Check Branch Status
```bash
git branch -vv
# Should show: claude/worker-1-kz0ycj ... up to date
```

---

## Handoff with Git Notes

For asynchronous communication between devices (handoff messages, checkpoints, blockers):

### Write a Note
```bash
git notes add -m "Status: Completed Phase 2. Next: Run MCP setup tasks." <commit-hash>
# Or append to existing note:
git notes append -m "Update: MCP credentials filled in." <commit-hash>
```

### Read Notes
```bash
git log --notes -5
# Shows the 5 most recent commits with their notes
```

### Share Notes to Remote
```bash
git push origin refs/notes/commits
```

### Receive Notes from Remote
```bash
git fetch origin refs/notes/commits:refs/notes/commits
```

---

## Branch Protection

**IMPORTANT:** `origin/main` is the PC's `C:\Users\Administrator\.continue` folder with unrelated history and Windows paths.

**Never merge `main` into `claude/worker-1-kz0ycj`.** The two branches have different:
- Machine paths (C:/ on PC vs ~ on Mac)
- Models (Qwen/Nemotron vs Gemma)
- Configuration styles

If you accidentally pull `main`, undo it:
```bash
git reset --hard HEAD~1  # Discard the merge commit
git branch -D main  # Delete local main if unwanted
```

---

## Multi-Device Workflow Example

### Machine A (Mac)
```bash
git commit -m "Fix: Continue MCP architecture"
git notes add -m "Ready for testing on all MCPs" <commit-hash>
git push origin claude/worker-1-kz0ycj
git push origin refs/notes/commits
```

### Machine B (PC or Another Mac)
```bash
git pull origin claude/worker-1-kz0ycj
git fetch origin refs/notes/commits:refs/notes/commits
git log --notes -3
# See the message from Machine A
```

---

## Troubleshooting

### "Permission denied (publickey)"
SSH key not added to GitHub. Run step 2-3 above.

### "Could not read Username"
Credentials helper is looking for stored token. Switch to SSH (Step 4).

### "Upstream branch not found"
Track the correct branch:
```bash
git branch -u origin/claude/worker-1-kz0ycj
```

### "Detached HEAD"
You checked out a commit instead of the branch. Reattach:
```bash
git checkout claude/worker-1-kz0ycj
```

---

## Reference

- [SSH key setup on GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Git notes documentation](https://git-scm.com/docs/git-notes)
- [GitHub CLI](https://cli.github.com)
