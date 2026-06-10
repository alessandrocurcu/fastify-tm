# ADR-000: Global Claude Instructions File

## Status
Accepted

## Date
2026-06-10

## Context
All work in this project is assisted by Claude Code. The behavior of Claude Code is shaped not only by the project-level `CLAUDE.md` but also by a global instructions file located at `~/.claude/CLAUDE.md` on the developer's machine.

## Decision
Any agent or engineer working in this codebase with Claude Code should be aware that a global instructions file exists and is in effect.

## Consequences
- The effective set of Claude Code instructions is the union of `~/.claude/CLAUDE.md` and `./CLAUDE.md`; the project-level file does not stand alone
