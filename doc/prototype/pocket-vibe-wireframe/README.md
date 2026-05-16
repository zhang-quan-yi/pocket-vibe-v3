# Pocket Vibe Wireframe Prototype

This is a local coded prototype for Pocket Vibe MVP UX/UI review.

It replaces the Figma-only workflow with a versioned, clickable, browser-based prototype. The current version follows `POCKET_VIBE_MOBILE_UX_SPEC.md` v0.2.

## Open

Open `index.html` directly in a browser:

```text
prototype/pocket-vibe-wireframe/index.html
```

No build step is required.

## Modes

- `Prototype`: interactive mobile prototype with clickable states.
- `Flow Map`: clickable information architecture map with flow lines.
- `Screens`: Figma-style screen wall.
- `Annotations`: design review notes.
- `Components`: component and state inventory.

## Covered MVP States

- Repo empty / paste URL / clone progress
- Repo list / continue reading
- Code Map overview / module zoom / node lens
- Code reader default and folded mode
- Visible Reader search/fold/tool entries
- Right tool rail with labeled Map/Search/Cards/Trail controls
- Search sheet with result-row preview
- Symbol action menu triggered from a code token
- Definition peek with `Explain definition`
- References panel
- File cards and reading trail
- Code selection toolbar
- Chat half sheet and token limit state
- Save note tray and saved feedback without leaving Reader
- Code annotation
- Notes list, note detail and daily report
- Offline, LSP indexing and stale anchor states
- Landscape reader plus fully visible right panel
- Map-to-reader path: Overview -> Resolver module -> resolveModule lens -> Reader

## Design Rules

- Reader first: keep code visible by default.
- Map can orient: use Code Map as the repo bird's-eye entry before detailed reading.
- Preview before jump: search and LSP use sheet/peek first.
- Honest degradation: indexing and stale anchor states must not fake accuracy.
- Jump / Ask / Save: token or search -> preview -> explain -> save -> stay near source.
- Reusable IA: Android and HarmonyOS NEXT shells should preserve the same core flow.
