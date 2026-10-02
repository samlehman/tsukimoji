<p align="center">
  <img src="logo.svg" alt="Tsukimoji logo: the kanji 月 surrounded by rings of moon phases" width="220">
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
   cycle, centred on its exact point, so "Full Moon" covers the days on either
   side of the true full moon.
4. Work out illumination from the same fraction with a cosine curve:
   `(1 - cos(2π × fraction)) / 2`.

All three libraries use the same constants and formula, so they give the same
answer for the same moment.

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
