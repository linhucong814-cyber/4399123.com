# Security Policy

4399123.com keeps production secrets, database files, server configuration, runtime logs, and private user data outside this public repository.

## Supported Scope

This repository contains the public static front-end source, public content, public assets, and contributor documentation.

Security reports are in scope when they affect:

- public front-end code in `src/`
- static generation scripts in `scripts/`
- public content or assets committed to this repository
- contributor workflows that could accidentally expose private data

Production server internals, private databases, administrator accounts, and third-party service credentials are not published here.

## Reporting A Vulnerability

Please do not open a public issue that contains secrets, tokens, private user data, server credentials, or exploit details.

Use GitHub Security Advisories when available:

https://github.com/linhucong814-cyber/4399123.com/security/advisories/new

If advisories are unavailable, open a minimal public issue that says a private security report is needed, without posting sensitive details.

## Before Contributing

- Do not commit `.env` files, database dumps, logs, archives, or production config.
- Check `git status` and `git diff` before opening a pull request.
- Run `npm run build` before publishing front-end or content changes.
