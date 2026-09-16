# Project workflow

The user has authorized pushing and deploying completed changes to this project without asking for confirmation each time.

- Make edits in `public/`; `public/index.html` is the canonical app source.
- Run checks appropriate to each change before publishing.
- Commit completed changes and push to `origin/master`, which triggers Vercel production deployment.
- Verify that the deployment succeeds and updates https://solar-system-canvas.vercel.app/ before reporting completion.
- Do not force-push or include unrelated user changes. Report deployment failures and resolve them where possible.
