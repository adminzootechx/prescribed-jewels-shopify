# Prescribed Jewels – Shopify Theme Setup

Guide for collaborators (humans or AI agents such as Gemini, Codex, Claude) to get this theme running locally.

## Project facts

- **Store domain:** `fffwdz-pq.myshopify.com`
- **Theme name:** Prescribed Jewels (fresh custom theme, built from scratch – not a fork of Dawn/Horizon)
- **Live theme on the store:** Horizon (do NOT overwrite or publish over it without the owner's approval)
- **Config:** `shopify.theme.toml` defines the `development` environment pointing at the store.

## Prerequisites

1. **Node.js** 20.10 or newer (`node -v`).
2. **Git** (`git --version`).
3. **Shopify CLI** 3.x/4.x:
   ```
   npm install -g @shopify/cli@latest
   shopify version
   ```
4. **Access to the store.** The store owner must add you as a staff member (Shopify admin → Settings → Users) with *Themes* permission, or share a collaborator request / theme access password. You cannot log in without this.

## First-time setup

```
git clone <repo-url>
cd prescribed-jewels-shopify
shopify theme list --store=fffwdz-pq.myshopify.com
```

The first CLI call that touches the store triggers authentication: it prints a verification code and a URL (`https://accounts.shopify.com/activate-with-code?...`). Open it in a browser, log in with the account that has store access, and confirm the code. The session is then cached on your machine; you do not need to log in again until it expires.

Note for agents: `shopify auth login` requires `--alias <name>` in non-interactive terminals and is not necessary. Simply running any store command with `--store=...` starts the login flow. If you are a non-interactive agent, ask the human to complete the browser step and then rerun the command.

## Daily workflow

| Goal | Command |
|---|---|
| Live preview with hot reload (uploads a temporary dev theme) | `shopify theme dev --environment development` |
| Lint the theme | `shopify theme check` |
| List themes on the store | `shopify theme list --store=fffwdz-pq.myshopify.com` |
| Push as a new unpublished theme | `shopify theme push --environment development --unpublished --theme "Prescribed Jewels"` |
| Push to a specific existing theme | `shopify theme push --environment development --theme <THEME_ID>` |
| Pull changes made in the theme editor | `shopify theme pull --environment development --theme <THEME_ID>` |

`theme dev` prints a local URL (`http://127.0.0.1:9292`) and a shareable preview link.

## Rules of the road

- **Never** run `shopify theme push --live` or `shopify theme publish` unless the owner explicitly asks.
- Run `shopify theme check` before every commit; it should report no errors.
- Customizations made in the Shopify theme editor live in the store, not git. Pull before you start editing JSON templates/`config/settings_data.json` to avoid overwriting them.
- Do not commit `.shopify/`, `.env`, or any tokens/passwords (already in `.gitignore`).
- Keep one theme folder layout: `assets/ blocks/ config/ layout/ locales/ sections/ snippets/ templates/`.

## Troubleshooting

- **"A store is required"** → pass `--store=fffwdz-pq.myshopify.com` or use `--environment development`.
- **Auth errors / 401 / 403** → you lack store access, or the session expired. Ask the owner to verify your staff permissions, then rerun any store command to re-authenticate. `shopify auth logout` clears the cached session.
- **`shopify` not found on Windows** → ensure the npm global bin (`%APPDATA%\npm`) is on `PATH`, then reopen the terminal.
- **Port 9292 in use** → `shopify theme dev --port 9293`.
