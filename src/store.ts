import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export class DecisionStore {
  private db: Database.Database;

  constructor() {
    const configDir = join(homedir(), '.intention');
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    const dbPath = join(configDir, 'decisions.db');
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        decision TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        alternatives TEXT,
        project TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        preference TEXT NOT NULL,
        context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contexts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project TEXT NOT NULL UNIQUE,
        context TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project);
      CREATE INDEX IF NOT EXISTS idx_decisions_created ON decisions(created_at);
      CREATE INDEX IF NOT EXISTS idx_preferences_category ON preferences(category);
    `);
  }

  recordDecision(args: any) {
    const stmt = this.db.prepare(`
      INSERT INTO decisions (decision, reasoning, alternatives, project, tags)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      args.decision,
      args.reasoning,
      JSON.stringify(args.alternatives || []),
      args.project || null,
      JSON.stringify(args.tags || [])
    );

    return {
      content: [
        {
          type: 'text',
          text: `Decision recorded (ID: ${result.lastInsertRowid})\n\n` +
                `Decision: ${args.decision}\n` +
                `Reasoning: ${args.reasoning}\n` +
                (args.project ? `Project: ${args.project}\n` : '') +
                (args.alternatives?.length ? `Alternatives considered: ${args.alternatives.join(', ')}` : ''),
        },
      ],
    };
  }

  recordPreference(args: any) {
    const stmt = this.db.prepare(`
      INSERT INTO preferences (category, preference, context)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(args.category, args.preference, args.context || null);

    return {
      content: [
        {
          type: 'text',
          text: `Preference recorded (ID: ${result.lastInsertRowid})\n\n` +
                `Category: ${args.category}\n` +
                `Preference: ${args.preference}`,
        },
      ],
    };
  }

  searchDecisions(args: any) {
    const query = args.query.toLowerCase();
    const limit = args.limit || 5;

    const stmt = this.db.prepare(`
      SELECT * FROM decisions
      WHERE LOWER(decision) LIKE ? OR LOWER(reasoning) LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const results = stmt.all(`%${query}%`, `%${query}%`, limit);

    if (results.length === 0) {
      return {
        content: [{ type: 'text', text: 'No matching decisions found.' }],
      };
    }

    const text = results
      .map((r: any) => {
        const alts = JSON.parse(r.alternatives || '[]');
        return `[${r.created_at}] ${r.project ? `[${r.project}] ` : ''}\n` +
               `Decision: ${r.decision}\n` +
               `Reasoning: ${r.reasoning}\n` +
               (alts.length ? `Alternatives: ${alts.join(', ')}\n` : '') +
               `---`;
      })
      .join('\n\n');

    return {
      content: [{ type: 'text', text }],
    };
  }

  handleContextSwitch(args: any) {
    if (args.action === 'save') {
      const stmt = this.db.prepare(`
        INSERT INTO contexts (project, context, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(project) DO UPDATE SET
          context = excluded.context,
          updated_at = CURRENT_TIMESTAMP
      `);

      stmt.run(args.project, args.context);

      return {
        content: [
          {
            type: 'text',
            text: `Context saved for project: ${args.project}`,
          },
        ],
      };
    } else {
      const stmt = this.db.prepare('SELECT context, updated_at FROM contexts WHERE project = ?');
      const result = stmt.get(args.project) as any;

      if (!result) {
        return {
          content: [{ type: 'text', text: `No saved context found for project: ${args.project}` }],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Context for ${args.project} (last updated: ${result.updated_at}):\n\n${result.context}`,
          },
        ],
      };
    }
  }

  getPatterns(args: any) {
    let stmt;
    let results;

    if (args.category) {
      stmt = this.db.prepare('SELECT * FROM preferences WHERE category = ? ORDER BY created_at DESC');
      results = stmt.all(args.category);
    } else {
      stmt = this.db.prepare('SELECT * FROM preferences ORDER BY category, created_at DESC');
      results = stmt.all();
    }

    if (results.length === 0) {
      return {
        content: [{ type: 'text', text: 'No preferences recorded yet.' }],
      };
    }

    const text = results
      .map((r: any) => `[${r.category}] ${r.preference}${r.context ? `\n  Context: ${r.context}` : ''}`)
      .join('\n\n');

    return {
      content: [{ type: 'text', text }],
    };
  }

  getTimeline(args: any) {
    const days = args.days || 7;
    let stmt;
    let results;

    if (args.project) {
      stmt = this.db.prepare(`
        SELECT * FROM decisions
        WHERE project = ? AND created_at >= datetime('now', '-' || ? || ' days')
        ORDER BY created_at DESC
      `);
      results = stmt.all(args.project, days);
    } else {
      stmt = this.db.prepare(`
        SELECT * FROM decisions
        WHERE created_at >= datetime('now', '-' || ? || ' days')
        ORDER BY created_at DESC
      `);
      results = stmt.all(days);
    }

    if (results.length === 0) {
      return {
        content: [{ type: 'text', text: `No decisions found in the last ${days} days.` }],
      };
    }

    const text = results
      .map((r: any) => `[${r.created_at}] ${r.project ? `[${r.project}] ` : ''}${r.decision}`)
      .join('\n');

    return {
      content: [{ type: 'text', text: `Timeline (last ${days} days):\n\n${text}` }],
    };
  }
}
