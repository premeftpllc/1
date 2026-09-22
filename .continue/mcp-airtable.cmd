@echo off
setlocal
for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env.local") do set "%%A=%%B"
"C:\Users\Administrator\continue-demo\node_modules\.bin\airtable-mcp.cmd" %*
endlocal
