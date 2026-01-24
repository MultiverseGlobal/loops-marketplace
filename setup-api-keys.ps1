# PowerShell script to set up API keys for Claude Code and Codex CLI
# Run this script to configure your API keys

Write-Host "=== API Key Setup for Claude Code and Codex CLI ===" -ForegroundColor Cyan
Write-Host ""

# Claude Code API Key
Write-Host "Claude Code API Key Setup:" -ForegroundColor Yellow
Write-Host "1. Get your API key from: https://console.anthropic.com/" -ForegroundColor White
Write-Host "2. Enter your Claude Code API key (or press Enter to skip):" -ForegroundColor White
$claudeKey = Read-Host

if ($claudeKey) {
    $env:ANTHROPIC_API_KEY = $claudeKey
    Write-Host "Claude Code API key set for this session." -ForegroundColor Green
    
    # Try to set via claude config if available
    try {
        claude config set api_key $claudeKey 2>&1 | Out-Null
        Write-Host "Claude Code API key also saved via config command." -ForegroundColor Green
    } catch {
        Write-Host "Note: Could not save via config command. Key is set for this session only." -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipped Claude Code API key setup." -ForegroundColor Yellow
}

Write-Host ""

# Codex CLI API Key
Write-Host "Codex CLI API Key Setup:" -ForegroundColor Yellow
Write-Host "1. Get your API key from: https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "2. Enter your Codex CLI API key (or press Enter to skip):" -ForegroundColor White
$codexKey = Read-Host

if ($codexKey) {
    $env:OPENAI_API_KEY = $codexKey
    Write-Host "Codex CLI API key set for this session." -ForegroundColor Green
} else {
    Write-Host "Skipped Codex CLI API key setup." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Making API Keys Persistent ===" -ForegroundColor Cyan
Write-Host "To make these keys persistent across sessions, you can:" -ForegroundColor White
Write-Host ""
Write-Host "Option 1: Add to PowerShell Profile (Recommended)" -ForegroundColor Yellow
Write-Host "  Run: notepad `$PROFILE" -ForegroundColor Gray
Write-Host "  Add these lines:" -ForegroundColor Gray
if ($claudeKey) {
    Write-Host "  `$env:ANTHROPIC_API_KEY='$claudeKey'" -ForegroundColor Gray
}
if ($codexKey) {
    Write-Host "  `$env:OPENAI_API_KEY='$codexKey'" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Option 2: Set System Environment Variables" -ForegroundColor Yellow
Write-Host "  1. Open System Properties > Environment Variables" -ForegroundColor Gray
Write-Host "  2. Add ANTHROPIC_API_KEY and OPENAI_API_KEY as User variables" -ForegroundColor Gray
Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green

