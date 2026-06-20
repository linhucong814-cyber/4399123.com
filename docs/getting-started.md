# Getting Started

This guide is for people opening the project for the first time.

## Run Locally

```bash
npm ci
npm run dev
```

Open the local URL shown in your terminal.

## Edit The Homepage

Homepage components live in:

```txt
src/components/HomePage.vue
src/components/HeroSection.vue
src/components/TopNav.vue
```

## Edit Blog / Journal Content

Blog content lives in:

```txt
content/thoughts/
content/interesting/
```

## Edit Vibe Coding Projects

Project cards live in:

```txt
content/projects/
```

## Build The Site

```bash
npm run build
```

The static output is generated into:

```txt
dist/
```

`dist/` is not committed because it is generated.

## Before Publishing

```bash
npm run check
```

Then review `git diff` and confirm no secrets, `.env` files, logs, databases, or private server files were added.
