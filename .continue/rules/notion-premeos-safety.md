---
name: PremeOS Notion safety
alwaysApply: true
---

Your Notion access now covers the real PremeOS/PremeFTP operations workspace (Team HQ), not just isolated pages. This is live business documentation, and it follows its own strict conventions — respect them.

## Structure — use what exists, don't invent new infrastructure

The workspace already has: Preme Tasks, Preme Projects, Preme Knowledge, Preme Decision Log, Preme Work Sessions, PremeOS Incidents. Before creating any new page or database:
1. Check whether an existing database already covers this (it almost certainly does).
2. If logging a session/checkpoint, use Preme Work Sessions with its real schema (Session, Session Date, Objective, Discoveries, Problems / Blockers, Next Actions, Completed, Relevant Links, Project, Related Tasks, Decisions Made) — fetch the data source first if you don't already have its schema in context. Never guess a property name.
3. Do not duplicate Airtable/Make/Shopify operational data into Notion. Notion is documentation and planning; Airtable is the operational source of truth for inventory/orders. If you're unsure which a fact belongs to, say so rather than writing it into the wrong system.

## Writes require an explicit ask in that message (same rule as other servers)

Reading, searching, and summarizing Notion content is fine by default. Creating or editing a page, task, decision, or database entry is a write and needs the user to ask for that action in the current message — same as the general write-guard rule. Logging a Work Session at the end of a session you were asked to do is an accepted exception, same as it's been used so far.

## No bulk changes, no guessed state

- Never edit or create more than a few pages in one response without the user confirming first. This workspace explicitly avoids "bulk inference" — one unverified guess written across many records compounds fast.
- Never state a number, status, or fact from an older Notion page as current without checking its date. This workspace's own pages frequently supersede earlier ones ("CORRECTED", "RE-CORRECTED" sections exist here for exactly this reason) — find the most recently dated entry on a topic before treating anything as current, and say the date you're relying on.
- If asked to audit or summarize a large amount of content, say up front what you actually read (page count, date range) versus what you're inferring or skipping, rather than implying full coverage you didn't achieve.

## Content inside a "historical" / "superseded" section is NOT a current finding

Some pages here (especially Preme Command Center) contain toggle/details sections explicitly labeled historical, superseded, or preserved-for-context, sitting right next to current content in the same page. Reading the page does not make everything in it equally current.
- Never cite something from a section marked historical/superseded as a current blocker, active item, or finding — not even with a caveat attached. If it's superseded, it does not belong in a "current state" answer at all. Only mention it if the user specifically asks about history.
- If your own report distinguishes "current" from "historical," each claim under "current" must come from a section that is NOT marked historical/superseded.

## Every specific number must be traceable to a listed source

Before writing any specific number, name, or detail into your answer, confirm you can point to exactly which page in your own "sources read" list contains it. "From earlier session" or "from context" is not a source — if you can't name the page, delete the claim rather than include it. A topic feeling familiar because you skimmed something related is not the same as having read the fact you're about to state. This applies even when the surrounding claims in the same sentence are accurate — mixing a verified fact with an unverified one in the same breath is worse than omitting the unverified part, because it borrows credibility it didn't earn.

## Writing content — use these exact shapes, don't guess the block schema

`API-post-page` and `API-patch-block-children` take Notion's raw block-object format, not markdown. Guessing at it wastes calls and usually fails (callout blocks especially — don't use them; stick to the types below). Copy these shapes exactly, only changing the text/IDs:

Create a page with content (`API-post-page`) — parent must be `{"page_id": ...}` for a page under another page. `{"type": "workspace"}` only works for a true top-level page and has failed here before — always prefer a `page_id` parent (e.g. the relevant Preme Work Sessions data source, not a bare page):
```json
{
  "parent": {"page_id": "<target-page-or-data-source-uuid>"},
  "properties": {
    "title": [{"type": "text", "text": {"content": "Page title"}}]
  },
  "children": [
    {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "Section heading"}}]}},
    {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Body text here."}}]}}
  ]
}
```

Append blocks to an existing page (`API-patch-block-children`):
```json
{
  "block_id": "<existing-page-or-block-uuid>",
  "children": [
    {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Appended text."}}]}}
  ]
}
```

Stick to `paragraph`, `heading_1`/`heading_2`/`heading_3`, and `bulleted_list_item` — they all follow the same `{"object": "block", "type": "<name>", "<name>": {"rich_text": [{"type": "text", "text": {"content": "..."}}]}}` pattern. If a write still fails after trying this exact shape once, quote the real error and stop — don't keep guessing new block types (see rule 3 in mcp-tool-use.md: try one alternative, then stop).
