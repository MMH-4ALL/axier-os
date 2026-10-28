# AXIER OS

A web-based desktop operating system.

Built with React, Vite, TypeScript, and Tailwind CSS.

## Development

npm ci
npm run dev

## Build

npm run build

## Verify changes

Use Node.js 22 or newer. Run `npm run lint`, `npm test` and `npm run build`.
The dependency lockfile and TypeScript project configs are committed so a clean
checkout can reproduce the build. GitHub Actions runs the same checks before
deploying the site.

Spotify controls use an active Spotify device; account permissions still apply.
The automated Spotify tests use mocked replies and do not sign into an account.
