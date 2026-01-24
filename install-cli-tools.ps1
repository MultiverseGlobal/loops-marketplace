# PowerShell script to install Claude Code and Codex CLI
# Run this script with: powershell -ExecutionPolicy Bypass -File install-cli-tools.ps1

Write-Host "Installing Claude Code and Codex CLI..." -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`nChecking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "`nChecking for npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

# Install Claude Code
Write-Host "`nInstalling Claude Code..." -ForegroundColor Yellow
try {
    npm install -g @anthropic-ai/claude-code
    Write-Host "Claude Code installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to install Claude Code. Error: $_" -ForegroundColor Red
    Write-Host "Trying alternative installation method..." -ForegroundColor Yellow
    # Alternative: Try installing via PowerShell script
    try {
        irm https://claude.ai/install.ps1 | iex
        Write-Host "Claude Code installed via alternative method!" -ForegroundColor Green
    } catch {
        Write-Host "Alternative installation also failed." -ForegroundColor Red
    }
}

# Install Codex CLI
Write-Host "`nInstalling Codex CLI..." -ForegroundColor Yellow
try {
    npm install -g @openai/codex
    Write-Host "Codex CLI installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to install Codex CLI. Error: $_" -ForegroundColor Red
    Write-Host "Note: Codex CLI may require OpenAI API access." -ForegroundColor Yellow
}

# Verify installations
Write-Host "`nVerifying installations..." -ForegroundColor Yellow

try {
    $claudeVersion = claude --version 2>&1
    Write-Host "Claude Code: $claudeVersion" -ForegroundColor Green
} catch {
    Write-Host "Claude Code: Not found in PATH" -ForegroundColor Yellow
    Write-Host "You may need to restart your terminal or add npm global bin to PATH" -ForegroundColor Yellow
}

try {
    $codexVersion = codex --version 2>&1
    Write-Host "Codex CLI: $codexVersion" -ForegroundColor Green
} catch {
    Write-Host "Codex CLI: Not found in PATH" -ForegroundColor Yellow
    Write-Host "You may need to restart your terminal or add npm global bin to PATH" -ForegroundColor Yellow
}

Write-Host "`n=== Setup Instructions ===" -ForegroundColor Cyan
Write-Host "1. Set up Claude Code API Key:" -ForegroundColor White
Write-Host "   Get your API key from: https://console.anthropic.com/" -ForegroundColor Gray
Write-Host "   Then run: `$env:ANTHROPIC_API_KEY='your-api-key-here'" -ForegroundColor Gray
Write-Host "   Or: claude config set api_key your-api-key-here" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set up Codex CLI API Key:" -ForegroundColor White
Write-Host "   Get your API key from: https://platform.openai.com/api-keys" -ForegroundColor Gray
Write-Host "   Then run: `$env:OPENAI_API_KEY='your-api-key-here'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. To make API keys persistent, add them to your PowerShell profile:" -ForegroundColor White
Write-Host "   notepad `$PROFILE" -ForegroundColor Gray
Write-Host "   Then add the export commands above" -ForegroundColor Gray
Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green

