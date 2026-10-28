# Copilot instructions

Project context Copilot should apply to every session in this repository.

## Stack

- Framework: Astro (static output).
- Language: TypeScript.
- Styling: plain CSS in the base layout.

## Conventions

- Keep components small and focused.
- Prefer semantic HTML and accessible markup.
- Do not close, or add closing keywords for, the exercise walkthrough issue (issue #1) in any pull request. The exercise's GitHub Actions workflows manage that issue. When you open a pull request for app work, link only the specific app work-item issue you are implementing.

## Persistence and hydration rules

- Persistence: persist bookmarks in the browser's `localStorage`. There is no server or database.
- Hydration: run browser-only code (anything touching `localStorage`, `window`, or `document`) only in components hydrated with `client:load`, so SSR and the static build never touch `localStorage`.
