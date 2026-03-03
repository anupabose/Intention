# Setup Instructions

## Push to GitHub

1. Create a new repository on GitHub named "intention"
   - Go to https://github.com/new
   - Repository name: `intention`
   - Description: `Local-first decision tracking and context system for AI agents via MCP`
   - Keep it public or private as you prefer
   - Don't initialize with README (we already have one)

2. Push the code:
   ```bash
   cd ~/intention
   git remote add origin https://github.com/YOUR_USERNAME/intention.git
   git push -u origin main
   ```

## Local Development

1. Install dependencies:
   ```bash
   cd ~/intention
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Test locally:
   ```bash
   npm start
   ```

## Publish to npm (Optional)

1. Update `package.json` with your author info
2. Login to npm: `npm login`
3. Publish: `npm publish`

## Configure with MCP Client

### For Claude Code:

Add to `~/.claude/mcp.json`:
```json
{
  "mcpServers": {
    "intention": {
      "command": "node",
      "args": ["/Users/bhattace/intention/dist/index.js"]
    }
  }
}
```

Or after publishing to npm:
```json
{
  "mcpServers": {
    "intention": {
      "command": "npx",
      "args": ["intention"]
    }
  }
}
```

## Next Steps

1. Test the MCP server with a client
2. Add vector search capability (sqlite-vec)
3. Implement embedding generation
4. Add more sophisticated decision linking
5. Create example workflows
