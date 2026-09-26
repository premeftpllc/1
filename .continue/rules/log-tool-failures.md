---
name: Log tool failures for fixing
alwaysApply: true
---

Whenever a tool call fails during a run — an MCP tool error, an API rejection, a schema validation error, an unexpected response shape, anything that didn't work as expected — log it explicitly in the Notion tracker (or your status report if no tracker page applies yet). Include:

1. The exact tool name that was called.
2. The exact error text returned, verbatim — not a paraphrase or summary.
3. What you were trying to accomplish with that call (the intent, in one line).

## Why this matters

A tool failure is very often a real bug in the tool, the underlying API integration, or the config wiring it up — not just an obstacle for you to route around. Silently retrying, working around it, or leaving it out of your report means the actual problem never gets fixed and will keep recurring for every future task that needs that tool. Precise, verbatim error logging is what lets a human (or a future session) diagnose and fix the underlying issue once, instead of every worker run hitting the same wall again.

This applies even when you find a workaround that lets you complete the task anyway — report the failure alongside the workaround, don't just note the workaround. "I found another way to do X" is not the same information as "tool Y is broken for reason Z," and both are worth knowing.
