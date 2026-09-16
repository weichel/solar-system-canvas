# Project audit — September 16, 2026

## Deployment findings

1. **High: production source was missing from GitHub.** Local `master` and the remote branch both pointed to `e4f00ae0a7ab69c01d10b9cf1c8bf36f2478d825` (v1). Production serves v1.12 and Vercel identifies its source as `4fc8655a0daca8378aff1aaa1011322a03356cf9`. GitHub reports that commit does not exist in this repository. Pushing the original checkout could replace newer production features with v1. The cause of the missing history is not established.
2. **Medium: two divergent entry points.** Root `index.html` was older than `public/index.html`. Editing the root file would not update the deployed public entry point. Removed the stale root file and explicitly configured `public` as Vercel's output directory.
3. **Automatic deployment is already configured.** Vercel's Git settings show `weichel/solar-system-canvas` connected. The overview identifies `master` as the production branch. Framework is Other, project root is empty, command overrides are disabled, and ignored build behavior is Automatic. Saving local edits alone cannot trigger a Git deployment.

## Source recovery and validation

- Retrieved the public production HTML with HTTP 200 and restored it to `public/index.html` without changing its application logic.
- All eight production texture files have identical SHA-256 hashes to their local counterparts.
- The recovered HTML contains the import map and application module, without an injected deployment script.
- JavaScript module syntax passes Node's syntax check.
- Live app renders, with no warning/error messages captured in the browser's initial console log inspection.
- Added `vercel.json` and publishing instructions in `README.md`.
- No commit, push, production deployment, or Vercel setting mutation was performed during this audit. Automatic publishing is configured but a new push-to-production cycle has not been tested.

## Application findings — not changed in this audit

- **Medium: speed changes jump orbital positions.** `animate()` multiplies total elapsed time by the current speed. Setting speed to zero resets orbital time to zero instead of pausing at the current position; changing speed also causes discontinuities. Integrate frame delta into simulation time instead.
- **Medium: keyboard accessibility.** Clickable planet labels are `div` elements with no keyboard role or tab stop, and form labels have no `for` association. Use semantic buttons and associate labels with control IDs.
- **Medium: short-screen overflow.** At a 390 × 664 viewport, the fixed control panel extends to y=735.95 and uses visible overflow without its own scroll area. Lower content is clipped on short screens. Add a viewport-constrained scrollable panel or collapsible controls.
- **Low: camera movement depends on frame rate.** WASD movement applies a fixed step every animation frame. Use frame delta for consistent movement across devices. Clear the key state on window blur to avoid movement continuing after a missed keyup.
- **Low: Home camera does not restore the stored home position.** `goHome()` targets the origin while retaining the current viewing direction; `HOME_CAMERA_POS` is not used to restore the initial view.
- **Reliability dependency:** browser imports require unpkg.com and jsDelivr; optional satellite data uses CelesTrak. Dependencies are version-pinned, but CDN availability remains necessary. There is no package manifest, dependency lockfile, automated test suite, or build check in the original repository.

## Evidence

- Production: https://solar-system-canvas.vercel.app/
- Deployment: https://vercel.com/jordys-projects-b3b8f7d2/solar-system-canvas/6T4SsU7otw2xT5RNjWkED1Y9ogsw
- Git settings: https://vercel.com/jordys-projects-b3b8f7d2/solar-system-canvas/settings/git
- Build settings: https://vercel.com/jordys-projects-b3b8f7d2/solar-system-canvas/settings/build-and-deployment
- Vercel Git deployment documentation: https://vercel.com/docs/git
