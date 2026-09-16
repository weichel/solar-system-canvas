# Solar System Canvas

Interactive static Three.js solar system hosted at https://solar-system-canvas.vercel.app/.

## Edit and publish

- Edit `public/index.html` for the interface, simulation, and styles.
- Edit `public/observatory.css` for the observatory interface and responsive layout.
- Orbital time integration lives in `public/simulation.mjs`. Run its regression checks with `node --test tests/simulation.test.mjs`.
- Edit assets in `public/textures/`.
- Serve `public/` as the web server root for local previews. For example, with Python installed: `python -m http.server 8000 --directory public`.
- Review your changes, commit them, and push to `master`. Vercel is connected to `weichel/solar-system-canvas` and uses `master` for production. Successful deployments update the existing domain automatically.
- Branch pushes produce previews; merge into `master` when ready to publish.

Saving a file locally does not publish it. A Git commit and push (or merged pull request) is the publishing step.

The agreed assistant workflow is to check, commit, push, and verify deployment whenever completed project changes are made; no separate publishing confirmation is needed.

```sh
git add public vercel.json README.md AUDIT.md
git commit -m "Describe the change"
git push origin master
```

Vercel uses the Other framework preset, repository root, and `public` output directory. No package install or build command is needed. `vercel.json` makes the output directory explicit.

## Recovered production source

On September 16, 2026, this checkout and GitHub were at v1 (`e4f00ae`), while production served v1.12. The live HTML was recovered into `public/index.html`; all eight texture files were verified byte-for-byte against production. The obsolete root `index.html` was removed to leave one editable app source. See `AUDIT.md` for findings and verification limits.
