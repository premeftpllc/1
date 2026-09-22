@echo off
setlocal
for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env.local") do set "%%A=%%B"
set "SLACK_MCP_XOXB_TOKEN=%SLACK_BOT_TOKEN%"
"C:\Users\Administrator\continue-demo\node_modules\.bin\slack-mcp-server.cmd" %*
endlocal
