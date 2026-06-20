# Maintainer Checklist

Use this checklist before publishing updates to GitHub.

## Before Editing

- Pull or fetch the latest `main`.
- Check `git status -sb`.
- Confirm the change is public and belongs in the open-source repository.
- Keep production-only files, credentials, logs, and database exports out of scope.

## Before Commit

- Run `npm ci` when dependencies changed or the workspace is fresh.
- Run `npm run build`.
- Review generated files in `public/` when content changed.
- Review `git diff` for secrets, unrelated files, and accidental server paths.

## Before Merge

- Confirm CI passes.
- Check that docs still match the project structure.
- Make sure new content has a clear title, date, summary, tags, and route.
- Prefer small pull requests with one purpose.
