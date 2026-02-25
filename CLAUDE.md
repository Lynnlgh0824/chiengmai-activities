# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Identity

**Project Name:** Chiengmai Activities Platform (清迈活动策划管理系统)

This is an **independent project**.

Claude must **NEVER** reference files, code, or context from other projects.

Claude must **ONLY** operate within this directory (`/Users/yuzhoudeshengyin/Documents/my_project/Chiengmai/`).

---

## Architecture Rules

Claude MUST **NOT**:
- Modify folder structure without permission
- Rename files without permission
- Move files without permission
- Delete files without permission

Claude MUST:
- Preserve existing structure
- Follow established patterns
- Extend code without breaking structure

---

## Memory Scope

Claude memory is **LIMITED** to this project directory.

Do **NOT** assume context from:
- Other folders in `/Users/yuzhoudeshengyin/Documents/my_project/`
- Other repositories
- Other projects

---

## Coding Rules

Before coding, Claude must:
1. Read `README.md`
2. Read architecture
3. Follow existing patterns

---

## Safety Rule

If unsure, Claude must **ASK** instead of modifying.

---

## Git Rule

Claude must **NEVER**:
- Expose secrets
- Commit `.env`
- Commit private keys

---

## Development Commands

- `npm install` - Install dependencies
- `npm start` - Start server in production mode
- `npm run dev` - Start server in development mode with auto-restart
- `npm test` - Run tests (currently placeholder)

## Project Architecture

This is a basic Express.js server with the following structure:

- **server.js** - Main application entry point
  - Creates Express app instance
  - Configures middleware (JSON parsing, URL encoding)
  - Defines basic routes (/ and /api/health)
  - Starts server on port 3000 (or PORT environment variable)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 4.x
- **Dev Tool**: Nodemon for development

## Key Features

- Basic health check endpoint at `/api/health`
- JSON middleware for parsing request bodies
- Environment variable support for port configuration
- Development mode with nodemon for auto-restart

## Getting Started

1. Install dependencies: `npm install`
2. Start in development: `npm run dev`
3. Server will be available at `http://localhost:3000`