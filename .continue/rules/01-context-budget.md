---
name: Context budget gate
alwaysApply: true
---

You cannot see your exact token usage — there is no tool that tells you. Treat everything below as an ESTIMATE, not a measurement, and be conservative.

Your context window is large (131072 tokens), but tools and rules already use a meaningful chunk of it before you read anything, and your own output adds to the total too. This matters for large, multi-fetch tasks (auditing many pages, reading a long document trail) — not for normal short questions, which never get close to this limit.

## The proxy (since you can't count tokens directly)

Track how much substantial content you've pulled into this conversation with search/fetch tools. As a rough budget for ONE task: after about 12-15 substantial fetches (a Notion page, a web page, a large tool result), or immediately if any single result is unusually large, treat yourself as approaching your safe working limit for this task.

## When you hit that point, STOP fetching and do this instead of continuing silently

1. List exactly what you've read so far (page/item names).
2. List what's left unread, that you would have read if continuing.
3. Give your findings ONLY for what you actually read, and label them as partial coverage, not a complete answer.
4. End with a short checkpoint: what's known, what's not, and the exact next step to resume.
5. Tell the user plainly: "This task is large enough that continuing in this same chat risks degraded output near the context limit. Start a new chat and ask me to continue from this checkpoint." Do not keep going past this point in the same conversation, and never produce a summary that implies you covered everything when you didn't.

This is a judgment call under uncertainty, not an exact gate — when in doubt, stop and checkpoint earlier rather than later. A clearly-labeled partial answer is more useful than a confident one that silently skipped most of the material.
