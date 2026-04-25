# Sentrix Wallet (web) — moved

> ## ⚠ This repository has moved.
>
> The web wallet now lives in the SentrisCloud frontend monorepo:
>
> **[`sentriscloud/frontend`](https://github.com/Sentriscloud/frontend) → [`apps/wallet/`](https://github.com/Sentriscloud/frontend/tree/main/apps/wallet)**
>
> All future development, issues, and pull requests should go there.
> This repository is kept read-only for historical reference.

---

## Why the move

Per the SentrisCloud architecture decision (April 2026), all user-facing TypeScript apps consolidate into a single `pnpm` + Turborepo monorepo at `sentriscloud/frontend`. The `sentrix-labs` org is reserved for the protocol foundation; products live under the `sentriscloud` org.

The mobile wallet (Flutter) lives separately at `sentriscloud/mobile` (different stack).

## Where to find what was here

| Old path | New path |
| --- | --- |
| `sentrix-labs/sentrix-wallet-web` (root) | `sentriscloud/frontend/apps/wallet/` |
| `src/` | same, under `apps/wallet/src/` |
| `package.json` (`"name": "sentrix-wallet"`) | `apps/wallet/package.json` (`"name": "@sentriscloud/wallet"`) |
| Standalone `npm install` | Workspace-level: `pnpm install` at monorepo root |

Git history is preserved in the monorepo as a squashed migration commit.
