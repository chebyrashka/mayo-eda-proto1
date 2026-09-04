# Mayo Clinic Platform — Explore

Private concept prototype combining two full-screen modes: a blue Ask workspace and a white Discover experience. A persistent keyboard-accessible mode switch connects them with a sliding transition. An intentional downward scroll or upward swipe at the opening Ask boundary also enters Discover; active conversations require an explicit mode switch to leave Ask. At the top of Discover, scrolling upward or swiping downward returns to the top of Ask without clearing the conversation. A brief transition guard prevents momentum from immediately reversing a switch. Each pane retains its scroll position and conversation state while switching. Motion respects reduced-motion preferences. Features three curated exploration paths, context from resource cards, source links, follow-up prompts, and a sample project brief.

This is a design exploration, not an official Mayo Clinic service. All responses are deterministic curated samples; there is no model, patient data integration, or message submission. In-memory state resets on reload. Asset and content sources are recorded in ASSETS.md.

## Develop

Node 22.13+ is required. Run `npm install`, then `npm run dev`. Run `npm run build` for production and `npm run lint` for static checks. The Sites starter uses React/Vinext and plain CSS; no additional application dependencies were added.

## Deployment

The project is prepared for a private Sites deployment. `.openai/hosting.json` contains its project identifier. Production output is generated under `dist/`. Package with the Sites hosting helper and deploy privately. Public launch and any real Mayo affiliation require a separate product decision. Netlify deployment would require adapting the generated Workers-specific Vite configuration.

## Environment

No API keys or environment variables are needed; see `.env.example`. A live agent, CMS, database, or authentication provider has intentionally not been selected.
