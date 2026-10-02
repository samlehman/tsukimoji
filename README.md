<p align="center">
  <img src="logo.svg" alt="tsukiMOJi logo: the kanji 月 on a white and green armoured plate, surrounded by rings of moon phases, next to the name tsukiMOJi in brush lettering" width="640">
</p>

# 🌕 Tsukimoji

[![npm](https://img.shields.io/npm/v/tsukimoji)](https://www.npmjs.com/package/tsukimoji)
[![PyPI](https://img.shields.io/pypi/v/tsukimoji)](https://pypi.org/project/tsukimoji/)
[![Gem](https://img.shields.io/gem/v/tsukimoji)](https://rubygems.org/gems/tsukimoji)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

**Moon phase emoji for any date.** 月 (*tsuki*, "moon") + *moji*, as in emoji.

Tsukimoji is a tiny, dependency-free library that tells you what the moon looks
like at any moment, as an emoji, a phase name, the moon's age in days, and how
much of it is lit. It is available for **JavaScript/TypeScript**, **Python**, and
**Ruby**, with the same algorithm and results in each.

```
🌑 → 🌒 → 🌓 → 🌔 → 🌕 → 🌖 → 🌗 → 🌘
```

## Contents

- [Packages](#packages)
- [JavaScript / TypeScript](#javascript--typescript)
- [Python](#python)
- [Ruby](#ruby)
- [The result](#the-result)
- [How it works](#how-it-works)
- [The math](#the-math)
- [Accuracy](#accuracy)
- [Development](#development)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Packages

| Language | Package | Install | Source |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `tsukimoji` on npm | `npm install tsukimoji` | [`npm/`](npm/) |
| Python (3.9+) | `tsukimoji` on PyPI | `pip install tsukimoji` | [`python/`](python/) |
| Ruby (2.7+) | `tsukimoji` gem | `gem install tsukimoji` | [`ruby/`](ruby/) |

## JavaScript / TypeScript

```
npm install tsukimoji
```

Works with both CommonJS and ES modules, and ships with TypeScript types.
Requires Node.js 14 or later.

```js
const { getMoonPhase, emoji, name } = require("tsukimoji");
// or: import { getMoonPhase, emoji, name } from "tsukimoji";

const phase = getMoonPhase();
phase.emoji;        // "🌔"
phase.name;         // "Waxing Gibbous"
phase.ageDays;      // 12.3
phase.illumination; // 0.87

emoji();            // "🌔"  (just the emoji, for now)
name();             // "Waxing Gibbous"

getMoonPhase(new Date("2026-01-01T00:00:00Z")); // any specific date
```

| Export | Description |
| --- | --- |
| `getMoonPhase(date?)` | Full result for `date` (defaults to now). |
| `emoji(date?)` | Just the emoji. |
| `name(date?)` | Just the phase name. |
| `PHASES` | The eight `{ emoji, name }` phases, in order. |
| `SYNODIC_MONTH_DAYS` | Length of a lunar cycle, `29.530588853`. |
| `KNOWN_NEW_MOON_MS` | Reference new moon, as a Unix timestamp in milliseconds. |

## Python

```
pip install tsukimoji
```

```python
from datetime import datetime, timezone
from tsukimoji import get_moon_phase, emoji, name

phase = get_moon_phase()
phase.emoji          # "🌔"
phase.name           # "Waxing Gibbous"
phase.age_days       # 12.3
phase.illumination   # 0.87
str(phase)           # "🌔"

emoji()              # "🌔"  (just the emoji, for now)
name()               # "Waxing Gibbous"

get_moon_phase(datetime(2026, 1, 1, tzinfo=timezone.utc))  # any specific time
```

A naive `datetime` (one without a timezone) is treated as UTC. The result is a
frozen `MoonPhase` dataclass.

| Name | Description |
| --- | --- |
| `get_moon_phase(when=None)` | Full `MoonPhase` for `when` (defaults to now). |
| `emoji(when=None)` | Just the emoji. |
| `name(when=None)` | Just the phase name. |
| `PHASES` | Tuple of the eight `(emoji, name)` pairs, in order. |
| `SYNODIC_MONTH_DAYS` | Length of a lunar cycle, `29.530588853`. |
| `KNOWN_NEW_MOON` | Reference new moon, as a UTC `datetime`. |

## Ruby

```
gem install tsukimoji
```

Or add it to your `Gemfile`:

```ruby
gem "tsukimoji"
```

```ruby
require "tsukimoji"

phase = Tsukimoji.phase
phase.emoji         # => "🌔"
phase.name          # => "Waxing Gibbous"
phase.age_days      # => 12.3
phase.illumination  # => 0.87
phase.to_s          # => "🌔"

Tsukimoji.emoji     # => "🌔"  (just the emoji, for now)
Tsukimoji.name      # => "Waxing Gibbous"

Tsukimoji.phase(Time.utc(2026, 1, 1)) # any specific time
```

| Name | Description |
| --- | --- |
| `Tsukimoji.phase(time = Time.now.utc)` | Full `Tsukimoji::Phase` for `time`. |
| `Tsukimoji.emoji(time = Time.now.utc)` | Just the emoji. |
| `Tsukimoji.name(time = Time.now.utc)` | Just the phase name. |
| `Tsukimoji::PHASES` | Array of the eight `{ emoji:, name: }` phases, in order. |
| `Tsukimoji::SYNODIC_MONTH_DAYS` | Length of a lunar cycle, `29.530588853`. |
| `Tsukimoji::KNOWN_NEW_MOON` | Reference new moon, as a UTC `Time`. |

## The result

Every language returns the same four fields. Only the naming style changes
(`ageDays` in JavaScript, `age_days` in Python and Ruby).

| Field | Type | Example | Meaning |
| --- | --- | --- | --- |
| `emoji` | string | `"🌔"` | One of the eight moon-phase emoji. |
| `name` | string | `"Waxing Gibbous"` | English name of the phase. |
| `ageDays` / `age_days` | number | `12.3` | Days since the last new moon (0 to about 29.53). |
| `illumination` | number | `0.87` | Fraction of the moon that is lit (0 = new, 1 = full). |

The eight phases:

| Emoji | Name |
| --- | --- |
| 🌑 | New Moon |
| 🌒 | Waxing Crescent |
| 🌓 | First Quarter |
| 🌔 | Waxing Gibbous |
| 🌕 | Full Moon |
| 🌖 | Waning Gibbous |
| 🌗 | Last Quarter |
| 🌘 | Waning Crescent |

## How it works

1. Measure how much time has passed since a known new moon (2000-01-06 18:14 UTC).
2. Divide by the average length of a lunar cycle, the synodic month
   (29.530588853 days). The fractional part says how far into the current cycle
   that moment falls, from 0 (new moon) to just under 1.
3. Map that fraction onto the eight phases. Each phase covers an eighth of the
   cycle, centered on its exact point, so "Full Moon" covers the days on either
   side of the true full moon.
4. Work out illumination from the same fraction with a cosine curve:
   `(1 - cos(2π × fraction)) / 2`.

All three libraries use the same constants and formula, so they give the same
answer for the same moment.

## The maths

The whole calculation is four short formulas.

**1. Days since the reference new moon.** With `t` the moment you ask about and
`ref` = 2000-01-06 18:14 UTC:

```
days = (t − ref) / 86 400 seconds
```

This can be negative for dates before 2000. That's fine.

**2. Age as a fraction of the cycle.** One synodic month (new moon to new moon)
averages `S = 29.530588853` days. Dividing by it counts cycles since the
reference; the whole part is how many full cycles have passed, and the
fractional part is where we are in the current one:

```
cycles = days / S
age    = cycles − floor(cycles)        → always in [0, 1)
ageDays = age × S                      → 0 to about 29.53
```

Using `floor` (not truncation) keeps `age` in `[0, 1)` for negative `days` too.
`age` is effectively the angle between the sun and moon as seen from Earth:
0 is new moon, 0.25 first quarter, 0.5 full moon, 0.75 last quarter.

**3. Phase index.** Eight phases, so each one gets 1/8 of the cycle. Without
correction, `floor(age × 8)` would make "New Moon" start *at* the new moon and
run 3.7 days after it. Instead, shifting by half a slot (1/16) centers each
phase on its exact point:

```
index = floor((age + 1/16) × 8) mod 8
```

| Index | Phase | `age` range | Days into cycle |
| --- | --- | --- | --- |
| 0 | 🌑 New Moon | 15/16 – 1/16 (wraps) | 27.68 – 1.85 |
| 1 | 🌒 Waxing Crescent | 1/16 – 3/16 | 1.85 – 5.54 |
| 2 | 🌓 First Quarter | 3/16 – 5/16 | 5.54 – 9.23 |
| 3 | 🌔 Waxing Gibbous | 5/16 – 7/16 | 9.23 – 12.92 |
| 4 | 🌕 Full Moon | 7/16 – 9/16 | 12.92 – 16.61 |
| 5 | 🌖 Waning Gibbous | 9/16 – 11/16 | 16.61 – 20.30 |
| 6 | 🌗 Last Quarter | 11/16 – 13/16 | 20.30 – 23.99 |
| 7 | 🌘 Waning Crescent | 13/16 – 15/16 | 23.99 – 27.68 |

The `mod 8` folds the last half-slot (age ≥ 15/16, the days just before the
next new moon) back into New Moon.

**4. Illumination.** Treat the moon as a sphere lit from one side, with the
sun–moon angle `θ = 2π × age`. The lit fraction of the visible disc is:

```
illumination = (1 − cos θ) / 2
```

This is 0 at new moon (cos 0 = 1), 0.5 at the quarters (cos 90° = 0), and 1 at
full moon (cos 180° = −1). It follows a smooth S-curve, so the moon brightens
slowly near new and full and fastest around the quarters.

### Worked example: 2026-01-01 00:00 UTC

```
days          = 9491.2403
cycles        = 9491.2403 / 29.530588853 = 321.4037
age           = 0.4037                    → ageDays = 11.92
index         = floor((0.4037 + 0.0625) × 8) mod 8 = floor(3.73) = 3   → 🌔 Waxing Gibbous
illumination  = (1 − cos(2π × 0.4037)) / 2 = 0.911
```

So just under three days before full moon (at 14.77 days), about 91% lit.

## Accuracy

Tsukimoji uses the *average* length of a lunar cycle. The real moon speeds up
and slows down along its orbit, so actual phase times can differ from this
estimate by more than half a day. That is plenty for showing an emoji, but
if you need exact phase times (for astronomy, tides, or religious calendars),
use a full ephemeris library instead.

The emoji show the moon as seen from the **Northern Hemisphere**. From the
Southern Hemisphere it appears mirrored left to right.

## Development

Each library lives in its own folder and has its own tests, with no extra
dependencies needed to run them.

```sh
# JavaScript
cd npm && npm test

# Python
cd python && python -m unittest discover tests

# Ruby
cd ruby && ruby spec/tsukimoji_spec.rb
```

If you change the algorithm, change it in all three languages and make sure
every test suite still passes, so the libraries keep giving identical results.

## Roadmap

Ideas for future versions, based on what other moon-phase libraries commonly
offer:

- [ ] **Next and previous phases**: dates of the next full moon, new moon, and quarters.
- [ ] **Phase calendar**: phases for every day of a month or year.
- [ ] **Southern Hemisphere option**: flip waxing and waning emoji.
- [ ] **Moon face emoji**: alternative set using 🌚 and 🌝.
- [ ] **Translated phase names**: starting with Japanese (新月, 満月, and so on).
- [ ] **Command-line tool**: e.g. `npx tsukimoji` printing tonight's moon.
- [ ] **Higher-accuracy mode**: correct for the moon's elliptical orbit.
- [ ] **Moon distance and zodiac sign**: extra fields other libraries often include.
- [ ] **Shared test fixtures**: one set of known dates and phases checked by all three languages.

## Contributing

Issues and pull requests are welcome. For any change that affects results,
please update all three libraries and their tests together.

## License

[MIT](LICENSE)
