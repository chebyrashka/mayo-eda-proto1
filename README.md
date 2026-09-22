# Mayo Clinic Platform — Explore

Private concept prototype combining two full-screen modes: a blue Ask workspace and a white Discover experience. A persistent keyboard-accessible mode switch connects them with a sliding transition. An intentional downward scroll or upward swipe at the opening Ask boundary also enters Discover; active conversations require an explicit mode switch to leave Ask. At the top of Discover, scrolling upward or swiping downward returns to the top of Ask without clearing the conversation. A brief transition guard prevents momentum from immediately reversing a switch. Each pane retains its scroll position and conversation state while switching. Motion respects reduced-motion preferences. Features three curated exploration paths, context from resource cards, source links, follow-up prompts, and a sample project brief.

This is a design exploration, not an official Mayo Clinic service. All responses are deterministic curated samples; there is no model, patient data integration, or message submission. In-memory state resets on reload. Asset and content sources are recorded in ASSETS.md.

The Ask background uses the supplied northern-lights footage, optimized with an end-to-start crossfade and played at half speed, at 0.5 opacity with a blue overlay. Playback pauses in Discover and in hidden browser tabs. Reduced-motion preferences prevent the video from loading and retain the static blue gradient; the gradient also serves as a loading or playback-failure fallback. The video is served locally from `public/ambient-aurora.mp4`. Adjust `defaultPlaybackRate` and `playbackRate` in `app/ambient-background.tsx` to change its speed (currently `0.5`).

## Develop

Node 22.13+ is required. Run `npm install`, then `npm run dev`. Run `npm run build` for production and `npm run lint` for static checks. The Sites starter uses React/Vinext and plain CSS; no additional application dependencies were added.

## Deployment

Netlify deployment is configured in `netlify.toml`: Node 22.17.1, `npm run build`, and publish directory `dist/client`. Netlify builds export static HTML and browser assets; the Ask and Discover interactions run in the browser. No server functions or Next.js adapter are required. To reproduce this build locally, run `NETLIFY=true npm run build`. Connect the repository's `main` branch for automatic deployment on push.

The existing Sites build remains available with `npm run build` when `NETLIFY` is unset. `.openai/hosting.json` contains its project identifier, and the Workers output is generated under `dist/`. Package with the Sites hosting helper and deploy privately.

## Environment

No API keys or environment variables are needed; see `.env.example`. A live agent, CMS, database, or authentication provider has intentionally not been selected.
