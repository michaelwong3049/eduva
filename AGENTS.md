# AGENTS

## Project overview
- Electron Forge app with Vite + React renderer
- Main process: `src/main`
- Preload: `src/preload`
- Renderer: `src/renderer`

## Commands

### Install
- `npm install`

### Run (dev)
- `npm run start`

### Lint
- `npm run lint`

### Build / package
- `npm run package`
- `npm run make`
- `npm run publish`

### Tests
- No test runner is configured in `package.json`.
- If tests are added later, document how to run a single test here.

## Code style guidelines

### Language and runtime
- TypeScript in all main/preload/renderer code.
- `tsconfig.json` uses `noImplicitAny`; avoid `any` unless there is no alternative.
- Module system is `commonjs` (main/preload) with Vite handling renderer bundling.

### Imports
- Prefer explicit named imports over namespace imports.
- Order imports by group:
  1. Node built-ins (`node:path`)
  2. External packages (`electron`, `react`, `@radix-ui/*`)
  3. Internal modules (relative or `src/*` alias)
  4. Styles (`.css`)
- Use single quotes for import paths.

### Formatting
- Use 2 spaces for indentation.
- Prefer single quotes for strings.
- Always include trailing semicolons.
- Keep JSX on multiple lines for nested elements.

### Naming conventions
- `camelCase` for variables and functions.
- `PascalCase` for React components, classes, and types.
- `UPPER_SNAKE_CASE` only for true constants.
- File names are `kebab-case` or `camelCase` (match existing file pattern).

### Types
- Prefer explicit return types on exported functions.
- Use `type` for object shapes and `interface` for public contracts when needed.
- Avoid `any`; use `unknown` and narrow when input is not trusted.
- Keep Electron IPC payloads typed and documented.

### Error handling
- Handle async failures with `try/catch` and log via `console.error`.
- Prefer early returns for invalid state.
- Ensure all `globalShortcut` registrations are balanced with unregisters.

### Electron specifics
- Keep `contextIsolation: true` unless there is a clear reason to disable.
- Use the preload to expose a minimal, typed API (`contextBridge`).
- Avoid enabling `nodeIntegration` in renderer.
- Avoid long-running work on the main thread; move to async flows.

### React / renderer
- Use functional components and hooks.
- Keep renderer free of Node APIs; go through preload IPC.
- Import global CSS in `src/renderer/renderer.ts` only.
- Prefer inline styles for quick layout, CSS classes for shared styles.

### CSS
- Keep styles minimal and scoped; avoid global resets beyond `body`.
- Match the existing font stack unless the design requires change.

### File organization
- Main process logic in `src/main`.
- Preload bridge in `src/preload`.
- Renderer UI in `src/renderer`.
- Shared utilities in `src/utils.ts` or new `src/utils/*`.

### Linting rules summary
- ESLint config: `eslint:recommended`, `@typescript-eslint/recommended`,
  `import/recommended`, `import/electron`, `import/typescript`.
- Fix lint issues before submitting changes.

## Workflow tips for agents
- Check `npm run lint` after edits.
- Run `npm run start` to validate renderer and main integration.
- When adding new IPC channels, update both main and preload.

## Repository conventions
- Avoid adding new build/test tooling without checking with the user.
- Keep changes focused to the task; do not refactor unrelated files.
- Prefer small, readable functions in main process event handlers.

## Notes about missing rules
- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- No Copilot rules found in `.github/copilot-instructions.md`.

## Plan mode (basically ask mode)
- Explain what I am doing wrong, why something is giving an error (if there are any)
- Tell me how to solve this and why the solution works
- Write the solution code in the TUI
