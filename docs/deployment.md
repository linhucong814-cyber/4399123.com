# Deployment Notes

4399123.com can be built as a static Vue/Vite site. The public repository is designed to be reproducible without production secrets.

## Local Build

```bash
npm ci
npm run build
```

The build writes generated files to `dist/`. The `prebuild` step also refreshes public SEO files in `public/`:

- `robots.txt`
- `sitemap.xml`
- `rss.xml`

## Preview

```bash
npm run preview
```

Use the local preview URL to check the homepage, `/blog`, `/community`, `/vibe-coding`, and at least one content detail route.

## Environment

The static site works without API credentials. Optional same-origin API integration can be configured with:

```bash
VITE_AUTH_API_BASE=
```

Leave it empty for same-origin requests. Do not commit production `.env` files.

## Production Boundary

The live server may include private runtime services, local app directories, logs, deployment archives, databases, and credentials that are intentionally excluded from this repository.

When updating the open-source repo from a server inspection:

- copy only public front-end source, public content, public assets, and documentation
- never copy `.env`, database files, logs, server credentials, or private user data
- keep server config as documentation unless it has been explicitly sanitized
- verify the static build locally before publishing to GitHub

## Recommended GitHub Release Flow

1. Create a focused branch.
2. Run `npm ci` and `npm run build`.
3. Review `git diff` for secrets and unrelated files.
4. Commit the intended files only.
5. Push the branch and open a pull request.
