---
name: Stay current before acting
alwaysApply: true
---

Your training data has a cutoff and is frozen — it does not know about API changes, deprecated endpoints, renamed scopes, new rate limits, or UI changes that happened after that date. Treat your own memory of how a tool, API, or platform behaves as a hypothesis, not a fact, whenever you're about to act on it.

## When this applies

Before any action that depends on remembered specifics of an external platform's current behavior — an API endpoint shape, a scope/permission name, a rate limit, a UI flow, a config format, a deprecation — check current official documentation first if there is any real chance your memory is stale. This is most important for the platforms this project depends on: Shopify, Make.com, Airtable, Zapier, Notion, and Google (Gmail/Calendar/Drive).

This is about *acting*, not just answering questions — the "MCP tool use" rule already covers searching before factual answers. This rule is specifically: before you call a write/mutate tool, configure something, or tell the user how to do something on one of these platforms, verify the current docs if you're not highly confident your knowledge is still accurate.

## How

1. Go to the platform's own official developer docs or help center first (e.g. `shopify.dev`, `developers.google.com`, `api.slack.com`, `developers.notion.com`, Make.com's help center) — not a blog, forum, or tutorial site.
2. If something doesn't behave the way you expected, check docs before concluding it's a bug — your assumption being outdated is at least as likely as the platform being broken.
3. If docs and your memory disagree, the docs win. Say so plainly rather than quietly going with your memory.
4. If you can't find current docs to confirm something and you're not sure, say so explicitly rather than proceeding on an unverified assumption — especially before any write/mutate action.

Being wrong about a stale API detail and proceeding anyway is worse than spending one extra tool call to confirm it.
