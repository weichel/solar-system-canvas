# Cosmic Observatory — product plan and Codex handoff

Prepared September 16, 2026. This file preserves the planning conversation so work can continue on another workstation without access to the original chat.

## Goal and user preferences

Expand the existing solar system explorer into an interactive celestial object observatory. Users should be able to explore objects such as a quasar, a binary star system, and a magnetar, and learn what they are seeing.

The user specifically liked these two feature ideas:

1. **Guided cinematic tours:** camera journeys with short educational stops through the solar system and, eventually, other celestial environments.
2. **Spacecraft journeys:** follow missions such as Voyager, Cassini, and New Horizons, with significant encounters and discoveries along their paths.

The user then proposed expanding beyond the solar system, explicitly mentioning quasars, binary stars, and magnetars. The sections below develop that direction. The proposed implementation order is an assistant recommendation, not a finalized user commitment. The latest request was to document the plan; this document does not mean the expansion has already been built or that implementation should begin without a subsequent work request.

## Product concept

Keep **Orbital Atlas**, the existing observatory, as the foundation. Add a **Cosmic Atlas** destination browser that opens distinct, explorable scenes. The solar system remains a complete destination.

Use separate scenes rather than trying to place every object in one enormous continuous coordinate space. Each scene needs its own useful scale, camera range, time controls, lighting, and explanation. The transition between scenes can still feel like a cohesive journey.

Each destination should offer:

- **Observe:** free exploration, camera presets, pause/speed controls, and feature visibility toggles.
- **Understand:** annotated layers and concise explanations attached to visible features.
- **Take a tour:** a guided sequence with camera movement, a clear explanation at each stop, and pause, next, previous, skip, and exit controls.
- **How do we know?** a compact evidence panel linking claims to authoritative observations and research.

Text should work without audio. Narration is a potential enhancement, not a prerequisite. Keep the existing restrained observatory design, readable controls, and responsive layout.

## Candidate destinations

| Destination | Experience | Possible interactions |
| --- | --- | --- |
| Solar system | Preserve the current planet and moon explorer | Existing navigation, guided inner/outer planet tours, mission entry points |
| Binary stars | Two stars orbiting a shared center of mass | Mass ratio, separation, orbital motion, center-of-mass overlay; use consistent simplified physics |
| Pulsar / magnetar | Related neutron-star experiences with clearly explained differences | Rotation axis, magnetic field visualization, beam geometry; optional pulse sonification and illustrated flare sequence |
| Quasar | An active galactic nucleus viewed at several scales | Host galaxy context, central black hole, accretion disk, jets, annotated scale transitions |
| Black hole | A later, dedicated scene | Accretion disk and gravitational lensing; clearly identify any visual approximations |
| Stellar nursery | A later nebula scene | Star formation stages, gas/dust layers, educational time progression |

Do not present pulsars and magnetars as interchangeable objects. Research the distinctions before writing educational content. Interactions such as changing a star's mass are learning models, not modifications to a named real system.

### Example quasar tour

1. Begin outside the host galaxy and establish its scale.
2. Approach the bright nucleus.
3. Reveal and explain the accretion disk and central black hole.
4. Explore the jet geometry with explanatory overlays.
5. Pull back along a jet to put its extent in context.

Use a researched representative object or explicitly label the scene as a generic illustration. Do not invent measurements or suggest illustrative camera travel is an actual spacecraft journey.

## Spacecraft journeys

Build historical mission experiences separately from virtual trips to distant celestial objects.

- Potential missions: Voyager, Cassini, and New Horizons. No first mission has been chosen yet.
- Show a mission timeline with launch, encounters, flybys, and other researched milestones.
- Provide spacecraft-following and wider contextual views.
- Connect event cards to discoveries and authoritative sources.
- Distinguish an illustrative route from a trajectory calculated from mission data.
- Select a practical data source and time/coordinate model before claiming trajectory accuracy.

For a first release, one well-researched mission is preferable to several incomplete routes. Quasar and magnetar tours should be labeled virtual observatory tours, not historical missions.

## Recommended implementation sequence

### 1. Establish scene and tour infrastructure

- Extract the existing inline application into manageable modules incrementally.
- Preserve the working solar system while introducing destination routing and scene lifecycle handling.
- Define a scene interface for initialization, update, resize, disposal, camera presets, educational content, and tour stops.
- Share the interface shell, renderer where practical, input conventions, and accessibility behavior.
- Dispose of geometries, materials, textures, event listeners, and animation work when leaving a scene.
- Add a destination browser, loading/error states, and a clear return-to-atlas action.

### 2. Build one complete new destination

Recommended first: **binary stars**, because it gives a bounded way to validate the new scene architecture, educational controls, and tour system.

Deliver a polished scene, meaningful mass/separation controls, a center-of-mass overlay, and a short guided tour. Verify the underlying simplified model and explain its limits.

### 3. Add extreme-object scenes

Build a pulsar/magnetar experience and then a quasar experience. These three new destinations are the suggested initial collection. Research each scene before implementation and use restrained, clearly labeled effects rather than unsupported claims of realism.

### 4. Add a historical mission journey

Choose and implement one spacecraft mission using the same tour/timeline foundations. Expand the catalog only after scene switching, camera behavior, and mobile performance are reliable.

## Scientific and experience requirements

- Clearly distinguish observed properties, calculated behavior, and artistic illustration.
- Label exaggerated sizes, compressed distances, accelerated time, magnetic field lines, and other explanatory overlays.
- Research factual content using authoritative sources such as NASA, ESA, observatories, mission archives, and primary research. No external scientific research was completed for this planning document.
- Do not describe the current solar system as an accurate real-date ephemeris. Its positions are simulated.
- Respect reduced motion; avoid intense flashing in pulsar/flare effects. Audio must be optional and user-controlled.
- Keep destination selection, tour controls, and explanations keyboard accessible.
- All selected objects must be framed immediately and remain visible without corrective scrolling.
- Test short mobile screens as well as desktop. Panels must not obscure the target or trap essential controls below the viewport.
- Use device-appropriate quality settings. Avoid making every destination load all assets at startup.

## Current project and important implementation context

- Repository: https://github.com/weichel/solar-system-canvas
- Production: https://solar-system-canvas.vercel.app/
- Vercel project: https://vercel.com/jordys-projects-b3b8f7d2/solar-system-canvas
- Production branch: `master`. Vercel deploys successful pushes automatically.
- Framework preset: Other. Static output directory: `public`, explicitly configured in `vercel.json`.
- Current stack: static HTML/CSS and browser ES modules, Three.js 0.161.0 imported from a CDN, with a satellite.js import. No package install/build step is currently needed.

Key files:

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Standing authorization and publishing workflow |
| `public/index.html` | App markup, scene, and most application logic |
| `public/observatory.css` | Observatory interface and responsive styles |
| `public/simulation.mjs` | Continuous orbital time integration |
| `public/focus-camera.mjs` | Camera tracking during planet focus transitions |
| `public/textures/` | Planet textures |
| `tests/*.test.mjs` | Node regression tests for simulation and camera following |
| `AUDIT.md` | Original audit and subsequent polish notes |
| `README.md` | Local preview and publishing instructions |

The previous checkout was recovered from a newer production deployment because GitHub had older source. That recovery is committed. Do not restore the deleted root `index.html`; `public/index.html` is the app entry point.

The existing app now includes a destination dock, inspector, mobile controls, solar shader, Saturn rings, pause/resume, and guided camera approach. Guided educational tours, historical spacecraft journeys, and extrasolar destinations are **not implemented**.

### Recent camera regression — preserve this fix

Commit `52a504b` fixed planets drifting offscreen after bottom-bar selection. The cause was easing the camera's aim point toward a moving body. The fix locks the aim point to the current body position, moves the camera with the body, and eases only the relative viewing offset. Labels are projected after the camera update. Mobile focus uses a wider framing distance to clear the inspector.

Do not reintroduce a lagging target during tours or scene transitions. Existing tests cover moving-body tracking and preservation of manual zoom offsets.

## Continuing on another workstation

1. Clone `https://github.com/weichel/solar-system-canvas.git`, or pull the latest `master` in an existing clean checkout.
2. Open that folder in Codex and read `AGENTS.md`, this plan, and `README.md`.
3. Run `node --test tests/*.test.mjs` using a current Node.js installation.
4. Serve `public/` over HTTP; for example, with Python installed: `python -m http.server 8000 --directory public`.
5. Open `http://localhost:8000`. Browser dependencies require internet access.
6. Authenticate GitHub on the new workstation before pushing. Vercel dashboard access is useful for verification, but the configured Git deployment does not require a local Vercel CLI.

The user explicitly instructed: **“push and deploy any time we make changes.”** For completed work, perform appropriate checks, commit and push to `master`, then verify the Vercel deployment and live app. Do not ask for publishing permission again. Do not force-push or include unrelated changes.

Suggested next implementation prompt:

> Read AGENTS.md and COSMIC_OBSERVATORY_PLAN.md. Start the Cosmic Observatory expansion by establishing scene switching and building a complete binary-star destination with an educational guided tour. Preserve the existing solar system and its camera fixes. Test desktop and mobile behavior, then push and verify production deployment.

That prompt is a suggested starting point for the user to issue, not an instruction to execute merely because this file was read.
