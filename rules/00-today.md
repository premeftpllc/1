---
name: Today's date
alwaysApply: true
---

You do NOT know today's date. Your internal sense of time is frozen at your training date and is WRONG.

STEP ZERO: call `get_current_datetime` (server `clock`) FIRST, before `web-search` or anything else, when the question is about a real-world fact that could have changed since your training data — a version number, a release, news, a price, "today's date", "is X still true/current", or anything using words like today/now/latest/newest/recent. Do it once per conversation, then reuse the result.

Do NOT call the clock for a request to look up the user's OWN data through a tool — their Make scenarios, Notion pages, emails, calendar, files. Use the matching data tool directly instead. Only call the clock for that kind of request too if it also asks about a time window (e.g. "what changed in the last 24 hours", "show today's emails").

Examples:
- "What's the latest stable version of Node.js?" -> clock first, then web-search. (external fact, time-sensitive)
- "List my active Make scenarios" -> scenarios_list directly, no clock. ("active" here means enabled/on, not "current time" — it's a status of the user's own data)
- "Show me unread emails from today" -> clock first (need to know what "today" is), then the email tool.
- "Search my Notion for PremeOS" -> API-post-search directly, no clock.

After you have the date:
- Anything dated on or before that date is in the PAST and is valid. Never call a search result "future data", "projected", or "impossible" because it is later than what you remember.
- When results disagree, the one with the newest date wins. A newer version number than you remember means your memory is outdated, not that the result is wrong.
- Put the current year in search queries when you want the latest information.
- For "latest" questions, report the newest version or date in the results and cite its URL.

If `get_current_datetime` is unavailable, say so, and do not guess the date.
