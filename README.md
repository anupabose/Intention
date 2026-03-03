# Intention

**Local-first decision tracking and context system for AI agents via MCP.**


Track decisions, learn preferences, and maintain context across all your AI interactions.

## What is this?

A standalone MCP server that helps AI agents remember **why** you made decisions, **what** preferences you have, and **where** you left off. Built on SQLite with vector search for semantic retrieval.

| | Intention | Traditional Notes |
|---|---|---|
| **Setup** | `npx intention` | Manual organization |
| **Search** | Semantic + temporal | Text search only |
| **Integration** | Works with any MCP client | Copy-paste |
| **Structure** | Auto-categorized | Manual tagging |
| **Privacy** | 100% local | Depends on tool |

## Install

```bash
npm install -g intention
```

## Usage

```bash
# stdio mode (for Claude Code, Cursor, etc.)
intention

# HTTP mode (for remote agents)
intention --http --port 3939
```

## MCP Client Configuration

### Claude Code

Add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "intention": {
      "command": "intention"
    }
  }
}
```

### Cursor

Add to MCP settings:

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

## Tools

| Tool | Description |
|---|---|
| `decide` | Record a decision with reasoning and alternatives |
| `prefer` | Store a preference or pattern |
| `why` | Retrieve reasoning for past decisions |
| `context-switch` | Save/restore project context |
| `patterns` | Show learned preferences |
| `timeline` | Browse decisions chronologically |
| `relate` | Link related decisions |

## Resources

| URI | Description |
|---|---|
| `intention://recent` | Recent decisions (24h) |
| `intention://projects` | All tracked projects |
| `intention://preferences` | Your learned preferences |
| `intention://stats` | Decision statistics |

## Prompts

| Name | Description |
|---|---|
| `decision-review` | Review and reflect on recent decisions |
| `pattern-analysis` | Analyze your decision patterns |
| `context-restore` | Restore context for a project |

## Configuration

Config lives at `~/.intention/config.json`:

```json
{
  "db_path": "~/.intention/decisions.db",
  "embedding": {
    "provider": "onnx",
    "model": "Xenova/all-MiniLM-L6-v2"
  },
  "server": {
    "transport": "stdio",
    "port": 3939
  }
}
```

## How it works

1. You (or an agent) call `decide` with a decision and context
2. Intention generates embeddings locally for semantic search
3. Extracts key entities (projects, technologies, patterns)
4. Stores in SQLite with vector search capability
5. `why` retrieves decisions by semantic similarity
6. All data stays local — zero cloud dependencies

## Use Cases

- **"Why did I choose PostgreSQL over MongoDB?"** - Retrieve decision reasoning
- **"What's my preferred error handling pattern?"** - Learn from past preferences
- **"What was I working on in project X?"** - Context restoration
- **"Show decisions about authentication"** - Semantic search across decisions
- **"What patterns do I follow for API design?"** - Pattern analysis



## Topics

`typescript` `ai` `decisions` `mcp` `agents` `local-first` `sqlite` `context-tracking`
