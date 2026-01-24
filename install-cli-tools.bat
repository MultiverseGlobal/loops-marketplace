@echo off
REM Batch script to install Claude Code and Codex CLI
REM Run this script as Administrator for best results

echo Installing Claude Code and Codex CLI...
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
node --version

REM Check if npm is installed
echo.
echo Checking for npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not installed. Please install npm.
    pause
    exit /b 1
)
npm --version

REM Install Claude Code
echo.
echo Installing Claude Code...
call npm install -g @anthropic-ai/claude-code
if %errorlevel% neq 0 (
    echo Failed to install Claude Code.
    echo Trying alternative installation method...
    powershell -ExecutionPolicy Bypass -Command "irm https://claude.ai/install.ps1 | iex"
)

REM Install Codex CLI
echo.
echo Installing Codex CLI...
call npm install -g @openai/codex
if %errorlevel% neq 0 (
    echo Failed to install Codex CLI.
    echo Note: Codex CLI may require OpenAI API access.
)

REM Verify installations
echo.
echo Verifying installations...
echo.
claude --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Claude Code: Installed
) else (
    echo Claude Code: Not found in PATH
    echo You may need to restart your terminal or add npm global bin to PATH
)

codex --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Codex CLI: Installed
) else (
    echo Codex CLI: Not found in PATH
    echo You may need to restart your terminal or add npm global bin to PATH
)

echo.
echo === Setup Instructions ===
echo 1. Set up Claude Code API Key:
echo    Get your API key from: https://console.anthropic.com/
echo    Then run: set ANTHROPIC_API_KEY=your-api-key-here
echo    Or: claude config set api_key your-api-key-here
echo.
echo 2. Set up Codex CLI API Key:
echo    Get your API key from: https://platform.openai.com/api-keys
echo    Then run: set OPENAI_API_KEY=your-api-key-here
echo.
echo 3. To make API keys persistent, add them to your system environment variables
echo    or add them to a startup script.
echo.
echo Installation complete!
pause

