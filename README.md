# 4399123.com

4399123.com is an open-source Vibe Coding community entrance for makers who build with AI.

It collects AI coding experiments, small tools, project notes, community posts, and journal-style writing around building things quickly with taste, curiosity, and momentum.

## What Is Inside

- Home page source code
- Blog / Journal page source code
- Vibe Coding category page source code
- Search entrance and front-end navigation
- Community page front-end structure
- Local content data for posts and projects
- Static generation scripts
- Beginner-friendly open-source docs

This first open-source version intentionally does not include production databases, Django secrets, administrator accounts, email settings, third-party API keys, server configuration, or private user data.

## Tech Stack

- Vue 3
- Vite
- Static JSON content files
- Optional API integration for auth, community posts, and project data

The site can run as a static front-end. If API endpoints are unavailable, it falls back to local content where possible.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

## Project Structure

```txt
content/              Local project and journal content
public/               Public assets and small standalone experiments
scripts/              Static content generation scripts
src/components/       Site pages and UI components
src/data/             Site navigation and content loaders
src/services/         Optional API clients
src/utils/            SEO helpers
```

## New Contributors Are Welcome

You do not need to be a professional programmer to help build 4399123.com.

Good first contributions include:

- Fixing typos
- Improving docs
- Sharing a Vibe Coding project
- Adding an AI coding note
- Testing pages on mobile
- Suggesting homepage copy
- Improving accessibility
- Translating docs

See [CONTRIBUTING.md](CONTRIBUTING.md) for the beginner-friendly contribution guide.

## Open-Source Scope

Included in this repository:

- Public front-end source code
- Public static assets
- Public project and blog content
- Community docs

Not included:

- Database files
- Django `SECRET_KEY`
- Production `.env` files
- Admin credentials
- Email credentials
- Third-party API keys
- Server deployment configuration
- Private user data

## License

This project is released under the [MIT License](LICENSE).
