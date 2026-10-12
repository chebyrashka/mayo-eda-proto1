# Mayo Clinic Platform — Explore

Private concept prototype combining two full-screen modes: a blue Ask workspace and a white Discover experience. A persistent keyboard-accessible mode switch connects them with a sliding transition. An intentional downward scroll or upward swipe at the opening Ask boundary also enters Discover; active conversations require an explicit mode switch to leave Ask. At the top of Discover, scrolling upward or swiping downward returns to the top of Ask without clearing the conversation. A brief transition guard prevents momentum from immediately reversing a switch. Each pane retains its scroll position and conversation state while switching. Motion respects reduced-motion preferences. Features three curated exploration paths, context from resource cards, source links, follow-up prompts, and a sample project brief.

This is a design exploration, not an official Mayo Clinic service. All responses are deterministic curated samples; there is no model, patient data integration, or message submission. In-memory state resets on reload. Asset and content sources are recorded in ASSETS.md.

The Ask background uses the supplied northern-lights footage, optimized with an end-to-start crossfade and played at half speed, at 0.5 opacity with a blue overlay. Playback pauses in Discover and in hidden browser tabs. Reduced-motion preferences prevent the video from loading and retain the static blue gradient; the gradient also serves as a loading or playback-failure fallback. The video is served locally from `public/ambient-aurora.mp4`. Adjust `defaultPlaybackRate` and `playbackRate` in `app/ambient-background.tsx` to change its speed (currently `0.5`).

## Develop

Node 22.13+ is required. Run `npm install`, then `npm run dev`. Run `npm run build` for production and `npm run lint` for static checks. The Sites starter uses React/Vinext and plain CSS; no additional application dependencies were added.

## Branding

Alternative typography uses a locally served Hanken Grotesk variable font, scoped in `branding/alternative/fonts.css`. Original typography keeps the Arial/Helvetica stack. Shared type rules use `--brand-font` so headings, body copy, and controls switch together. The Latin font and its SIL Open Font License are in `public/branding/alternative/fonts/`; visitors do not need a Google Fonts connection.

The `logo` settings in each brand config select its header and footer SVG, accessible name, and intrinsic dimensions. Alternative uses the supplied ExampleHealth logo; original retains its existing logo. Shared responsive styles render the mark dark on white and inverted on the blue Ask header. Both logos use the original's display heights with automatic widths: 38px in the desktop header and 31.6px on mobile, with the footer scaled to the original's approximately 26.67px and 22.13px heights.

Brand-specific settings live in `branding/original/config.json` and `branding/alternative/config.json`. The alternative is the default; use `?brand=original` to preview the preserved original or `?brand=alternative` to explicitly select the alternative. Missing or unrecognized brand values use the default, controlled by `DEFAULT_BRAND` in `branding/brands.ts`. The query is read in the browser so switching also works with Netlify's static export. The URL determines the brand on each visit; no preference is saved.

The alternative updates the footer disclaimer, removes its external visit link, and replaces outgoing links with same-tab `#` placeholders. The original retains its external destinations. `placeholderLinks` in each brand config controls this behavior for navigation, support, resource cards, response sources, and project briefs.

The configs also hold each brand's `metadata`, `chat` responses and source labels, `links`, and `closing` statement. The alternative uses Example Health throughout, a blue-circle favicon, and the Swedish closing line “Patientens behov kommer först.” (“The patient's needs come first.”), marked with `lang="sv"`. Static HTML contains the default brand's title, description, and favicon; selecting another brand updates these in the browser after hydration. The original copy and M favicon remain available through `?brand=original`.

The `images` settings select each brand's photography and alt text. Alternative photographs are AI-generated editorial scenes of fictional clinical researchers, served from `public/branding/alternative/images/`; the original photography remains unchanged in `public/`. See `branding/alternative/photography-prompts.txt` for the exact generation prompts and `ASSETS.md` for provenance. Other content, assets, and interactions remain shared until their alternative versions are supplied.

## Deployment

Netlify deployment is configured in `netlify.toml`: Node 22.17.1, `npm run build`, and publish directory `dist/client`. Netlify builds export static HTML and browser assets; the Ask and Discover interactions run in the browser. No server functions or Next.js adapter are required. To reproduce this build locally, run `NETLIFY=true npm run build`. Connect the repository's `main` branch for automatic deployment on push.

The existing Sites build remains available with `npm run build` when `NETLIFY` is unset. `.openai/hosting.json` contains its project identifier, and the Workers output is generated under `dist/`. Package with the Sites hosting helper and deploy privately.

## Environment

No API keys or environment variables are needed; see `.env.example`. A live agent, CMS, database, or authentication provider has intentionally not been selected.
