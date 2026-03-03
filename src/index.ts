#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { DecisionStore } from './store.js';
import { program } from 'commander';

const store = new DecisionStore();

const server = new Server(
  {
    name: 'intention',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'decide',
        description: 'Record a decision with reasoning, alternatives, and context',
        inputSchema: {
          type: 'object',
          properties: {
            decision: { type: 'string', description: 'The decision made' },
            reasoning: { type: 'string', description: 'Why this decision was made' },
            alternatives: { type: 'array', items: { type: 'string' }, description: 'Other options considered' },
            project: { type: 'string', description: 'Project context' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization' },
          },
          required: ['decision', 'reasoning'],
        },
      },
      {
        name: 'prefer',
        description: 'Store a preference or pattern you follow',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Category (e.g., "coding-style", "architecture")' },
            preference: { type: 'string', description: 'The preference or pattern' },
            context: { type: 'string', description: 'When/why this preference applies' },
          },
          required: ['category', 'preference'],
        },
      },
      {
        name: 'why',
        description: 'Retrieve reasoning for past decisions using semantic search',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'What decision are you looking for?' },
            limit: { type: 'number', description: 'Max results to return', default: 5 },
          },
          required: ['query'],
        },
      },
      {
        name: 'context_switch',
        description: 'Save or restore project context',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['save', 'restore'], description: 'Save or restore context' },
            project: { type: 'string', description: 'Project name' },
            context: { type: 'string', description: 'Current context (for save action)' },
          },
          required: ['action', 'project'],
        },
      },
      {
        name: 'patterns',
        description: 'Show learned preferences and patterns',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Filter by category (optional)' },
          },
        },
      },
      {
        name: 'timeline',
        description: 'Browse decisions chronologically',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: 'Filter by project (optional)' },
            days: { type: 'number', description: 'Number of days to look back', default: 7 },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'decide':
      return store.recordDecision(args);
    case 'prefer':
      return store.recordPreference(args);
    case 'why':
      return store.searchDecisions(args);
    case 'context_switch':
      return store.handleContextSwitch(args);
    case 'patterns':
      return store.getPatterns(args);
    case 'timeline':
      return store.getTimeline(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  program
    .name('intention')
    .description('Local-first decision tracking for AI agents')
    .option('--http', 'Run in HTTP mode')
    .option('--port <port>', 'HTTP port', '3939')
    .parse();

  const options = program.opts();

  if (options.http) {
    console.error('HTTP mode not yet implemented. Use stdio mode.');
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Intention MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
