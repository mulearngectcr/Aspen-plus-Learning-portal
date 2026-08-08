---
name: chem-e-visual-design
description: Visual design system for the Chem-E Bootcamp app (colors, typography, motion, layout patterns). Use this whenever building, styling, or modifying ANY UI for this app — feed, post composer, threaded comments, streak/progress page, auth screens, notification bell, or the admin dashboard. Trigger it any time a component, page, or screen is being created or restyled, even if the request just says "build the feed" or "make a login page" without mentioning design explicitly. This exists specifically to stop output from defaulting to generic Tailwind SaaS templates or landing-page conventions (heroes, AIDA structure, bento grids, scroll-jacking) that don't fit a daily-use utility app.
---

# Chem-E Bootcamp — Visual Design System

## What this app actually is (read this first)

This is a **daily-use utility app**, not a marketing site. Students open it once or twice a day to log a study update, glance at their streak, and check a few comments — then close it. Every design decision should serve that: fast to scan, fast to act in, low visual noise, calm enough to open every single day for four months without getting tired of it.

This is explicitly **not** a landing page. There is no funnel to convert, no hero-to-CTA journey, no pricing section. Don't reach for hero sections, AIDA structure, bento grids, testimonial carousels, partner marquees, or scroll-pinning/stacking animations — none of that has a real equivalent here, and forcing it in produces something that looks impressive in isolation but is annoying to use daily.

The one real design tension to hold onto: **posts and comments are anonymous, but the app still needs to feel human and alive, not sterile.** The visual system leans into anonymity rather than hiding it — see "Anonymous identity marks" below.

## Color

- `--bg`: `#FAF8F3` — warm off-white, not stark white. Easier to look at for repeated daily use.
- `--bg-dark`: `#14171A` (dark mode background)
- `--ink`: `#1A1D1B` — near-black, primary text
- `--ink-dark`: `#EDEBE6` (dark mode text)
- `--primary`: `#14532D` — deep lab green. Used for primary actions, links, active nav state.
- `--primary-soft`: `#E4EDE7` — pale green for subtle backgrounds (e.g. "you" indicators, success states)
- `--streak`: `#C08A2E` — muted amber. **Reserved exclusively for streak/flame states.** Never used decoratively elsewhere — if amber shows up, it means "this is about your streak," and that meaning should stay intact.
- `--danger`: `#9B3B3B` — muted brick red for delete/destructive actions and "missed day" states. Not a bright alarm red — this app is not trying to shame anyone for missing a day.
- `--border`: `#E4E0D6` (light) / `#2A2E2B` (dark) — hairline dividers, not drop-shadowed cards

Do not default to the generic AI-design ruts: a cream-background-plus-terracotta-accent look, a near-black-plus-neon-green look, or a hairline-broadsheet-newspaper look copied wholesale. This palette is _related_ to those (warm background, green accent) but the specific values, the amber-reserved-for-streaks rule, and the muted (not neon/not terracotta) accent choices are what keep it from reading as a template.

## Typography

- **Display / headings**: Fraunces (or Newsreader as a fallback) — a serif with some warmth and a slightly academic, lab-notebook character. Used sparingly: page titles, the big streak number, empty-state headlines. Not for body copy.
- **Body / UI text**: Inter or IBM Plex Sans — clean, high-legibility, used for everything else: post content, comments, buttons, labels, nav.
- **Numerals / data**: a monospace face (IBM Plex Mono or JetBrains Mono) for the streak count, the streak calendar, dates, and timestamps. This is the detail that makes the gamification feel like real tracked data rather than a cartoon badge — use it consistently anywhere a number is being tracked over time.
- Type scale: keep it restrained — 4-5 sizes total (e.g. 14/16/20/28/40px), consistent weight jumps (400 body, 500 emphasis, 600-700 headings). Avoid huge display type; this isn't a hero page, headings top out around 28-32px even on the progress page.

## Anonymous identity marks

Instead of a generic silhouette/gray-circle avatar for anonymous posts and comments, generate a small deterministic abstract mark from the post/comment's UUID:

- Hash the UUID to pick: one of ~6 simple geometric forms (circle, triangle, hex, diamond, arc, dot-cluster), a rotation, and a color from a small fixed set of 5-6 muted tones (not the full palette — a constrained sub-palette so marks feel like a coherent family, not random noise).
- Same UUID always produces the same mark, so a single post's mark stays stable if you revisit it — but marks are **not** reused across a user's different posts (each post gets its own fresh UUID-derived mark), so marks cannot be used to correlate one person's posts across the feed. This is a hard requirement, not a style preference — reusing a per-user mark would quietly break the anonymity work already built into the backend.
- Render at ~32-36px next to "Anonymous" in feed cards and comments. It should read as "a real person, just not identified," not as a broken avatar.

## Layout patterns

- **Feed**: reads like a logbook, not a social timeline. Hairline `--border` divider between entries, not heavy drop-shadow cards. Timestamp in mono face, right-aligned or subdued. Generous vertical spacing between entries (breathing room, not density-for-its-own-sake) but no oversized hero-style padding.
- **Post composer**: stays visually quiet until focused — this is a daily habit, not a moment to sell. Character counter in mono, turns amber (not red) as it approaches the limit.
- **Threaded comments**: indent increases per depth, capped visually around 4-5 levels (deeper replies stay functionally nested but stop indenting further — see prior comment-thread prompt). Collapse affordance is a simple `—`/`+`, not an icon-heavy control.
- **Streak / progress page**: the one place allowed a bit more visual presence — big mono streak number, flame in `--streak` amber, week-grid calendar with small mono date numerals. This is the page's whole job (make the streak feel worth protecting), so it's allowed to feel slightly more designed than the feed.
- **Admin dashboard**: deliberately a different visual mode — swap `--primary` green for a neutral slate (`#475569`), denser tables, no anonymous marks (admins see real names/avatars here), smaller type scale. The shift in palette itself signals "you're in a different, elevated context" without needing a banner that says so.
- **Auth screens**: minimal, centered, single column. No marketing copy — just the form and a one-line description of what the app is.

## Motion — used deliberately, not everywhere

This app is opened daily; motion should never slow that down or feel performative on repeat viewing.

- **The one signature moment**: when a post lands and the streak increments, a brief flame-pulse (scale + subtle glow on the flame icon, ~400ms) — optionally a small confetti burst on notable milestones (7/30/60/90 days) only, not every day. This is the single place to spend animation budget.
- Feed items: a subtle fade-up on initial load (staggered ~30-40ms per item, capped at first ~6 items), nothing on scroll after that — no scroll-triggered reveals, no parallax, no pinning.
- Hover/press states: fast, small — 120-180ms ease-out opacity/scale shifts on buttons and cards. Nothing bouncy or elaborate.
- Respect `prefers-reduced-motion` everywhere — disable the flame-pulse/confetti and fade-ups for anyone who's set that, fall back to an instant state change.
- Prefer plain CSS transitions or Framer Motion for these small interactions over a scroll-animation library like GSAP ScrollTrigger — there's no scroll-driven storytelling here, so pulling in that machinery adds bundle weight for animations this app doesn't use.

## Writing / copy voice

- Plain, active voice, named from the user's side: "Delete comment," not "Comment removal initiated." A button's label should match the toast that follows it ("Post" → "Posted").
- Empty and error states are direction, not apology: "No posts yet today — be the first to share what you studied." not "Oops! Something went wrong! 😅"
- No filler, no exclamation-heavy hype copy, no fake urgency. This is a study tool for engineering students, not a growth-hacked consumer app — the streak mechanic itself provides the motivation; the copy doesn't need to oversell it.

## Quality floor (non-negotiable regardless of how minimal or bold a screen is)

- Responsive down to a small phone screen — this is used on mobile between classes as much as on desktop.
- Visible keyboard focus states on every interactive element.
- Color contrast: body text on `--bg` and `--ink` on `--primary-soft` must pass WCAG AA at minimum.
- No layout shift from late-loading images — reserve space for the two-image attachment slots before they load.
