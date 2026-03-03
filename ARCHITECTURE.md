# Architecture

## Overview

Intention is a local-first MCP server for tracking decisions, preferences, and project context.

## Components

### 1. MCP Server (`src/index.ts`)
- Implements Model Context Protocol server
- Handles tool registration and execution
- Supports stdio transport (HTTP planned)

### 2. Decision Store (`src/store.ts`)
- SQLite database wrapper
- Three main tables:
  - `decisions`: Decision records with reasoning and alternatives
  - `preferences`: User preferences and patterns
  - `contexts`: Project context snapshots
- Simple text search (vector search planned)

### 3. Tools

#### `decide`
Records a decision with full context:
- Decision text
- Reasoning
- Alternatives considered
- Project association
- Tags

#### `prefer`
Stores preferences and patterns:
- Category (coding-style, architecture, etc.)
- Preference description
- Context where it applies

#### `why`
Semantic search for past decisions:
- Text-based search (vector search coming)
- Returns relevant decisions with full context

#### `context_switch`
Save/restore project context:
- Save: Store current state for a project
- Restore: Retrieve last saved state

#### `patterns`
View learned preferences:
- Filter by category
- Shows all recorded patterns

#### `timeline`
Chronological decision view:
- Filter by project
- Time-based filtering

## Data Flow

```
User/Agent → MCP Client → Intention Server → SQLite DB
                                ↓
                          Text Search
                                ↓
                          Results → Client
```

## Future Enhancements

1. **Vector Search**: Add sqlite-vec for semantic similarity
2. **Embeddings**: Local embedding generation via ONNX
3. **Decision Graphs**: Link related decisions
4. **Outcome Tracking**: Record decision outcomes over time
5. **Pattern Detection**: Auto-detect preference patterns
6. **HTTP Transport**: Support remote MCP clients
7. **Resources**: Expose decision data as MCP resources
8. **Prompts**: Add guided decision-making prompts

## Storage

- Config: `~/.intention/config.json`
- Database: `~/.intention/decisions.db`
- All data stays local
- Single SQLite file for portability
