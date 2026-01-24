# Claude Code and Codex CLI Setup

This directory contains scripts to install and configure Claude Code and Codex CLI tools for your terminal.

## Quick Start

### Option 1: PowerShell (Recommended for Windows)
```powershell
powershell -ExecutionPolicy Bypass -File install-cli-tools.ps1
```

### Option 2: Batch File
```cmd
install-cli-tools.bat
```

## What Gets Installed

1. **Claude Code** - CLI tool for interacting with Anthropic's Claude AI
   - Package: `@anthropic-ai/claude-code`
   - Documentation: https://docs.claude.com/en/docs/claude-code/

2. **Codex CLI** - CLI tool for OpenAI's Codex
   - Package: `@openai/codex`
   - Documentation: https://platform.openai.com/docs/

## Prerequisites

- **Node.js** (version 18 or newer recommended)
- **npm** (comes with Node.js)

Download Node.js from: https://nodejs.org/

## Setup API Keys

After installation, you need to configure API keys:

### Claude Code API Key
1. Get your API key from: https://console.anthropic.com/
2. Set it using one of these methods:

**PowerShell (Current Session):**
```powershell
$env:ANTHROPIC_API_KEY="your-api-key-here"
```

**Command Prompt (Current Session):**
```cmd
set ANTHROPIC_API_KEY=your-api-key-here
```

**Using Claude Config:**
```bash
claude config set api_key your-api-key-here
```

### Codex CLI API Key
1. Get your API key from: https://platform.openai.com/api-keys
2. Set it using one of these methods:

**PowerShell (Current Session):**
```powershell
$env:OPENAI_API_KEY="your-api-key-here"
```

**Command Prompt (Current Session):**
```cmd
set OPENAI_API_KEY=your-api-key-here
```

## Making API Keys Persistent

### PowerShell Profile (Recommended)
1. Open your PowerShell profile:
   ```powershell
   notepad $PROFILE
   ```
2. Add these lines:
   ```powershell
   $env:ANTHROPIC_API_KEY="your-api-key-here"
   $env:OPENAI_API_KEY="your-api-key-here"
   ```
3. Save and restart PowerShell

### System Environment Variables
1. Open System Properties > Environment Variables
2. Add `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` as User variables
3. Restart your terminal

### Quick Setup Script
Run the provided setup script:
```powershell
powershell -ExecutionPolicy Bypass -File setup-api-keys.ps1
```

## Verify Installation

After installation, verify the tools are available:

```powershell
claude --version
codex --version
```

## Usage Examples

### Claude Code
```bash
# Start Claude Code in your project
cd your-project
claude

# Or use specific commands
claude chat
claude code
```

### Codex CLI
```bash
# Use Codex CLI
codex --help
```

## Troubleshooting

### Tools not found after installation
- Restart your terminal
- Ensure npm global bin is in your PATH
- Check npm global prefix: `npm config get prefix`
- Add to PATH: `%APPDATA%\npm` (Windows)

### API Key Issues
- Ensure keys are set correctly: `echo $env:ANTHROPIC_API_KEY`
- Check for typos in the API keys
- Verify API keys are active in their respective consoles

## Additional Resources

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)
- [Anthropic Console](https://console.anthropic.com/)
- [OpenAI Platform](https://platform.openai.com/)
- [Node.js Documentation](https://nodejs.org/docs/)

