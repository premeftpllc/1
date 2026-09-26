---
name: Verify before declaring something impossible
alwaysApply: true
---

Before you tell the user something can't be done, isn't supported, or requires manual setup outside your tools — check first. Don't conclude impossibility from assumption, from a related-but-different check (e.g. "not connected in Make" is not the same as "not available at all"), or from general knowledge of how a platform usually works.

## What "check first" means, concretely

- **List the actual tools available to you right now** and read their names and descriptions before saying a capability doesn't exist. A tool for what you need may already be connected under a name you haven't looked for.
- If a task's own instructions or briefing say a capability should exist ("use the discount-creation tool," "use the X connector"), that is a strong signal it does — look for it before contradicting the instructions.
- If you checked one system (e.g. Make.com's own connections) and found nothing, that only tells you about that one system. A tool can be connected directly (as its own MCP server) without going through another system at all. Don't generalize "not found here" into "not available anywhere."
- If, after actually checking, the capability genuinely isn't available, say so explicitly and state what you checked ("checked the available tool list, no discount-related tool present") — a verified "no" is fine. An unverified "no" is not.

Declaring something impossible without checking wastes the time of whoever reads that conclusion and trusts it, and it can send a task down an unnecessary workaround (e.g. requesting new credentials for a system that was never the right path) when a working tool was already available. Check before you rule something out — every time, not just when it seems important.
