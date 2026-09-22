# Web Search MCP Server - Implementation Plan for LM Studio/Continue Integration

## Current State Analysis

### Repository Structure
- **TypeScript MCP Server** providing web search capabilities via Model Context Protocol (MCP)
- **3 Tools Available:**
  - `full-web-search` - Comprehensive search with full page content extraction
  - `get-web-search-summaries` - Lightweight search returning only snippets
  - `get-single-web-page-content` - Extract content from specific URL

### Modified Files (Protected Baseline - DO NOT MODIFY)
1. `README.md` - Updated documentation
2. `docs/API.md` - API documentation
3. `mcp.json` - MCP server configuration
4. `package-lock.json` - Dependencies resolution
5. `src/index.ts` - Main server implementation
6. `tsconfig.json` - TypeScript compiler settings

### Untracked Files (Protected Baseline - DO NOT MODIFY)
1. `.dockerignore` - Docker ignore patterns
2. `Dockerfile` - Docker build configuration
3. `scripts/make-mcp-bridge.js` - Make.com MCP bridge
4. `scripts/notion-mcp-launcher.js` - Notion MCP launcher

---

## Proposed Files to Change

### File 1: `.env` (NEW FILE)
**Purpose:** Environment variables for configuration and authentication  
**Location:** Repository root

### File 2: `.gitignore` update
**Additions needed:**
```
# Make.com bridge output (if created)
make-mcp-bridge-output.json
notion-mcp-launcher-output.json
```

---

## Exact Intended Changes

### Change 1: Create `.env` file with configuration
```env
# Server Configuration
MAX_CONTENT_LENGTH=500000
DEFAULT_TIMEOUT=6000
MAX_BROWSERS=3
BROWSER_TYPES=chromium,firefox
BROWSER_HEADLESS=true
BROWSER_FALLBACK_THRESHOLD=3

# Quality Settings
ENABLE_RELEVANCE_CHECKING=true
RELEVANCE_THRESHOLD=0.3

# Multi-engine Search (optional)
FORCE_MULTI_ENGINE_SEARCH=false

# Debug Mode
DEBUG_BROWSER_LIFECYCLE=false
```

### Change 2: Update `.gitignore` to include Make bridge outputs
Add at end of `.gitignore`:
```
make-mcp-bridge-output.json
notion-mcp-launcher-output.json
```

### Change 3: Verify `mcp.json` configuration (already correct)
**Current state:** ✅ Properly configured for LM Studio/Continue via stdio transport

```json
{
  "mcpServers": {
    "web-search": {
      "command": "node",
      "args": ["C:\\Users\\Administrator\\continue-demo\\web-search-mcp\\dist\\index.js"]
    }
  }
}
```

---

## Compatibility Risks

### ✅ LOW RISK - Server-side Integration
- **LM Studio:** Already tested and documented as compatible
- **Continue:** Stdio transport protocol is standard and widely supported
- **Tool Protocol:** MCP uses standardized tool calling interface

### ⚠️ MEDIUM RISK - Browser Automation
- **Network Restrictions:** Some networks block browser automation (Chrome DevTools Protocol)
- **Firewall/Antivirus:** May block Playwright's network activity
- **Solution:** Use headless mode (`BROWSER_HEADLESS=true`) and proxy configuration

### ⚠️ MEDIUM RISK - Model Compatibility
- **Older LLMs:** May struggle with tool use or large responses
- **Recommended Models:** Qwen3, Gemma 3 (best), recent Llama 3.1, Deepseek R1
- **Potential Issues:** Llama and older Deepseek may have parameter type confusion (string vs number)

### ❌ HIGH RISK - Production PremeOS Services
- **DO NOT CONNECT:** The Make.com bridge (`scripts/make-mcp-bridge.js`) connects to production PremeOS services via OAuth
- **Authorization Required:** Requires `MAKE_MCP_AUTHORIZATION` token from Make.com account
- **Risk:** Unauthorized access, security violations, service disruption

### ⚠️ MEDIUM RISK - Rate Limiting
- Google limits: 10 requests per minute for content extraction
- Automatic retry with exponential backoff implemented
- May fail during high-load usage without proper queuing

---

## Commands Requiring Approval

### Phase 1: Setup & Build (REQUIRES EXPLICIT APPROVAL)

#### Command 1: Install Dependencies
```bash
npm ci --ignore-scripts
```
**Purpose:** Install exact dependencies from `package-lock.json`  
**Reason:** Ensures reproducible build environment  
**Risk Level:** LOW - No code changes, read-only operation

#### Command 2: Build TypeScript
```bash
npm run build
```
**Purpose:** Compile TypeScript to JavaScript in `dist/` directory  
**Reason:** MCP server must be built for stdio transport  
**Output:** `dist/index.js`, `dist/index.js.map`, `dist/*.js.map`  
**Risk Level:** LOW - No external network calls

#### Command 3: Install Playwright Browsers
```bash
npx playwright install
```
**Purpose:** Download and install Chromium, Firefox, WebKit browser binaries  
**Reason:** Server uses Playwright for content extraction  
**Size:** ~1-2 GB total download  
**Risk Level:** MEDIUM - Significant disk space required, network download

#### Command 4: Install System Dependencies (Windows)
```bash
npx playwright install-deps chromium
npx playwright install-deps firefox
```
**Purpose:** Install system-level dependencies for browser automation  
**Reason:** Required for Playwright to run browsers  
**Size:** Variable (~500 MB+ depending on OS)  
**Risk Level:** MEDIUM - System-level changes

#### Command 5: Lint Code (Optional Quality Check)
```bash
npm run lint
```
**Purpose:** Run ESLint on TypeScript source files  
**Reason:** Verify code quality, catch potential issues  
**Risk Level:** LOW - Read-only operation, may report warnings only

### Phase 2: Testing & Deployment (REQUIRES EXPLICIT APPROVAL)

#### Command 6: Development Mode Testing (Optional)
```bash
npm run dev
```
**Purpose:** Start server with hot reload for development testing  
**Reason:** Verify functionality before production use  
**Risk Level:** MEDIUM - Running browser automation processes

---

## Anything That Should Remain Local-Only

### ✅ DO NOT SHARE / Keep Local:

1. **Production Credentials (.env file)**
   - If you add API keys or tokens to `.env`
   - Never commit `.env` files (already in `.gitignore`)
   - Keep any Make.com OAuth tokens local-only

2. **Make.com Bridge Scripts**
   - `scripts/make-mcp-bridge.js` connects to production services
   - Requires OAuth authorization from Make.com account
   - **DO NOT USE** unless you have explicit authorization
   - This is the main risk for accessing PremeOS services

3. **System Dependencies Installation**
   - Browser binaries and system deps are large downloads
   - OS-specific (different on Windows vs Linux/macOS)
   - Can be re-downloaded if needed

4. **Custom Configuration Files**
   - Any `.env.local`, `.env.production` files
   - Local-only development overrides

### ✅ SAFE TO SHARE:

1. **Repository Source Code**
   - All `.ts`, `.js`, `.json` source files
   - Documentation files
   - Package configuration files

2. **Build Output (Optional)**
   - `dist/` directory can be committed if desired
   - Reduces build time for collaborators
   - Not required (can rebuild from source)

3. **Docker Configuration**
   - `Dockerfile`, `.dockerignore` are safe to share
   - No credentials or sensitive data

---

## Integration with LM Studio / Continue

### LM Studio Configuration
Add to your MCP servers configuration:
```json
{
  "mcpServers": {
    "web-search": {
      "command": "node",
      "args": ["C:\\path\\to\\web-search-mcp\\dist\\index.js"],
      "env": {
        "MAX_CONTENT_LENGTH": "500000",
        "DEFAULT_TIMEOUT": "6000",
        "MAX_BROWSERS": "3",
        "BROWSER_HEADLESS": "true"
      }
    }
  }
}
```

### Continue Configuration
Add to your `.continue/config.json`:
```json
{
  "mcpServers": {
    "web-search": {
      "command": "node",
      "args": ["C:\\path\\to\\web-search-mcp\\dist\\index.js"]
    }
  }
}
```

---

## Summary

### Minimal Changes Required:
1. **Create `.env`** with server configuration (optional but recommended)
2. **Run `npm ci --ignore-scripts`** → Requires approval
3. **Run `npm run build`** → Requires approval  
4. **Run `npx playwright install`** → Requires approval
5. **Verify `mcp.json`** → Already correct, no changes needed

### Critical Warnings:
- **DO NOT modify** the 6 protected baseline files (modified + untracked)
- **DO NOT use** `scripts/make-mcp-bridge.js` unless you have Make.com OAuth credentials and authorization to access PremeOS services
- **DO NOT run** any command that could connect to production services without explicit approval
- **Use stdio transport** for local MCP clients (LM Studio, Continue)

### Compatibility:
- ✅ LM Studio: Already documented as compatible
- ✅ Continue: Stdio protocol is standard
- ⚠️ Model-specific issues may occur with older Llama/Deepseek versions
- ❌ Production services: Must remain disconnected without authorization
