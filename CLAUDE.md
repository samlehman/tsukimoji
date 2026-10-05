# tsukiMOJi

Moon phase emoji for any date: 月 (tsuki, "moon") + moji. A single small
library implemented three times, once per language, published under the name
`tsukimoji` on npm, PyPI and RubyGems.

- Repo: https://github.com/samlehman/tsukimoji (public, branch `main`)
- Author: Sam Lehman. MIT license, version 0.1.0.

## Branding

- In prose, the name is always written **tsukiMOJi**: lowercase "tsuki",
  uppercase "MOJ", lowercase "i". Use this in READMEs, docs, descriptions,
  titles and the logo's accessible text. Never write "Tsukimoji" or
  "TsukiMoji", even at the start of a sentence.
- Inside code, only user-facing text gets the branding: comments, docstrings,
  package descriptions, page titles and other strings a person reads.
- Identifiers keep their technical forms. Don't rename variables, methods,
  classes, modules or files, including:
  - package names `tsukimoji` (npm, PyPI and RubyGems expect lowercase)
  - import paths: `require("tsukimoji")`, `from tsukimoji import ...`, `require "tsukimoji"`
  - the Ruby module `Tsukimoji` (Ruby constants must start with a capital)
  - the repo URL `github.com/samlehman/tsukimoji`

## Layout

| Path | What |
| --- | --- |
| `npm/` | JS library: `index.js` (CommonJS, the real code), `index.mjs` (ESM wrapper re-exporting it), `index.d.ts` (types), `test.js` |
| `python/` | `src/tsukimoji/__init__.py` (all code), `tests/test_tsukimoji.py`, `pyproject.toml` (setuptools) |
| `ruby/` | `lib/tsukimoji.rb` (all code), `spec/tsukimoji_spec.rb`, `tsukimoji.gemspec` |
| `README.md` | Main GitHub README covering all three languages |
| `logo.svg`, `logo.png` | Main logo (1280×400): the emblem next to the "tsukiMOJi" wordmark. Used in the README header |
| `logo-emblem.svg`, `logo-emblem.png` | The emblem alone (512×512): 月 on a white-and-green armoured plate, surrounded by 3 recursive rings of 8 moon phases |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Simplified logo (one ring, bigger 月) for small sizes |

Each library folder also has its own `README.md` and `LICENSE`. Those are
what get shipped inside each package.

## The three libraries must stay identical

All three use the same constants and formula and must give the same results
for the same moment. Any change to behaviour goes into **all three**, with tests
updated in all three.

- Synodic month: `29.530588853` days
- Reference new moon: 2000-01-06 18:14 UTC
- `age = frac((t - ref) / synodic)`, normalised into `[0, 1)`
- Phase index: `floor((age + 1/16) * 8) % 8` (each phase is centered on its exact point)
- Illumination: `(1 - cos(2π·age)) / 2`
- Phases, in order: 🌑 New Moon, 🌒 Waxing Crescent, 🌓 First Quarter,
  🌔 Waxing Gibbous, 🌕 Full Moon, 🌖 Waning Gibbous, 🌗 Last Quarter,
  🌘 Waning Crescent

The API names follow each language's conventions. Keep them that way:

| | JS | Python | Ruby |
| --- | --- | --- | --- |
| Full result | `getMoonPhase(date?)` | `get_moon_phase(when=None)` | `Tsukimoji.phase(time)` |
| Shortcuts | `emoji()`, `name()` | `emoji()`, `name()` | `Tsukimoji.emoji`, `Tsukimoji.name` |
| Face option (🌚/🌝 for new/full) | `{ faces: true }` | `faces=True` | `faces: true` |
| Age field | `ageDays` | `age_days` | `age_days` |
| Result type | plain object | frozen `MoonPhase` dataclass | `Tsukimoji::Phase` Struct |

Python treats a naive `datetime` as UTC. Every library defaults to "now".
There are no runtime dependencies, and none should be added.

## Tests

Run all three after any change. None of them needs anything installed.

```sh
cd npm && npm test
cd python && python -m unittest discover tests
cd ruby && ruby spec/tsukimoji_spec.rb
```

## Packaging gotchas

- **License lives in 4 places:** the root `LICENSE` (for GitHub) plus
  `npm/LICENSE`, `python/LICENSE` and `ruby/LICENSE`. Keep them identical.
- **Ruby only ships the files listed in `spec.files`** in the gemspec. New files
  must be added there.
- **npm only ships the files listed in `files`** in `package.json`. LICENSE and
  README are always included automatically.
- **The version number is in 4 places:** `npm/package.json`,
  `python/pyproject.toml`, `__version__` in `python/src/tsukimoji/__init__.py`,
  and `ruby/tsukimoji.gemspec`. Bump them together.
- **Python deprecation, still to fix:** `license = { text = "MIT" }` should become
  `license = "MIT"`, and the `License :: OSI Approved :: MIT License` classifier
  should be removed. Builds still work, but setuptools warns this breaks after
  2027-02-18.
- Build output (`dist/`, `*.egg-info`, `*.gem`, `*.tgz`) is gitignored. Clean up
  after a test build anyway.

## Publishing

- **Nothing is published yet.** The name `tsukimoji` was free on all three
  registries as of 2026-10-01.
- **Never publish without Sam's explicit go-ahead in that conversation.** A
  published version can't be reused or easily pulled. Dry runs are fine:
  `npm pack --dry-run`, `python -m build` + `twine check`, `gem build`.
- Logging in to npm, PyPI and RubyGems is interactive, so Sam has to do it.
- Once published, the npm/PyPI/Gem badges at the top of `README.md` will start working.

## Logo

The logo files are generated by Python scripts (using fontTools), and all
lettering is converted to vector outlines, so no fonts are needed to display them.
**Those scripts are not in the repo.** They were written in a temporary session
folder. To change the logos, rewrite the generators or edit the SVGs directly.

`logo.svg` contains a full copy of the emblem inline. If you change
`logo-emblem.svg`, rebuild `logo.svg` (and the favicons) to match.

### Wordmark (in `logo.svg`)

- "tsukiMOJi" in **Yuji Boku**, a Japanese brush-calligraphy font (SIL Open Font
  License), with slightly tight letter spacing and a thin matching stroke to
  thicken it. "tsuki" and "i" are gunmetal and "MOJ" is green.
- Below the name: a HUD-style divider (a green lead bar, a thin panel line, three
  gunmetal end ticks) and the tagline "MOON PHASE EMOJI FOR ANY DATE" in
  **Rajdhani SemiBold** (SIL Open Font License), letter-spaced.
- Transparent background with dark text, so it is hard to read on GitHub's dark
  theme. No dark-mode version exists yet.

### Emblem (in `logo-emblem.svg`, and inside `logo.svg`)

The 月 is from Yu Gothic Bold (`C:\Windows\Fonts\YuGothB.ttc`), a Microsoft
font with less clear terms for logo use than the open-licence fonts. It could
be swapped for Noto Sans JP.

Design: mecha-armour style (inspired by Gundam, no actual Gundam branding).
Mostly white with green highlights:
- a white octagonal armour plate with a gunmetal edge, green trim, panel lines and corner bolts
- a gunmetal chest plate in the center, with a green V-fin crest and 月 in white
  with a green offset shadow, plus a small "TSK-001" marking
- the 8 main moons are white-on-dark in octagonal sockets, clockwise from 🌑 at the top
- the smaller recursive rings are green "sensor light" moons on octagonal orbits.
  Each ring continues its parent's phase order and starts facing outward.

Palette: white `#ffffff`, armour shade `#e7ebee`, panel lines `#c3cbd1`,
gunmetal `#262d33`, green `#16a34a` / `#2fd277` / `#0b5a2b`. The favicon
drops the smaller rings and the marking, and uses a bigger chest plate.

## Git

- Commit and push only when asked.
