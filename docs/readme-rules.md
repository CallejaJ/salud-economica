# README Structure Rules

This document defines the canonical README structure for every project. It is written as instructions for an AI assistant (Claude, Cursor, or equivalent) to follow when creating or rewriting a README. It is the cleaned-up version of Jorge's original `cursor-rules.md`.

## Purpose

These rules exist to ensure every project README is:

- Immediately scannable (tables and bold terms, no walls of prose)
- Technically accurate without being a tutorial
- Consistent in section order and naming conventions
- Free of diagrams that require special renderers (no Mermaid)

## Section Order and Rules

Follow this section order exactly. Omit a section only if it genuinely does not apply (no localization means no Localization section). Do not add sections not in this list without explicit instruction.

### 1. Title, Badges and Tagline

```html
# Project Name

<div align="center">
    <img src="https://img.shields.io/badge/Framework-Version-color?style=for-the-badge&logo=logo-slug" alt="Label" />
</div>

<p align="center">
    <i>One sentence describing what the project does and what makes it distinct.</i>
</p>
```

- The title is the brand name, not a generic descriptor (`PrintAllPDFs`, not "PDF Printing App").
- Badges go right after the title: `shields.io`, `style=for-the-badge`, format `Label-Version-HexColor?style=for-the-badge&logo=simple-icons-slug`.
- Include 6 to 10 badges for the most recognizable technologies, using official brand colors. If a slug does not exist on Simple Icons, omit `logo` and use a representative color.
- Default stack badges: Next.js `000000`, React `61DAFB`, TypeScript `3178C6`, Motion `FFF312` (logo `framer`), Jest `C21325`, Playwright `2EAD33`, Vercel `000000`.
- The tagline is one factual sentence in `<p align="center"><i>...</i></p>`. No marketing copy.
- Do not add a `**Tech Stack**:` inline line; the badges serve that purpose.

### 2. Domain Concept Sections

Sections that explain the core model of the project: what kinds of things it has and how they differ (e.g. "Printing Modes", "Game Modes", "Subscription Plans").

- Names are descriptive noun phrases.
- Use a **table** whenever comparing two or more entities across the same attributes: columns are attributes, rows are entities.
- Two to four sentences of prose may introduce the table.
- One section per major domain concept.

**Table or list:** a table compares N items across M shared attributes (N ≥ 2, M ≥ 2). A bullet list is for capabilities or steps without a shared schema. Never use a list where a table would be more compact.

### 3. Feature Sections

One section per major feature or subsystem (e.g. "File Queue", "Batch Printing", "API Endpoints").

- Lead with 2 to 4 sentences on the purpose or design decision, then a table or bullets.
- Describe what the system does, not how to reproduce it. No step-by-step tutorials.
- File paths, function and variable names are encouraged as reference.
- Sequence diagrams are prohibited; use prose plus a step table.

### 4. System Architecture

```markdown
## System Architecture

| Component | Role |
|---|---|
| **Component Name** | What it does in one sentence |
```

- Always the two-column Component and Role table, component names in bold.
- Cover every layer: frontend, API, storage, auth, external services, notable internal engines.

### 5. Technology Stack

```markdown
## Technology Stack

- **Category**: Library/Framework version, other tools in the same category
```

- Bulleted, bold category labels, versions for primary frameworks.
- Categories (only relevant ones): Frontend, Backend/API, Blockchain, Authentication, Storage, State Management, Forms, Animation, Testing, Deployment.

### 6. Key Features

```markdown
## Key Features

1. **Feature name** — one sentence describing the user-facing value or technical distinction
```

- Numbered, 5 to 10 items, bold name, em dash, one sentence.
- Ordered from most differentiated to most expected; no verbatim repeats from other sections.

### 7. Testing Strategy

2 to 5 sentences on what is tested and how: unit and integration framework, fixtures, E2E, how external services or contracts are verified. If there is no formal suite, describe the manual strategy. Never skip this section.

### 8. Localization (conditional)

Only for multi-language projects. 2 to 4 sentences on the approach (for the default stack: `LanguageProvider`, `lib/strings.ts`, `localStorage("lang")`, ES and EN).

### 9. Project Setup

- Start with dependency installation.
- An `env` code block with every required variable and placeholder values, grouped with `# comments`; no prose per variable.
- The dev server command, then extra steps (deploys, contracts).
- End the README with `---` and a one-line `Built for X.` footer.

## Formatting Conventions

- **Bold key terms** on first use in a section.
- Backticks for file paths, functions, variables, CLI commands and package names.
- Headers are title-cased noun phrases ("Minting Model", not "How to Mint").
- No emoji in headings or prose.
- No horizontal rules between sections, only before the footer.
- Tables always have a header row and `---` separators; cells hold one sentence or a short phrase.

## What to Avoid

- **Mermaid diagrams**: replace with prose and tables
- **Step-by-step deep dives**: the README is a reference, not a tutorial
- **Generic titles**: always the brand name
- **Unstructured prose**: more than 4 sentences without a table or list is too long
- **Duplicate information**: Key Features must not repeat other sections
- **Marketing language**: "powerful", "cutting-edge", "seamless" are filler
- **Skipping Testing Strategy**

## Blank Template

See `templates/README.md`.
