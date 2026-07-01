# Shopify CLI Setup (Ubuntu / Linux) — and how we'll use it together

The Shopify CLI runs on **your** computer and signs in with **your** browser, so you run these commands. Once the theme is pulled into this project folder, **I can edit the theme code** (logo, brand colors, homepage sections) and you push it live. That's how we make the real store match the branded preview.

Your store: `global-pest-supplies.myshopify.com`

> **Important — where to pull the theme:** the folder I can edit is `C:\Users\AINov\Documents\global-pest-supplies`.
> - If you're on **WSL (Ubuntu on Windows)**, that folder is at `/mnt/c/Users/AINov/Documents/global-pest-supplies` — pull the theme there.
> - If you're on a **separate Ubuntu machine**, I can't reach its files. Use the visual theme editor instead (see `STORE-SETUP-GUIDE.md`), or copy the pulled theme into the synced folder.

---

## Step 1 — Install Node.js 20+ (one time)
The CLI needs Node 20.10+ . Ubuntu's default `apt` Node is often too old, so use NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should be v20+ 
npm -v
```
*(Prefer nvm? `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`, restart the shell, then `nvm install --lts`.)*

## Step 2 — Install the Shopify CLI (one time)
```bash
npm install -g @shopify/cli@latest
shopify version
```
*(If you get an EACCES permission error on the global install, either use nvm, or set an npm prefix in your home dir: `npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to your PATH.)*

## Step 3 — Go to the project folder
```bash
# WSL (recommended so I can edit the files):
cd /mnt/c/Users/AINov/Documents/global-pest-supplies
```

## Step 4 — Pull your live theme
```bash
shopify theme pull --store global-pest-supplies.myshopify.com
```
- Your browser opens → log in / approve. This is the "connect" step that authenticates the CLI to your store.
- If prompted, pick your live/default theme. The theme downloads into a subfolder here.

> If browser login is awkward over SSH/headless, use a **Theme Access** token (install Shopify's free *Theme Access* app, create a password) and set `SHOPIFY_CLI_THEME_TOKEN`. **Keep that token in your terminal — don't paste it to me.**

## Step 5 — Tell me "theme is pulled"
I'll then edit the theme code to apply:
- Logo (`assets/logo-lockup.png`) + favicon (`assets/favicon-64.png`)
- Brand colors — primary `#1E6BFF`, dark `#0A1628`, accent `#3A8AFF`
- Homepage sections (hero, Shop-by-Pest grid, Best Sellers, DIY Kits, blog, email signup)
- Announcement bar text

## Step 6 — Preview locally, then push live
```bash
shopify theme dev --store global-pest-supplies.myshopify.com    # live-reload preview at localhost:9292
shopify theme push --store global-pest-supplies.myshopify.com   # publish when happy
```

---

## CLI vs. the connector I already use
- **Done already via the connector (no CLI):** products, collections, blog, navigation, discounts, SEO.
- **What the CLI adds:** editing the **theme code** (logo, colors, homepage). The connector can't edit a live theme, so the CLI is the piece that unlocks branding-by-code.
- **No-install alternative:** the visual editor (Online Store → Themes → Customize) gets the same result — steps in `STORE-SETUP-GUIDE.md`.

Sources: [Shopify CLI for themes](https://shopify.dev/docs/storefronts/themes/tools/cli) · [Theme commands](https://shopify.dev/docs/api/shopify-cli/theme)
